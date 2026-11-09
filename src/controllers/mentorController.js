const pool = require('../config/db');
const { computeMentorMatch } = require('../services/matchingService');

async function getMentorRecommendations(req, res) {
  try {
    const projectId = req.params.projectId;

    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const project = projects[0];

    // Get all mentors
    const [mentors] = await pool.query(
      `SELECT id, name, email, institution, department, bio, expertise, skills, experience_years, availability_status, max_capacity 
       FROM users WHERE role = 'mentor'`
    );

    // Get existing pending or accepted requests for this project
    const [existingRequests] = await pool.query(
      'SELECT mentor_id, status FROM mentor_requests WHERE project_id = ?',
      [projectId]
    );
    const requestStatusMap = {};
    existingRequests.forEach(r => {
      requestStatusMap[r.mentor_id] = r.status;
    });

    // Count currently assigned active projects per mentor
    const [activeCounts] = await pool.query(
      `SELECT assigned_mentor_id, COUNT(*) AS count 
       FROM projects 
       WHERE assigned_mentor_id IS NOT NULL 
       GROUP BY assigned_mentor_id`
    );
    const capacityMap = {};
    activeCounts.forEach(c => {
      capacityMap[c.assigned_mentor_id] = c.count;
    });

    const recommendations = mentors.map(m => {
      const currentAssigned = capacityMap[m.id] || 0;
      const match = computeMentorMatch(project, m, currentAssigned);
      return {
        ...match,
        request_status: requestStatusMap[m.id] || null,
        is_assigned: project.assigned_mentor_id === m.id
      };
    });

    // Sort by match score descending
    recommendations.sort((a, b) => b.match_score - a.match_score);

    return res.json({ recommendations, assigned_mentor_id: project.assigned_mentor_id });
  } catch (err) {
    console.error('getMentorRecommendations error:', err);
    return res.status(500).json({ error: 'Failed to compute mentor recommendations' });
  }
}

