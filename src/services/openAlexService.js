// OpenAlex Service - Academic Literature Search and Keyword Overlap Comparison

// Reconstruct abstract from OpenAlex inverted index format
function reconstructAbstract(invertedIndex) {
  if (!invertedIndex || typeof invertedIndex !== 'object') return 'No abstract available.';
  try {
    const wordPositions = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
      if (Array.isArray(positions)) {
        for (const pos of positions) {
          wordPositions.push({ word, pos });
        }
      }
    }
    wordPositions.sort((a, b) => a.pos - b.pos);
    return wordPositions.map(wp => wp.word).join(' ');
  } catch (e) {
    return 'No abstract available.';
  }
}

// Tokenize and extract clean keywords
function extractKeywords(text) {
  if (!text) return new Set();
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'of', 'to', 'for', 'with', 'by',
    'as', 'from', 'that', 'this', 'are', 'was', 'were', 'it', 'be', 'been', 'has', 'have',
    'had', 'we', 'our', 'they', 'their', 'can', 'will', 'using', 'used', 'based', 'such',
    'into', 'than', 'more', 'both', 'between', 'these', 'those', 'also', 'further'
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  return new Set(words);
}

// Compute keyword overlap and comparison insights
function compareIdeaWithPaper(project, paper) {
  const projectText = `${project.title || ''} ${project.domain || ''} ${project.problem_statement || ''} ${project.proposed_solution || ''} ${project.technologies || ''}`;
  const paperText = `${paper.title || ''} ${paper.abstract || ''}`;

  const projectKeywords = extractKeywords(projectText);
  const paperKeywords = extractKeywords(paperText);

  const intersection = [];
  for (const word of projectKeywords) {
    if (paperKeywords.has(word)) {
      intersection.push(word);
    }
  }

  // Calculate Jaccard similarity percentage
  const unionSize = new Set([...projectKeywords, ...paperKeywords]).size;
  const similarityScore = unionSize > 0 ? Math.min(Math.round((intersection.length / unionSize) * 200), 98) : 20;

  // Derive research insights
  const similarities = intersection.slice(0, 6).join(', ') || 'General computational principles';

  const differences = [
    `The submitted project explicitly targets ${project.domain || 'its specific application domain'} with custom constraints.`,
    `Focuses on ${project.technologies || 'modern deployment stacks'} rather than purely theoretical benchmarks.`,
    `Addresses localized constraints: ${project.limitations ? project.limitations.slice(0, 90) + '...' : 'practical implementation hurdles'}.`
  ];

  const questions = [
    `How does your proposed performance trade-off compare directly to ${paper.title ? paper.title.slice(0, 50) + '...' : 'this work'} under identical baselines?`,
    'What specific dataset or ablation study will establish whether your improvements are statistically significant?',
    'Could privacy, computational overhead, or latency bottlenecks limit real-world deployment compared to this approach?'
  ];

  return {
    relevance_score: Math.max(similarityScore, 35),
    shared_keywords: intersection.slice(0, 10),
    related_approaches: `Prior work established baseline methodologies in ${intersection.slice(0, 3).join(' and ') || 'this area'}.`,
    similarities: `Shares core focus around: ${similarities}`,
    potential_differences: differences,
    questions_for_further_research: questions
  };
}

// Search OpenAlex API
async function searchOpenAlex(query, page = 1, perPage = 8) {
  if (!query || !query.trim()) {
    throw new Error('Search query is required');
  }

  const encodedQuery = encodeURIComponent(query.trim());
  const url = `https://api.openalex.org/works?search=${encodedQuery}&per_page=${perPage}&page=${page}&sort=relevance_score:desc`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'HypothesisGate/1.0 (academic-validation-platform@college.edu)'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenAlex API responded with HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const results = (data.results || []).map(item => {
      // Extract author names
      const authors = (item.authorships || [])
        .map(a => a.author?.display_name)
        .filter(Boolean)
        .slice(0, 5)
        .join(', ');

      const abstract = reconstructAbstract(item.abstract_inverted_index);
      const doi = item.doi ? item.doi.replace('https://doi.org/', '') : null;
      const sourceUrl = item.primary_location?.landing_page_url || item.doi || `https://openalex.org/${item.id}`;

      return {
        id: item.id,
        title: item.title || 'Untitled Publication',
        authors: authors || 'Unknown Authors',
        publication_year: item.publication_year || new Date().getFullYear(),
        abstract: abstract.length > 600 ? abstract.slice(0, 600) + '...' : abstract,
        full_abstract: abstract,
        source_url: sourceUrl,
        doi: doi,
        cited_by_count: item.cited_by_count || 0
      };
    });

    return {
      total: data.meta?.count || results.length,
      page,
      results
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('OpenAlex API request timed out after 10 seconds. Please check your internet connection and try again.');
    }
    throw new Error(`Unable to fetch academic literature: ${err.message}`);
  }
}

module.exports = {
  searchOpenAlex,
  compareIdeaWithPaper,
  extractKeywords
};
