const pool = require('../config/db');

async function getProjectVersions(req, res) {
  try {
    const projectId = req.params.projectId;
    const [versions] = await pool.query(
      `SELECT * FROM project_versions 
       WHERE project_id = ? 
       ORDER BY version_number ASC`,
      [projectId]
    );
    return res.json({ versions });
  } catch (err) {
    console.error('getProjectVersions error:', err);
    return res.status(500).json({ error: 'Failed to retrieve project version history' });
  }
}

async function getVersionById(req, res) {
  try {
    const { projectId, versionId } = req.params;
    const [versions] = await pool.query(
      `SELECT * FROM project_versions WHERE id = ? AND project_id = ?`,
      [versionId, projectId]
    );
    if (versions.length === 0) {
      return res.status(404).json({ error: 'Version not found' });
    }
    return res.json({ version: versions[0] });
  } catch (err) {
    console.error('getVersionById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve version details' });
  }
}

async function createManualSnapshot(req, res) {
  try {
    const projectId = req.params.projectId;
    const { change_summary } = req.body;

    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const p = projects[0];

    const [vRows] = await pool.query(
      'SELECT COALESCE(MAX(version_number), 0) AS max_v FROM project_versions WHERE project_id = ?',
      [projectId]
    );
    const nextV = (vRows[0]?.max_v || 0) + 1;

    await pool.query(
      `INSERT INTO project_versions 
       (project_id, version_number, title, domain, problem_statement, limitations, proposed_solution, objectives, technologies, change_summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        nextV,
        p.title,
        p.domain,
        p.problem_statement,
        p.limitations,
        p.proposed_solution,
        p.objectives,
        p.technologies,
        change_summary ? change_summary.trim() : `Manual checkpoint v${nextV}`
      ]
    );

    return res.status(201).json({ message: `Version v${nextV} captured successfully`, versionNumber: nextV });
  } catch (err) {
    console.error('createManualSnapshot error:', err);
    return res.status(500).json({ error: 'Failed to create version snapshot' });
  }
}

module.exports = {
  getProjectVersions,
  getVersionById,
  createManualSnapshot
};