async function requestMentor(req, res) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const projectId = req.params.projectId;
    const { mentor_id, request_message } = req.body;

    if (!mentor_id) {
      await conn.rollback();
      return res.status(400).json({ error: 'Mentor ID is required' });
    }

    const [projects] = await conn.query('SELECT * FROM projects WHERE id = ? AND student_id = ?', [projectId, req.user.id]);
    if (projects.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Project not found or not owned by you' });
    }
    const project = projects[0];

    const [mentors] = await conn.query('SELECT * FROM users WHERE id = ? AND role = "mentor"', [mentor_id]);
    if (mentors.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Mentor not found' });
    }
    const mentor = mentors[0];

    // Check if mentor is at max capacity
    const [capacityRows] = await conn.query(
      'SELECT COUNT(*) AS assigned_count FROM projects WHERE assigned_mentor_id = ?',
      [mentor_id]
    );
    const assignedCount = capacityRows[0]?.assigned_count || 0;
    if (assignedCount >= (mentor.max_capacity || 5)) {
      await conn.rollback();
      return res.status(400).json({ error: 'This mentor is currently at full capacity for student projects.' });
    }

    // Check if a pending or accepted request already exists
    const [existing] = await conn.query(
      'SELECT id, status FROM mentor_requests WHERE project_id = ? AND mentor_id = ?',
      [projectId, mentor_id]
    );
    if (existing.length > 0) {
      const status = existing[0].status;
      if (status === 'pending') {
        await conn.rollback();
        return res.status(400).json({ error: 'A mentorship request is already pending with this mentor.' });
      }
      if (status === 'accepted') {
        await conn.rollback();
        return res.status(400).json({ error: 'This mentor has already accepted your project.' });
      }
    }

    // Compute match score and explanation
    const match = computeMentorMatch(project, mentor, assignedCount);

    await conn.query(
      `INSERT INTO mentor_requests 
       (project_id, student_id, mentor_id, match_score, match_explanation, status, request_message)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [
        projectId,
        req.user.id,
        mentor_id,
        match.match_score,
        match.explanation,
        request_message ? request_message.trim() : 'I would like to request your guidance on this research project.'
      ]
    );

    // Update project stage
    if (project.current_stage === 'submission' || project.current_stage === 'validation') {
      await conn.query('UPDATE projects SET current_stage = "mentor_matching" WHERE id = ?', [projectId]);
    }

    await conn.commit();
    return res.status(201).json({ message: 'Mentorship request sent successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('requestMentor error:', err);
    return res.status(500).json({ error: 'Failed to submit mentor request' });
  } finally {
    conn.release();
  }
}

async function getIncomingRequests(req, res) {
  try {
    const [requests] = await pool.query(
      `SELECT mr.*, 
              p.title AS project_title, p.domain AS project_domain, p.status AS project_status, p.current_stage,
              u.name AS student_name, u.email AS student_email, u.institution AS student_institution, u.department AS student_department
       FROM mentor_requests mr
       JOIN projects p ON mr.project_id = p.id
       JOIN users u ON mr.student_id = u.id
       WHERE mr.mentor_id = ?
       ORDER BY mr.created_at DESC`,
      [req.user.id]
    );
    return res.json({ requests });
  } catch (err) {
    console.error('getIncomingRequests error:', err);
    return res.status(500).json({ error: 'Failed to retrieve mentor requests' });
  }
}

async function respondToRequest(req, res) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const requestId = req.params.requestId;
    const { decision, response_message } = req.body;

    if (!['accepted', 'rejected'].includes(decision)) {
      await conn.rollback();
      return res.status(400).json({ error: 'Decision must be accepted or rejected' });
    }

    const [requests] = await conn.query('SELECT * FROM mentor_requests WHERE id = ? AND mentor_id = ?', [requestId, req.user.id]);
    if (requests.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Mentorship request not found' });
    }
    const request = requests[0];

    await conn.query(
      `UPDATE mentor_requests 
       SET status = ?, response_message = ?, updated_at = NOW() 
       WHERE id = ?`,
      [decision, response_message ? response_message.trim() : null, requestId]
    );

    if (decision === 'accepted') {
      // Assign mentor to project and advance stage to mentor_review
      await conn.query(
        `UPDATE projects 
         SET assigned_mentor_id = ?, status = 'under_review', current_stage = 'mentor_review', updated_at = NOW() 
         WHERE id = ?`,
        [req.user.id, request.project_id]
      );
    }

    await conn.commit();
    return res.json({ message: `Request ${decision} successfully` });
  } catch (err) {
    await conn.rollback();
    console.error('respondToRequest error:', err);
    return res.status(500).json({ error: 'Failed to update mentorship request' });
  } finally {
    conn.release();
  }
}

async function getAssignedProjects(req, res) {
  try {
    const [projects] = await pool.query(
      `SELECT p.*,
              u.name AS student_name, u.email AS student_email, u.institution AS student_institution,
              vr.overall_score AS validation_score, vr.overall_status AS validation_status,
              (SELECT COUNT(*) FROM research_papers rp WHERE rp.project_id = p.id) AS papers_count,
              (SELECT COUNT(*) FROM experiments exp WHERE exp.project_id = p.id) AS experiments_count,
              (SELECT review_decision FROM mentor_reviews mr WHERE mr.project_id = p.id ORDER BY mr.id DESC LIMIT 1) AS last_review_decision
       FROM projects p
       JOIN users u ON p.student_id = u.id
       LEFT JOIN validation_results vr ON vr.project_id = p.id
       WHERE p.assigned_mentor_id = ?
       ORDER BY p.updated_at DESC`,
      [req.user.id]
    );
    return res.json({ projects });
  } catch (err) {
    console.error('getAssignedProjects error:', err);
    return res.status(500).json({ error: 'Failed to load assigned projects' });
  }
}

async function submitReview(req, res) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const projectId = req.params.projectId;
    const {
      review_decision,
      general_feedback,
      strengths = '',
      weaknesses = '',
      recommended_actions = ''
    } = req.body;

    if (!review_decision || !general_feedback) {
      await conn.rollback();
      return res.status(400).json({ error: 'Review decision and general feedback are required' });
    }

    if (!['approved', 'revision_requested', 'rejected', 'feedback_only'].includes(review_decision)) {
      await conn.rollback();
      return res.status(400).json({ error: 'Invalid review decision option' });
    }

    const [projects] = await conn.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Project not found' });
    }

    await conn.query(
      `INSERT INTO mentor_reviews 
       (project_id, mentor_id, review_decision, general_feedback, strengths, weaknesses, recommended_actions)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        req.user.id,
        review_decision,
        general_feedback.trim(),
        strengths.trim(),
        weaknesses.trim(),
        recommended_actions.trim()
      ]
    );

    // Update project status according to decision
    let newStatus = projects[0].status;
    let newStage = projects[0].current_stage;

    if (review_decision === 'approved') {
      newStatus = 'approved';
      newStage = 'hypothesis_testing';
    } else if (review_decision === 'revision_requested') {
      newStatus = 'revision_requested';
    } else if (review_decision === 'rejected') {
      newStatus = 'draft';
    }

    await conn.query(
      'UPDATE projects SET status = ?, current_stage = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, newStage, projectId]
    );

    await conn.commit();
    return res.status(201).json({ message: 'Mentor review recorded successfully', status: newStatus, stage: newStage });
  } catch (err) {
    await conn.rollback();
    console.error('submitReview error:', err);
    return res.status(500).json({ error: 'Failed to record review' });
  } finally {
    conn.release();
  }
}

module.exports = {
  getMentorRecommendations,
  requestMentor,
  getIncomingRequests,
  respondToRequest,
  getAssignedProjects,
  submitReview
};
