const pool = require('../config/db');

async function createProject(req, res) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      title,
      domain,
      problem_statement,
      limitations = '',
      proposed_solution,
      objectives,
      technologies = '',
      expected_outcome = '',
      initial_hypothesis = ''
    } = req.body;

    if (!title || !domain || !problem_statement || !proposed_solution || !objectives) {
      await conn.rollback();
      return res.status(400).json({ error: 'Title, domain, problem statement, proposed solution, and objectives are required' });
    }

    const [result] = await conn.query(
      `INSERT INTO projects 
       (student_id, title, domain, problem_statement, limitations, proposed_solution, objectives, technologies, expected_outcome, initial_hypothesis, status, current_stage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 'submission')`,
      [
        req.user.id,
        title.trim(),
        domain.trim(),
        problem_statement.trim(),
        limitations.trim(),
        proposed_solution.trim(),
        objectives.trim(),
        technologies.trim(),
        expected_outcome.trim(),
        initial_hypothesis.trim()
      ]
    );

    const projectId = result.insertId;

    // Automatically create Version 1
    await conn.query(
      `INSERT INTO project_versions 
       (project_id, version_number, title, domain, problem_statement, limitations, proposed_solution, objectives, technologies, change_summary)
       VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, 'Initial proposal submission')`,
      [
        projectId,
        title.trim(),
        domain.trim(),
        problem_statement.trim(),
        limitations.trim(),
        proposed_solution.trim(),
        objectives.trim(),
        technologies.trim()
      ]
    );

    // If initial hypothesis provided, create in hypotheses table
    if (initial_hypothesis && initial_hypothesis.trim()) {
      await conn.query(
        `INSERT INTO hypotheses (project_id, statement, rationale, status)
         VALUES (?, ?, 'Derived from initial project submission', 'draft')`,
        [projectId, initial_hypothesis.trim()]
      );
    }

    await conn.commit();

    return res.status(201).json({
      message: 'Project created successfully',
      projectId
    });
  } catch (err) {
    await conn.rollback();
    console.error('createProject error:', err);
    return res.status(500).json({ error: 'Failed to create project' });
  } finally {
    conn.release();
  }
}

async function getStudentProjects(req, res) {
  try {
    const [projects] = await pool.query(
      `SELECT p.*, 
              u.name AS mentor_name,
              vr.overall_score AS validation_score,
              vr.overall_status AS validation_status,
              (SELECT COUNT(*) FROM research_papers rp WHERE rp.project_id = p.id) AS papers_count,
              (SELECT COUNT(*) FROM experiments exp WHERE exp.project_id = p.id) AS experiments_count,
              (SELECT status FROM mentor_requests mr WHERE mr.project_id = p.id ORDER BY mr.id DESC LIMIT 1) AS request_status
       FROM projects p
       LEFT JOIN users u ON p.assigned_mentor_id = u.id
       LEFT JOIN validation_results vr ON vr.project_id = p.id
       WHERE p.student_id = ?
       ORDER BY p.updated_at DESC`,
      [req.user.id]
    );

    return res.json({ projects });
  } catch (err) {
    console.error('getStudentProjects error:', err);
    return res.status(500).json({ error: 'Failed to retrieve student projects' });
  }
}

