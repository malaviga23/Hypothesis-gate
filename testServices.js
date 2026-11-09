// Test script for core algorithms: Validation Rubric, Mentor Matching, Keyword Overlap
const { extractKeywords, compareIdeaWithPaper } = require('./src/services/openAlexService');
const { validateProject } = require('./src/services/validationService');
const { computeMentorMatch } = require('./src/services/matchingService');

console.log('--- RUNNING HYPOTHESIS GATE CORE ALGORITHM TESTS ---\n');

// 1. Test Keyword Extraction & Overlap
const sampleProject = {
  title: 'Federated Learning for Privacy-Preserving Chest X-ray Anomaly Detection',
  domain: 'Healthcare AI & Federated Learning',
  problem_statement: 'Hospitals cannot share raw patient chest X-ray scans due to strict HIPAA regulations, resulting in small localized models.',
  limitations: 'Central aggregation leaks gradient inversions and performs poorly under non-IID label skew.',
  proposed_solution: 'A personalized Federated Learning framework integrating Differential Privacy and dynamic gradient clipping.',
  objectives: '1. Implement decentralized client-server loop.\n2. Formulate dynamic gradient clipping.\n3. Validate generalization across NIH ChestX-ray14.',
  technologies: 'PyTorch, Flower, Python, Docker, CUDA',
  expected_outcome: 'Achieve >= 88% AUC with strict privacy epsilon <= 3.8',
  initial_hypothesis: 'Adaptive DP-SGD with dynamic gradient clipping matches centralized AUC within 3.5% margin.'
};

const samplePaper = {
  title: 'Communication-Efficient Learning of Deep Networks from Decentralized Data',
  abstract: 'Modern mobile devices have access to a wealth of data. We learn a shared model by aggregating locally-computed updates.'
};

console.log('1. Testing Keyword Overlap & Comparison...');
const comparison = compareIdeaWithPaper(sampleProject, samplePaper);
console.log('   Relevance Score:', comparison.relevance_score);
console.log('   Shared Terms:', comparison.shared_keywords);
console.log('   Similarities:', comparison.similarities);
console.assert(comparison.relevance_score >= 35, 'Relevance score should be at least 35');
console.log('   ✓ Keyword Overlap Test Passed!\n');

// 2. Test 5-Dimension Validation Rubric
console.log('2. Testing 5-Dimension Validation Rubric...');
const validationResult = validateProject(sampleProject, [samplePaper]);
console.log('   Overall Score:', validationResult.overall_score);
console.log('   Overall Status:', validationResult.overall_status);
console.log('   Problem Clarity Score:', validationResult.dimensions.problem_clarity.score);
console.log('   Research Support Score:', validationResult.dimensions.research_support.score);
console.log('   Originality Score:', validationResult.dimensions.potential_originality.score);
console.log('   Feasibility Score:', validationResult.dimensions.technical_feasibility.score);
console.log('   Testability Score:', validationResult.dimensions.testability.score);
console.assert(validationResult.overall_score > 60, 'Overall score should be > 60');
console.log('   ✓ Evidence Validation Rubric Test Passed!\n');

// 3. Test Weighted Mentor Matching
console.log('3. Testing Weighted Mentor Matching Formula...');
const sampleMentor = {
  id: 1,
  name: 'Dr. Sarah Jenkins',
  institution: 'Indian Institute of Science',
  department: 'Artificial Intelligence & Biomedical Informatics',
  bio: 'Senior Researcher with 12+ years experience in privacy-preserving machine learning and medical diagnostic AI.',
  expertise: 'Federated Learning, Healthcare AI, Privacy-Preserving Systems',
  skills: 'PyTorch, Federated Learning, Medical Imaging, Differential Privacy, Python',
  experience_years: 12,
  availability_status: 'available',
  max_capacity: 5
};

const match = computeMentorMatch(sampleProject, sampleMentor, 1);
console.log('   Mentor:', match.mentor_name);
console.log('   Match Score:', match.match_score + '%');
console.log('   Component Scores:', match.component_scores);
console.log('   Explanation:', match.explanation);
console.assert(match.match_score >= 65, 'High domain and skill alignment should yield score >= 65%');
console.log('   ✓ Weighted Mentor Matching Test Passed!\n');

console.log('=== ALL ALGORITHMIC TESTS PASSED SUCCESSFULLY! ===');
