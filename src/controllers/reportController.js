const pool = require('../config/db');
const { generateProjectReport } = require('../services/pdfService');

async function getReportData(req, res) {
  try {
    const projectId = req.params.projectId;

    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const project = projects[0];

    // Check authorization
    if (req.user.role === 'student' && project.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [students] = await pool.query('SELECT id, name, email, institution, department FROM users WHERE id = ?', [project.student_id]);
    let mentor = null;
    if (project.assigned_mentor_id) {
      const [mentors] = await pool.query('SELECT id, name, email, institution, department, expertise FROM users WHERE id = ?', [project.assigned_mentor_id]);
      mentor = mentors[0] || null;
    }

    const [papers] = await pool.query('SELECT * FROM research_papers WHERE project_id = ? ORDER BY id ASC', [projectId]);
    const [validations] = await pool.query('SELECT * FROM validation_results WHERE project_id = ?', [projectId]);
    const [reviews] = await pool.query(
      `SELECT r.*, u.name AS mentor_name 
       FROM mentor_reviews r 
       JOIN users u ON r.mentor_id = u.id 
       WHERE r.project_id = ? ORDER BY r.id DESC LIMIT 1`,
      [projectId]
    );
    const [hypotheses] = await pool.query('SELECT * FROM hypotheses WHERE project_id = ? ORDER BY id ASC', [projectId]);
    const [experiments] = await pool.query('SELECT * FROM experiments WHERE project_id = ? ORDER BY id ASC', [projectId]);

    return res.json({
      project,
      student: students[0] || null,
      mentor,
      papers,
      validation: validations[0] || null,
      mentorReview: reviews[0] || null,
      hypotheses,
      experiments
    });
  } catch (err) {
    console.error('getReportData error:', err);
    return res.status(500).json({ error: 'Failed to retrieve report dossier data' });
  }
}

async function downloadReportPdf(req, res) {
  try {
    const projectId = req.params.projectId;

    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const project = projects[0];

    const [students] = await pool.query('SELECT id, name, email, institution, department FROM users WHERE id = ?', [project.student_id]);
    let mentor = null;
    if (project.assigned_mentor_id) {
      const [mentors] = await pool.query('SELECT id, name, email, institution, department, expertise FROM users WHERE id = ?', [project.assigned_mentor_id]);
      mentor = mentors[0] || null;
    }

    const [papers] = await pool.query('SELECT * FROM research_papers WHERE project_id = ? ORDER BY id ASC', [projectId]);
    const [validations] = await pool.query('SELECT * FROM validation_results WHERE project_id = ?', [projectId]);
    const [reviews] = await pool.query(
      `SELECT r.*, u.name AS mentor_name 
       FROM mentor_reviews r 
       JOIN users u ON r.mentor_id = u.id 
       WHERE r.project_id = ? ORDER BY r.id DESC LIMIT 1`,
      [projectId]
    );
    const [hypotheses] = await pool.query('SELECT * FROM hypotheses WHERE project_id = ? ORDER BY id ASC', [projectId]);
    const [experiments] = await pool.query('SELECT * FROM experiments WHERE project_id = ? ORDER BY id ASC', [projectId]);

    const sanitizedTitle = (project.title || 'ResearchProject')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="HypothesisGate_${sanitizedTitle}.pdf"`);

    generateProjectReport({
      project,
      student: students[0] || null,
      mentor,
      papers,
      validation: validations[0] || null,
      mentorReview: reviews[0] || null,
      hypotheses,
      experiments
    }, res);
  } catch (err) {
    console.error('downloadReportPdf error:', err);
    return res.status(500).json({ error: 'Failed to generate PDF report' });
  }
}

module.exports = {
  getReportData,
  downloadReportPdf
};