async function getProjectById(req, res) {
  try {
    const projectId = req.params.id;

    const [projects] = await pool.query(
      `SELECT p.*,
              s.name AS student_name, s.email AS student_email, s.institution AS student_institution, s.department AS student_department,
              m.name AS mentor_name, m.email AS mentor_email, m.institution AS mentor_institution, m.department AS mentor_department, m.expertise AS mentor_expertise
       FROM projects p
       JOIN users s ON p.student_id = s.id
       LEFT JOIN users m ON p.assigned_mentor_id = m.id
       WHERE p.id = ?`,
      [projectId]
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projects[0];

    // Check authorization: must be the student, or a mentor, or if project assigned to this mentor
    if (req.user.role === 'student' && project.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    // Fetch related records: papers, validation, mentor request, reviews, hypotheses, experiments
    const [papers] = await pool.query('SELECT * FROM research_papers WHERE project_id = ? ORDER BY id DESC', [projectId]);
    const [validations] = await pool.query('SELECT * FROM validation_results WHERE project_id = ?', [projectId]);
    const [requests] = await pool.query(
      `SELECT mr.*, u.name AS mentor_name, u.expertise AS mentor_expertise 
       FROM mentor_requests mr
       JOIN users u ON mr.mentor_id = u.id
       WHERE mr.project_id = ? ORDER BY mr.id DESC`,
      [projectId]
    );
    const [reviews] = await pool.query(
      `SELECT r.*, u.name AS mentor_name 
       FROM mentor_reviews r 
       JOIN users u ON r.mentor_id = u.id 
       WHERE r.project_id = ? ORDER BY r.id DESC`,
      [projectId]
    );
    const [hypotheses] = await pool.query('SELECT * FROM hypotheses WHERE project_id = ? ORDER BY id ASC', [projectId]);
    const [experiments] = await pool.query('SELECT * FROM experiments WHERE project_id = ? ORDER BY id ASC', [projectId]);
    const [versions] = await pool.query('SELECT id, version_number, change_summary, created_at FROM project_versions WHERE project_id = ? ORDER BY version_number DESC', [projectId]);

    return res.json({
      project,
      papers,
      validation: validations[0] || null,
      requests,
      reviews,
      hypotheses,
      experiments,
      versions
    });
  } catch (err) {
    console.error('getProjectById error:', err);
    return res.status(500).json({ error: 'Failed to load project details' });
  }
}

async function updateProject(req, res) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const projectId = req.params.id;

    // Check project ownership
    const [existing] = await conn.query('SELECT * FROM projects WHERE id = ? AND student_id = ?', [projectId, req.user.id]);
    if (existing.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Project not found or not owned by you' });
    }

    const current = existing[0];
    const {
      title,
      domain,
      problem_statement,
      limitations,
      proposed_solution,
      objectives,
      technologies,
      expected_outcome,
      initial_hypothesis,
      status,
      current_stage,
      change_summary = 'Updated project details'
    } = req.body;

    const newTitle = title !== undefined ? title.trim() : current.title;
    const newDomain = domain !== undefined ? domain.trim() : current.domain;
    const newProblem = problem_statement !== undefined ? problem_statement.trim() : current.problem_statement;
    const newLimitations = limitations !== undefined ? limitations.trim() : current.limitations;
    const newSolution = proposed_solution !== undefined ? proposed_solution.trim() : current.proposed_solution;
    const newObjectives = objectives !== undefined ? objectives.trim() : current.objectives;
    const newTech = technologies !== undefined ? technologies.trim() : current.technologies;
    const newOutcome = expected_outcome !== undefined ? expected_outcome.trim() : current.expected_outcome;
    const newHypo = initial_hypothesis !== undefined ? initial_hypothesis.trim() : current.initial_hypothesis;
    const newStatus = status !== undefined ? status : current.status;
    const newStage = current_stage !== undefined ? current_stage : current.current_stage;

    // Check if meaningful revision occurred to create a version
    const isMeaningfulChange =
      newProblem !== current.problem_statement ||
      newSolution !== current.proposed_solution ||
      newObjectives !== current.objectives ||
      req.body.create_version === true;

    await conn.query(
      `UPDATE projects 
       SET title = ?, domain = ?, problem_statement = ?, limitations = ?, proposed_solution = ?,
           objectives = ?, technologies = ?, expected_outcome = ?, initial_hypothesis = ?,
           status = ?, current_stage = ?, updated_at = NOW()
       WHERE id = ?`,
      [newTitle, newDomain, newProblem, newLimitations, newSolution, newObjectives, newTech, newOutcome, newHypo, newStatus, newStage, projectId]
    );

    if (isMeaningfulChange) {
      // Get highest version number
      const [vRows] = await conn.query(
        'SELECT COALESCE(MAX(version_number), 1) AS max_v FROM project_versions WHERE project_id = ?',
        [projectId]
      );
      const nextVersion = (vRows[0]?.max_v || 1) + 1;

      await conn.query(
        `INSERT INTO project_versions 
         (project_id, version_number, title, domain, problem_statement, limitations, proposed_solution, objectives, technologies, change_summary)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [projectId, nextVersion, newTitle, newDomain, newProblem, newLimitations, newSolution, newObjectives, newTech, change_summary]
      );
    }

    await conn.commit();
    return res.json({ message: 'Project updated successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('updateProject error:', err);
    return res.status(500).json({ error: 'Failed to update project' });
  } finally {
    conn.release();
  }
}

async function deleteProject(req, res) {
  try {
    const projectId = req.params.id;
    const [result] = await pool.query('DELETE FROM projects WHERE id = ? AND student_id = ?', [projectId, req.user.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found or not owned by you' });
    }
    return res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('deleteProject error:', err);
    return res.status(500).json({ error: 'Failed to delete project' });
  }
}

module.exports = {
  createProject,
  getStudentProjects,
  getProjectById,
  updateProject,
  deleteProject
};
