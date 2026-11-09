const PDFDocument = require('pdfkit');

function generateProjectReport(data, res) {
  const { project, papers = [], validation = null, mentorReview = null, hypotheses = [], experiments = [], student = null, mentor = null } = data;

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 60, left: 50, right: 50 },
    bufferPages: true,
    info: {
      Title: `${project.title} - Research Validation Report`,
      Author: student ? student.name : 'Hypothesis Gate Platform',
      Subject: 'Academic Validation & Mentor Collaboration Report',
      Keywords: 'research, validation, hypothesis, peer-review'
    }
  });

  // Pipe to response
  doc.pipe(res);

  const primaryBlue = '#1d4ed8';
  const textDark = '#0f172a';
  const textMuted = '#475569';
  const borderGray = '#cbd5e1';
  const bgLight = '#f8fafc';

  // Helper for section header
  function addSectionHeader(title, iconNumber) {
    if (doc.y > 680) {
      doc.addPage();
    } else {
      doc.moveDown(0.8);
    }

    doc.rect(50, doc.y, 495, 24).fill('#f1f5f9');
    doc.fillColor(primaryBlue)
       .fontSize(11)
       .font('Helvetica-Bold')
       .text(`${iconNumber}. ${title.toUpperCase()}`, 58, doc.y - 18);
    doc.moveDown(0.8);
  }

  // Cover / Header Banner
  doc.rect(50, 45, 495, 80).fill('#0f172a');
  doc.fillColor('#38bdf8').fontSize(9).font('Helvetica-Bold').text('HYPOTHESIS GATE — RESEARCH VALIDATION PLATFORM', 65, 58);
  doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text('ACADEMIC PROPOSAL & VALIDATION DOSSIER', 65, 75);
  doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  |  Official Capstone Dossier`, 65, 98);

  doc.y = 140;

  // Project Title Block
  doc.fillColor(primaryBlue).fontSize(10).font('Helvetica-Bold').text('PROJECT TITLE');
  doc.fillColor(textDark).fontSize(14).font('Helvetica-Bold').text(project.title || 'Untitled Research Project');
  doc.moveDown(0.4);

  // Metadata Grid
  const metaY = doc.y;
  doc.rect(50, metaY, 495, 45).fillAndStroke(bgLight, borderGray);
  
  doc.fillColor(textMuted).fontSize(8).font('Helvetica-Bold').text('RESEARCH DOMAIN:', 60, metaY + 8);
  doc.fillColor(textDark).fontSize(9).font('Helvetica').text(project.domain || 'N/A', 60, metaY + 18);

  doc.fillColor(textMuted).fontSize(8).font('Helvetica-Bold').text('PRINCIPAL INVESTIGATOR:', 220, metaY + 8);
  doc.fillColor(textDark).fontSize(9).font('Helvetica').text(student ? student.name : 'Student Author', 220, metaY + 18);
  doc.fillColor(textMuted).fontSize(8).text(student ? (student.institution || 'NIT') : '', 220, metaY + 28);

  doc.fillColor(textMuted).fontSize(8).font('Helvetica-Bold').text('ASSIGNED MENTOR:', 380, metaY + 8);
  doc.fillColor(textDark).fontSize(9).font('Helvetica').text(mentor ? mentor.name : 'Pending Assignment', 380, metaY + 18);
  doc.fillColor(textMuted).fontSize(8).text(mentor ? (mentor.department || '') : '', 380, metaY + 28);

  doc.y = metaY + 55;

  // 1. Problem Statement
  addSectionHeader('Problem Statement & Context', '1');
  doc.fillColor(textDark).fontSize(9.5).font('Helvetica').text(project.problem_statement || 'No problem statement provided.', {
    align: 'justify',
    lineGap: 3
  });

  if (project.limitations) {
    doc.moveDown(0.4);
    doc.fillColor(primaryBlue).fontSize(9).font('Helvetica-Bold').text('Existing System Limitations:');
    doc.fillColor(textDark).fontSize(9).font('Helvetica').text(project.limitations, {
      align: 'justify',
      lineGap: 2
    });
  }

  // 2. Proposed Solution & Objectives
  addSectionHeader('Proposed Methodology & Concrete Objectives', '2');
  doc.fillColor(textDark).fontSize(9.5).font('Helvetica').text(project.proposed_solution || 'No proposed solution provided.', {
    align: 'justify',
    lineGap: 3
  });

  doc.moveDown(0.4);
  doc.fillColor(primaryBlue).fontSize(9).font('Helvetica-Bold').text('Project Milestones & Objectives:');
  doc.fillColor(textDark).fontSize(9).font('Helvetica').text(project.objectives || 'No objectives specified.', {
    lineGap: 2
  });

  if (project.technologies) {
    doc.moveDown(0.4);
    doc.fillColor(primaryBlue).fontSize(9).font('Helvetica-Bold').text('Proposed Technology Stack:');
    doc.fillColor(textDark).fontSize(9).font('Helvetica').text(project.technologies);
  }

  // 3. Academic Literature Reviewed
  addSectionHeader('Literature Review & Benchmark Citations', '3');
  if (!papers || papers.length === 0) {
    doc.fillColor(textMuted).fontSize(9).font('Helvetica-Oblique').text('No literature citations recorded.');
  } else {
    papers.forEach((p, idx) => {
      if (doc.y > 690) doc.addPage();
      doc.fillColor(primaryBlue).fontSize(9).font('Helvetica-Bold').text(`[Ref ${idx + 1}] ${p.title} (${p.publication_year || 'n.d.'})`);
      doc.fillColor(textMuted).fontSize(8.5).font('Helvetica').text(`Authors: ${p.authors || 'Unknown'}`);
      if (p.doi) doc.fillColor(textMuted).fontSize(8).text(`DOI: ${p.doi}`);
      if (p.comparison_notes) {
        doc.fillColor(textDark).fontSize(8.5).font('Helvetica-Oblique').text(`Relevance/Baseline Note: ${p.comparison_notes}`);
      }
      doc.moveDown(0.4);
    });
  }

  // 4. Evidence Validation Results
  addSectionHeader('Evidence Validation Audit (5 Dimensions)', '4');
  if (validation) {
    const dims = [
      { name: 'Problem Clarity', score: validation.problem_clarity_score, feedback: validation.problem_clarity_feedback },
      { name: 'Research Support', score: validation.research_support_score, feedback: validation.research_support_feedback },
      { name: 'Potential Originality', score: validation.originality_score, feedback: validation.originality_feedback },
      { name: 'Technical Feasibility', score: validation.feasibility_score, feedback: validation.feasibility_feedback },
      { name: 'Testability', score: validation.testability_score, feedback: validation.testability_feedback }
    ];

    dims.forEach(d => {
      if (doc.y > 700) doc.addPage();
      doc.fillColor(textDark).fontSize(9).font('Helvetica-Bold').text(`${d.name}: `, { continued: true });
      doc.fillColor(d.score >= 80 ? '#15803d' : '#b45309').text(`${d.score}/100 `);
      doc.fillColor(textMuted).fontSize(8.5).font('Helvetica').text(d.feedback || '', { lineGap: 1 });
      doc.moveDown(0.3);
    });

    doc.moveDown(0.3);
    doc.fillColor(primaryBlue).fontSize(9).font('Helvetica-Bold').text(`Overall Validation Score: ${validation.overall_score || 0}/100 — Status: ${validation.overall_status || 'Validated'}`);
  } else {
    doc.fillColor(textMuted).fontSize(9).font('Helvetica-Oblique').text('Validation audit pending execution.');
  }

  // 5. Mentor Review & Feedback
  addSectionHeader('Mentor Evaluation & Recommendations', '5');
  if (mentorReview) {
    doc.fillColor(textDark).fontSize(9).font('Helvetica-Bold').text(`Review Decision: `, { continued: true });
    doc.fillColor(primaryBlue).text(mentorReview.review_decision.toUpperCase());
    doc.fillColor(textDark).fontSize(9).font('Helvetica').text(`Feedback: ${mentorReview.general_feedback}`, { lineGap: 2 });
    if (mentorReview.strengths) {
      doc.fillColor(textMuted).fontSize(8.5).font('Helvetica').text(`Strengths: ${mentorReview.strengths}`);
    }
    if (mentorReview.recommended_actions) {
      doc.fillColor(textMuted).fontSize(8.5).font('Helvetica').text(`Recommended Actions: ${mentorReview.recommended_actions}`);
    }
  } else {
    doc.fillColor(textMuted).fontSize(9).font('Helvetica-Oblique').text('No formal mentor review record submitted yet.');
  }

  // 6. Hypotheses & Experimental Findings
  addSectionHeader('Hypothesis Formulation & Experimental Outcomes', '6');
  if (!hypotheses || hypotheses.length === 0) {
    doc.fillColor(textDark).fontSize(9).font('Helvetica').text(`Initial Hypothesis: ${project.initial_hypothesis || 'N/A'}`);
  } else {
    hypotheses.forEach((h, hIdx) => {
      if (doc.y > 690) doc.addPage();
      doc.fillColor(primaryBlue).fontSize(9.5).font('Helvetica-Bold').text(`Hypothesis ${hIdx + 1}: ${h.statement}`);
      if (h.rationale) {
        doc.fillColor(textMuted).fontSize(8.5).font('Helvetica').text(`Rationale: ${h.rationale}`);
      }
      doc.moveDown(0.3);
    });
  }

  if (experiments && experiments.length > 0) {
    doc.moveDown(0.3);
    doc.fillColor(primaryBlue).fontSize(9).font('Helvetica-Bold').text('Experimental Validations Conducted:');
    experiments.forEach((exp, eIdx) => {
      if (doc.y > 680) doc.addPage();
      doc.fillColor(textDark).fontSize(9).font('Helvetica-Bold').text(`Experiment ${eIdx + 1}: ${exp.title}`);
      doc.fillColor(textMuted).fontSize(8.5).font('Helvetica').text(`Evaluation Metric: ${exp.evaluation_metric}  |  Outcome: ${exp.result_outcome ? exp.result_outcome.toUpperCase() : 'PENDING'}`);
      if (exp.observations) {
        doc.fillColor(textMuted).fontSize(8.5).text(`Observations: ${exp.observations}`);
      }
      if (exp.conclusion) {
        doc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold').text(`Conclusion: ${exp.conclusion}`);
      }
      doc.moveDown(0.4);
    });
  }

  // 7. Limitations & Future Directions
  addSectionHeader('Limitations & Future Research Directions', '7');
  const limitationsText = project.limitations || 'Current results are constrained to simulated academic test environments and standard benchmark partitions.';
  doc.fillColor(textDark).fontSize(9).font('Helvetica').text(limitationsText, { align: 'justify', lineGap: 2 });
  doc.moveDown(0.3);
  doc.fillColor(primaryBlue).fontSize(9).font('Helvetica-Bold').text('Future Improvements:');
  doc.fillColor(textDark).fontSize(9).font('Helvetica').text(
    '1. Scale evaluation to heterogeneous multi-center datasets.\n2. Incorporate real-time hardware latency profiles across edge deployments.\n3. Expand formal statistical significance testing with Bonferroni correction.',
    { lineGap: 2 }
  );

  // Footer on all buffered pages
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    doc.rect(50, 780, 495, 0.5).fill(borderGray);
    doc.fillColor(textMuted)
       .fontSize(8)
       .font('Helvetica')
       .text('Hypothesis Gate — Academic Research Validation System', 50, 788);
    doc.text(`Page ${i + 1} of ${range.count}`, 450, 788, { align: 'right' });
  }

  doc.end();
}

module.exports = {
  generateProjectReport
};
