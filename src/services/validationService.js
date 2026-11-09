// Evidence Validation Service - Explainable Rules-Based Rubric

function evaluateProblemClarity(project) {
  const text = (project.problem_statement || '').trim();
  const limitations = (project.limitations || '').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  
  let score = 20;
  const missing = [];
  const improvements = [];

  if (wordCount >= 25) {
    score += 30;
  } else {
    missing.push('Detailed elaboration of the operational or theoretical problem context');
    improvements.push('Expand problem statement to at least 3-4 descriptive sentences detailing user or system pain points.');
  }

  if (limitations.length >= 20) {
    score += 30;
  } else {
    missing.push('Specific critique of current solutions and why existing approaches fail');
    improvements.push('Add an explicit breakdown of current system limitations (e.g., latency, cost, privacy, bias).');
  }

  const technicalPainPoints = ['latency', 'privacy', 'cost', 'security', 'overhead', 'scalability', 'accuracy', 'generalization', 'bottleneck', 'inefficiency', 'vulnerability', 'error'];
  const hasPainPoint = technicalPainPoints.some(kw => text.toLowerCase().includes(kw) || limitations.toLowerCase().includes(kw));

  if (hasPainPoint) {
    score += 20;
  } else {
    improvements.push('Mention concrete technical bottlenecks (such as communication overhead, accuracy loss, or security vulnerabilities).');
  }

  score = Math.min(score, 100);

  let explanation = '';
  if (score >= 80) {
    explanation = 'Excellent problem clarity. The proposal articulates why the problem matters, identifies real-world constraints, and pinpoints existing system shortcomings.';
  } else if (score >= 60) {
    explanation = 'Moderate clarity. The core problem is identified, but deeper contextual boundaries and specific limitations should be specified.';
  } else {
    explanation = 'Insufficient problem formulation. The problem statement is too concise or lacks explicit breakdown of existing deficiencies.';
  }

  return {
    score,
    status: score >= 80 ? 'Strong' : score >= 60 ? 'Moderate' : 'Needs Work',
    explanation,
    missing_info: missing,
    recommended_improvement: improvements[0] || 'Maintain current clarity throughout future iterations.'
  };
}

function evaluateResearchSupport(papers = []) {
  const count = papers.length;
  let score = 20;
  const missing = [];
  const improvements = [];

  if (count === 0) {
    return {
      score: 25,
      status: 'Insufficient evidence',
      explanation: 'Insufficient academic evidence. No peer-reviewed research papers or literature benchmarks have been linked to this project yet.',
      missing_info: ['At least 2-3 relevant literature citations or benchmark papers'],
      recommended_improvement: 'Search and link related papers using the Research Analysis module before seeking mentor review.'
    };
  }

  if (count === 1) {
    score = 60;
    missing.push('Broader comparative survey (single paper linked)');
    improvements.push('Link at least 2 additional related works to provide comparative baseline context.');
  } else if (count === 2) {
    score = 78;
    improvements.push('Add foundational or review papers covering theoretical limits of the approach.');
  } else {
    score = 90;
  }

  // Check recency
  const currentYear = new Date().getFullYear();
  const recentPapers = papers.filter(p => p.publication_year && (currentYear - p.publication_year <= 6));
  if (recentPapers.length > 0) {
    score += 8;
  }

  score = Math.min(score, 98);

  return {
    score,
    status: score >= 80 ? 'Strong' : score >= 60 ? 'Moderate' : 'Insufficient evidence',
    explanation: `Supported by ${count} peer-reviewed references (${recentPapers.length} recent works from the last 6 years). Provides grounded baseline awareness.`,
    missing_info: missing,
    recommended_improvement: improvements[0] || 'Keep literature citations updated as project methodology evolves.'
  };
}

function evaluatePotentialOriginality(project, papers = []) {
  const solution = (project.proposed_solution || '').trim();
  const wordCount = solution.split(/\s+/).filter(Boolean).length;
  let score = 30;
  const missing = [];
  const improvements = [];

  if (wordCount >= 30) {
    score += 25;
  } else {
    missing.push('Detailed architectural or algorithmic description of the proposed solution');
    improvements.push('Detail the architectural blocks or algorithmic steps that make your approach distinct.');
  }

  const noveltyKeywords = ['hybrid', 'adaptive', 'dynamic', 'lightweight', 'novel', 'decentralized', 'privacy-preserving', 'federated', 'pipeline', 'multi-tier', 'heuristic', 'cross-encoder', 'custom'];
  const matchedTerms = noveltyKeywords.filter(kw => solution.toLowerCase().includes(kw));

  if (matchedTerms.length >= 2) {
    score += 25;
  } else if (matchedTerms.length === 1) {
    score += 15;
  } else {
    improvements.push('Clarify the technical novelty: how does your methodology adapt, optimize, or improve on standard baselines?');
  }

  if (project.limitations && project.limitations.length > 30) {
    score += 15;
  }

  score = Math.min(score, 95);

  return {
    score,
    status: score >= 80 ? 'Strong' : score >= 60 ? 'Moderate' : 'Needs Work',
    explanation: `Proposes distinctive methodological mechanisms (${matchedTerms.slice(0, 3).join(', ') || 'context-specific adaptation'}). Distinguishes itself from standard off-the-shelf implementations.`,
    missing_info: missing,
    recommended_improvement: improvements[0] || 'Formulate an ablation study to pinpoint exactly which novel component creates the advantage.'
  };
}

