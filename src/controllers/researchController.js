const pool = require('../config/db');
const { searchOpenAlex, compareIdeaWithPaper } = require('../services/openAlexService');

async function searchLiterature(req, res) {
  try {
    const { query, page = 1 } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const data = await searchOpenAlex(query, parseInt(page, 10));
    return res.json(data);
  } catch (err) {
    console.error('searchLiterature error:', err.message);
    return res.status(502).json({
      error: err.message || 'Unable to contact OpenAlex research repository. Please check your internet connection or try again.'
    });
  }
}

async function analyzePaperComparison(req, res) {
  try {
    const projectId = req.params.projectId;
    const { paper } = req.body;

    if (!paper || !paper.title) {
      return res.status(400).json({ error: 'Paper details are required for comparison' });
    }

    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const comparison = compareIdeaWithPaper(projects[0], paper);
    return res.json({ comparison });
  } catch (err) {
    console.error('analyzePaperComparison error:', err);
    return res.status(500).json({ error: 'Failed to generate comparison analysis' });
  }
}

async function savePaper(req, res) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const projectId = req.params.projectId;
    const {
      title,
      authors = '',
      publication_year = null,
      abstract = '',
      source_url = '',
      doi = '',
      relevance_score = 0,
      comparison_notes = ''
    } = req.body;

    if (!title) {
      await conn.rollback();
      return res.status(400).json({ error: 'Paper title is required' });
    }

    // Verify student owns project or is assigned mentor
    const [projects] = await conn.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Project not found' });
    }

    const [resPaper] = await conn.query(
      `INSERT INTO research_papers 
       (project_id, title, authors, publication_year, abstract, source_url, doi, relevance_score, comparison_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        title.trim(),
        authors ? authors.trim() : null,
        publication_year ? parseInt(publication_year, 10) : null,
        abstract ? abstract.trim() : null,
        source_url ? source_url.trim() : null,
        doi ? doi.trim() : null,
        parseInt(relevance_score || 0, 10),
        comparison_notes ? comparison_notes.trim() : null
      ]
    );

    const paperId = resPaper.insertId;

    await conn.query(
      `INSERT INTO project_research_papers (project_id, paper_id, notes) VALUES (?, ?, ?)`,
      [projectId, paperId, comparison_notes || 'Saved via OpenAlex Research Analysis']
    );

    // Update project stage to 'research' if currently 'submission'
    if (projects[0].current_stage === 'submission') {
      await conn.query('UPDATE projects SET current_stage = "research" WHERE id = ?', [projectId]);
    }

    await conn.commit();
    return res.status(201).json({ message: 'Paper linked successfully', paperId });
  } catch (err) {
    await conn.rollback();
    console.error('savePaper error:', err);
    return res.status(500).json({ error: 'Failed to save research paper' });
  } finally {
    conn.release();
  }
}

async function getSavedPapers(req, res) {
  try {
    const projectId = req.params.projectId;
    const [papers] = await pool.query(
      'SELECT * FROM research_papers WHERE project_id = ? ORDER BY id DESC',
      [projectId]
    );
    return res.json({ papers });
  } catch (err) {
    console.error('getSavedPapers error:', err);
    return res.status(500).json({ error: 'Failed to load research papers' });
  }
}

async function deletePaper(req, res) {
  try {
    const { projectId, paperId } = req.params;
    await pool.query('DELETE FROM research_papers WHERE id = ? AND project_id = ?', [paperId, projectId]);
    return res.json({ message: 'Paper removed from project' });
  } catch (err) {
    console.error('deletePaper error:', err);
    return res.status(500).json({ error: 'Failed to delete research paper' });
  }
}

module.exports = {
  searchLiterature,
  analyzePaperComparison,
  savePaper,
  getSavedPapers,
  deletePaper
};
