const pool = require('../config/db');
const { validateProject } = require('../services/validationService');

async function runValidation(req, res) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const projectId = req.params.projectId;

    const [projects] = await conn.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projects[0];

    // Check permissions
    if (req.user.role === 'student' && project.student_id !== req.user.id) {
      await conn.rollback();
      return res.status(403).json({ error: 'Access denied' });
    }

    const [papers] = await conn.query('SELECT * FROM research_papers WHERE project_id = ?', [projectId]);

    // Run rules-based 5-dimension validation
    const evaluation = validateProject(project, papers);

    // Upsert validation_results table
    const [existing] = await conn.query('SELECT id FROM validation_results WHERE project_id = ?', [projectId]);

    if (existing.length > 0) {
      await conn.query(
        `UPDATE validation_results 
         SET problem_clarity_score = ?, problem_clarity_feedback = ?,
             research_support_score = ?, research_support_feedback = ?,
             originality_score = ?, originality_feedback = ?,
             feasibility_score = ?, feasibility_feedback = ?,
             testability_score = ?, testability_feedback = ?,
             overall_score = ?, overall_status = ?,
             missing_info = ?, recommended_improvements = ?,
             updated_at = NOW()
         WHERE project_id = ?`,
        [
          evaluation.dimensions.problem_clarity.score,
          evaluation.dimensions.problem_clarity.explanation,
          evaluation.dimensions.research_support.score,
          evaluation.dimensions.research_support.explanation,
          evaluation.dimensions.potential_originality.score,
          evaluation.dimensions.potential_originality.explanation,
          evaluation.dimensions.technical_feasibility.score,
          evaluation.dimensions.technical_feasibility.explanation,
          evaluation.dimensions.testability.score,
          evaluation.dimensions.testability.explanation,
          evaluation.overall_score,
          evaluation.overall_status,
          JSON.stringify(evaluation.missing_info),
          JSON.stringify(evaluation.recommended_improvements),
          projectId
        ]
      );
    } else {
      await conn.query(
        `INSERT INTO validation_results 
         (project_id, problem_clarity_score, problem_clarity_feedback,
          research_support_score, research_support_feedback,
          originality_score, originality_feedback,
          feasibility_score, feasibility_feedback,
          testability_score, testability_feedback,
          overall_score, overall_status, missing_info, recommended_improvements)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          projectId,
          evaluation.dimensions.problem_clarity.score,
          evaluation.dimensions.problem_clarity.explanation,
          evaluation.dimensions.research_support.score,
          evaluation.dimensions.research_support.explanation,
          evaluation.dimensions.potential_originality.score,
          evaluation.dimensions.potential_originality.explanation,
          evaluation.dimensions.technical_feasibility.score,
          evaluation.dimensions.technical_feasibility.explanation,
          evaluation.dimensions.testability.score,
          evaluation.dimensions.testability.explanation,
          evaluation.overall_score,
          evaluation.overall_status,
          JSON.stringify(evaluation.missing_info),
          JSON.stringify(evaluation.recommended_improvements)
        ]
      );
    }

    // Advance stage to 'validation' if at earlier stage
    if (['submission', 'research'].includes(project.current_stage)) {
      await conn.query('UPDATE projects SET current_stage = "validation" WHERE id = ?', [projectId]);
    }

    await conn.commit();
    return res.json({ message: 'Validation analysis completed successfully', evaluation });
  } catch (err) {
    await conn.rollback();
    console.error('runValidation error:', err);
    return res.status(500).json({ error: 'Failed to run evidence validation' });
  } finally {
    conn.release();
  }
}

async function getValidation(req, res) {
  try {
    const projectId = req.params.projectId;
    const [rows] = await pool.query('SELECT * FROM validation_results WHERE project_id = ?', [projectId]);
    if (rows.length === 0) {
      return res.json({ validation: null });
    }
    return res.json({ validation: rows[0] });
  } catch (err) {
    console.error('getValidation error:', err);
    return res.status(500).json({ error: 'Failed to retrieve validation results' });
  }
}

module.exports = {
  runValidation,
  getValidation
};