function evaluateTechnicalFeasibility(project) {
  const tech = (project.technologies || '').trim();
  const objectives = (project.objectives || '').trim();
  let score = 25;
  const missing = [];
  const improvements = [];

  if (tech.length >= 10) {
    score += 35;
  } else {
    missing.push('Explicit list of programming languages, libraries, and runtime frameworks');
    improvements.push('Enumerate specific technologies (e.g., PyTorch, React, Node.js, Docker, FAISS).');
  }

  const lines = objectives.split('\n').filter(l => l.trim().length > 10);
  if (lines.length >= 3) {
    score += 30;
  } else {
    missing.push('Granular 3-4 phase milestone objectives');
    improvements.push('Break down project objectives into numbered phases: data pipeline, model/system implementation, and evaluation.');
  }

  if (project.expected_outcome && project.expected_outcome.length > 20) {
    score += 10;
  }

  score = Math.min(score, 95);

  return {
    score,
    status: score >= 80 ? 'Feasible' : score >= 60 ? 'Moderate' : 'Risky',
    explanation: 'Technical stack and phased objectives match student project scope within standard college lab resources.',
    missing_info: missing,
    recommended_improvement: improvements[0] || 'Verify hardware acceleration / GPU access requirements early.'
  };
}

function evaluateTestability(project) {
  const hypothesis = (project.initial_hypothesis || '').trim();
  const outcome = (project.expected_outcome || '').trim();
  let score = 25;
  const missing = [];
  const improvements = [];

  if (hypothesis.length >= 25) {
    score += 30;
  } else {
    missing.push('Formal initial hypothesis statement with independent and dependent variables');
    improvements.push('Formulate a verifiable hypothesis: e.g., "Method X achieves Y% improvement in metric Z under condition W."');
  }

  // Check for quantifiable signals (numbers, %, metrics)
  const metricKeywords = ['%', 'auc', 'f1', 'latency', 'accuracy', 'precision', 'recall', 'ms', 'seconds', 'speedup', 'reduction', 'margin', 'trade-off', 'loss'];
  const hasMetric = metricKeywords.some(m => hypothesis.toLowerCase().includes(m) || outcome.toLowerCase().includes(m));

  if (hasMetric) {
    score += 35;
  } else {
    missing.push('Quantitative target metrics (numerical threshold, accuracy %, or latency target)');
    improvements.push('Define concrete quantitative target metrics (e.g., AUC >= 0.85, latency < 100ms, 30% reduction).');
  }

  score = Math.min(score, 96);

  return {
    score,
    status: score >= 80 ? 'Highly Testable' : score >= 60 ? 'Testable' : 'Needs Formalization',
    explanation: hasMetric
      ? 'Strong testability with falsifiable claims and quantitative performance targets.'
      : 'Qualitative hypothesis only. Needs clear quantitative threshold to measure success vs failure.',
    missing_info: missing,
    recommended_improvement: improvements[0] || 'Define control vs experimental conditions in the Hypothesis Lab.'
  };
}

function validateProject(project, papers = []) {
  const problemClarity = evaluateProblemClarity(project);
  const researchSupport = evaluateResearchSupport(papers);
  const originality = evaluatePotentialOriginality(project, papers);
  const feasibility = evaluateTechnicalFeasibility(project);
  const testability = evaluateTestability(project);

  const overallScore = Math.round(
    (problemClarity.score + researchSupport.score + originality.score + feasibility.score + testability.score) / 5
  );

  let overallStatus = 'Needs Revision';
  if (papers.length === 0) {
    overallStatus = 'Insufficient Evidence (Missing Literature)';
  } else if (overallScore >= 80) {
    overallStatus = 'Validated — Ready for Mentorship';
  } else if (overallScore >= 60) {
    overallStatus = 'Conditionally Validated';
  }

  const allMissing = [
    ...problemClarity.missing_info,
    ...researchSupport.missing_info,
    ...originality.missing_info,
    ...feasibility.missing_info,
    ...testability.missing_info
  ];

  const allImprovements = [
    problemClarity.recommended_improvement,
    researchSupport.recommended_improvement,
    originality.recommended_improvement,
    feasibility.recommended_improvement,
    testability.recommended_improvement
  ].filter(Boolean);

  return {
    overall_score: overallScore,
    overall_status: overallStatus,
    dimensions: {
      problem_clarity: problemClarity,
      research_support: researchSupport,
      potential_originality: originality,
      technical_feasibility: feasibility,
      testability: testability
    },
    missing_info: allMissing,
    recommended_improvements: allImprovements,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  validateProject,
  evaluateProblemClarity,
  evaluateResearchSupport,
  evaluatePotentialOriginality,
  evaluateTechnicalFeasibility,
  evaluateTestability
};
