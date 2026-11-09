// Mentor Matching Service - Weighted Algorithm

function tokenize(text) {
  if (!text) return new Set();
  const stopWords = new Set(['for', 'and', 'the', 'with', 'from', 'into', 'that', 'this', 'are', 'was', 'were']);
  return new Set(
    text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2 && !stopWords.has(w))
  );
}

function calculateOverlapRatio(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let matches = 0;
  for (const item of setA) {
    if (setB.has(item)) matches++;
  }
  // Ratio relative to the smaller set or balanced overlap
  const baseRatio = matches / Math.min(setA.size, setB.size);
  return Math.min(baseRatio * 1.2, 1.0);
}

function computeMentorMatch(project, mentor, currentAssignedCount = 0) {
  // 1. Domain Match (30%)
  const projDomain = (project.domain || '').toLowerCase();
  const mentorExp = (mentor.expertise || '').toLowerCase();
  const mentorDept = (mentor.department || '').toLowerCase();

  const projectDomainTokens = tokenize(`${project.domain} ${project.title}`);
  const mentorDomainTokens = tokenize(`${mentor.expertise} ${mentor.department}`);
  const domainRatio = calculateOverlapRatio(projectDomainTokens, mentorDomainTokens);
  
  let domainScore = Math.round(domainRatio * 100);
  // Check direct domain substring overlap
  if (mentorExp.includes(projDomain) || projDomain.includes(mentorExp) ||
      (projDomain.includes('healthcare') && mentorExp.includes('healthcare')) ||
      (projDomain.includes('federated') && mentorExp.includes('federated')) ||
      (projDomain.includes('language') && mentorExp.includes('language')) ||
      (projDomain.includes('vision') && mentorExp.includes('vision'))) {
    domainScore = Math.max(domainScore, 90);
  } else if (domainScore < 40) {
    domainScore = 45;
  }
  domainScore = Math.min(domainScore, 100);

  // 2. Technical Skills Match (25%)
  const projectTechTokens = tokenize(project.technologies || '');
  const mentorSkillsTokens = tokenize(mentor.skills || '');
  const skillsRatio = calculateOverlapRatio(projectTechTokens, mentorSkillsTokens);
  let skillsScore = Math.min(Math.round(skillsRatio * 100), 100);
  if (skillsScore < 30) skillsScore = 40;

  // 3. Research Interests (20%)
  const projectConceptTokens = tokenize(`${project.proposed_solution} ${project.initial_hypothesis} ${project.problem_statement}`);
  const mentorBioTokens = tokenize(`${mentor.bio} ${mentor.expertise}`);
  const interestsRatio = calculateOverlapRatio(projectConceptTokens, mentorBioTokens);
  let interestsScore = Math.min(Math.round(interestsRatio * 100), 100);
  if (interestsScore < 30) interestsScore = 45;

  // 4. Relevant Experience (15%)
  const expYears = mentor.experience_years || 0;
  let expScore = 50;
  if (expYears >= 12) expScore = 95;
  else if (expYears >= 8) expScore = 85;
  else if (expYears >= 4) expScore = 75;
  else if (expYears >= 1) expScore = 65;

  // 5. Availability (10%)
  let availScore = 100;
  if (mentor.availability_status === 'limited') availScore = 65;
  else if (mentor.availability_status === 'unavailable') availScore = 15;

  // Check capacity limit
  const maxCap = mentor.max_capacity || 5;
  const isAtCapacity = currentAssignedCount >= maxCap;
  if (isAtCapacity) {
    availScore = 10;
  }

  // Weighted sum: 30% + 25% + 20% + 15% + 10% = 100%
  const totalMatchScore = Math.round(
    domainScore * 0.30 +
    skillsScore * 0.25 +
    interestsScore * 0.20 +
    expScore * 0.15 +
    availScore * 0.10
  );

  // Generate explanation
  const matchedSkills = [...projectTechTokens].filter(t => mentorSkillsTokens.has(t));
  const explanationParts = [];

  if (domainScore >= 70) {
    explanationParts.push(`Strong domain alignment with ${mentor.department || 'mentor research focus'}`);
  }
  if (matchedSkills.length > 0) {
    explanationParts.push(`Shared technical stack (${matchedSkills.slice(0, 3).join(', ')})`);
  }
  if (expYears > 5) {
    explanationParts.push(`${expYears}+ years academic mentorship experience`);
  }
  if (isAtCapacity) {
    explanationParts.push('Notice: Mentor is currently near or at full student capacity');
  } else {
    explanationParts.push(`Current availability: ${mentor.availability_status || 'available'}`);
  }

  return {
    mentor_id: mentor.id,
    mentor_name: mentor.name,
    institution: mentor.institution,
    department: mentor.department,
    expertise: mentor.expertise,
    skills: mentor.skills,
    experience_years: mentor.experience_years,
    availability_status: mentor.availability_status,
    max_capacity: maxCap,
    current_capacity: currentAssignedCount,
    is_at_capacity: isAtCapacity,
    match_score: Math.min(Math.max(totalMatchScore, 30), 98),
    component_scores: {
      domain_match: domainScore,
      technical_skills: skillsScore,
      research_interests: interestsScore,
      experience: expScore,
      availability: availScore
    },
    explanation: explanationParts.join(' • ')
  };
}

module.exports = {
  computeMentorMatch
};
