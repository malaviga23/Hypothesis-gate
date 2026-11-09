const pool = require('../config/db');

async function createHypothesis(req, res) {
  try {
    const projectId = req.params.projectId;
    const { statement, rationale, status = 'draft' } = req.body;

    if (!statement) {
      return res.status(400).json({ error: 'Hypothesis statement is required' });
    }

    const [resHypo] = await pool.query(
      `INSERT INTO hypotheses (project_id, statement, rationale, status) VALUES (?, ?, ?, ?)`,
      [projectId, statement.trim(), rationale ? rationale.trim() : null, status]
    );

    return res.status(201).json({
      message: 'Hypothesis recorded successfully',
      hypothesisId: resHypo.insertId
    });
  } catch (err) {
    console.error('createHypothesis error:', err);
    return res.status(500).json({ error: 'Failed to record hypothesis' });
  }
}

async function getHypotheses(req, res) {
  try {
    const projectId = req.params.projectId;
    const [hypotheses] = await pool.query(
      'SELECT * FROM hypotheses WHERE project_id = ? ORDER BY id ASC',
      [projectId]
    );
    return res.json({ hypotheses });
  } catch (err) {
    console.error('getHypotheses error:', err);
    return res.status(500).json({ error: 'Failed to retrieve hypotheses' });
  }
}

async function createExperiment(req, res) {
  try {
    const projectId = req.params.projectId;
    const {
      hypothesis_id,
      title,
      procedure_steps,
      evaluation_metric,
      success_criteria,
      observations = '',
      quantitative_data = null,
      result_outcome = 'pending',
      conclusion = ''
    } = req.body;

    if (!hypothesis_id || !title || !procedure_steps || !evaluation_metric || !success_criteria) {
      return res.status(400).json({
        error: 'Hypothesis ID, title, procedure steps, evaluation metric, and success criteria are required'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO experiments 
       (hypothesis_id, project_id, title, procedure_steps, evaluation_metric, success_criteria, observations, quantitative_data, result_outcome, conclusion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hypothesis_id,
        projectId,
        title.trim(),
        procedure_steps.trim(),
        evaluation_metric.trim(),
        success_criteria.trim(),
        observations ? observations.trim() : null,
        quantitative_data ? (typeof quantitative_data === 'string' ? quantitative_data : JSON.stringify(quantitative_data)) : null,
        result_outcome,
        conclusion ? conclusion.trim() : null
      ]
    );

    return res.status(201).json({ message: 'Experiment recorded successfully', experimentId: result.insertId });
  } catch (err) {
    console.error('createExperiment error:', err);
    return res.status(500).json({ error: 'Failed to record experiment' });
  }
}

async function getExperiments(req, res) {
  try {
    const projectId = req.params.projectId;
    const [experiments] = await pool.query(
      `SELECT e.*, h.statement AS hypothesis_statement 
       FROM experiments e
       JOIN hypotheses h ON e.hypothesis_id = h.id
       WHERE e.project_id = ? 
       ORDER BY e.id ASC`,
      [projectId]
    );
    return res.json({ experiments });
  } catch (err) {
    console.error('getExperiments error:', err);
    return res.status(500).json({ error: 'Failed to retrieve experiments' });
  }
}

async function updateExperiment(req, res) {
  try {
    const experimentId = req.params.experimentId;
    const {
      title,
      procedure_steps,
      evaluation_metric,
      success_criteria,
      observations,
      quantitative_data,
      result_outcome,
      conclusion
    } = req.body;

    await pool.query(
      `UPDATE experiments 
       SET title = COALESCE(?, title),
           procedure_steps = COALESCE(?, procedure_steps),
           evaluation_metric = COALESCE(?, evaluation_metric),
           success_criteria = COALESCE(?, success_criteria),
           observations = COALESCE(?, observations),
           quantitative_data = COALESCE(?, quantitative_data),
           result_outcome = COALESCE(?, result_outcome),
           conclusion = COALESCE(?, conclusion),
           updated_at = NOW()
       WHERE id = ?`,
      [
        title,
        procedure_steps,
        evaluation_metric,
        success_criteria,
        observations,
        quantitative_data ? (typeof quantitative_data === 'string' ? quantitative_data : JSON.stringify(quantitative_data)) : null,
        result_outcome,
        conclusion,
        experimentId
      ]
    );

    return res.json({ message: 'Experiment updated successfully' });
  } catch (err) {
    console.error('updateExperiment error:', err);
    return res.status(500).json({ error: 'Failed to update experiment' });
  }
}

async function mentorReviewExperiment(req, res) {
  try {
    const experimentId = req.params.experimentId;
    const { mentor_notes } = req.body;

    await pool.query(
      `UPDATE experiments 
       SET mentor_reviewed = TRUE, mentor_notes = ?, updated_at = NOW() 
       WHERE id = ?`,
      [mentor_notes ? mentor_notes.trim() : 'Reviewed and approved by mentor', experimentId]
    );

    return res.json({ message: 'Mentor feedback on experiment saved' });
  } catch (err) {
    console.error('mentorReviewExperiment error:', err);
    return res.status(500).json({ error: 'Failed to save mentor feedback on experiment' });
  }
}

module.exports = {
  createHypothesis,
  getHypotheses,
  createExperiment,
  getExperiments,
  updateExperiment,
  mentorReviewExperiment
};
