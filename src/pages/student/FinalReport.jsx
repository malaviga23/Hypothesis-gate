import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { WorkflowProgress } from '../../components/common/WorkflowProgress';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { 
  Download, 
  FileCheck, 
  Printer, 
  ShieldCheck, 
  BookOpen, 
  Award, 
  FlaskConical, 
  AlertCircle, 
  Loader2,
  CheckCircle2
} from 'lucide-react';

export function FinalReport() {
  const { id } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await api.getReportData(id);
        setReportData(res);
      } catch (err) {
        setError(err.message || 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [id]);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const blob = await api.downloadReportPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HypothesisGate_Report_${(reportData?.project?.title || 'Project').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message || 'Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-charcoal-400">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-brand-600" />
        <span className="text-sm font-semibold">Compiling official research dossier...</span>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
        <h3 className="font-bold text-base mb-1">Error Loading Report</h3>
        <p className="text-xs">{error || 'Project data could not be compiled.'}</p>
      </div>
    );
  }

  const { project, student, mentor, papers = [], validation = null, mentorReview = null, hypotheses = [], experiments = [] } = reportData;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-charcoal-400 mb-1">
            <Link to={`/projects/${id}`} className="hover:text-brand-600">Project Overview</Link>
            <span>/</span>
            <span className="text-charcoal-700 font-semibold">Stage 7: Final Report Dossier</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
            Academic Validation Dossier
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
            Official synthesized project report compiled directly from peer-reviewed evidence and laboratory trials
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto disabled:opacity-50"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-brand-400" />}
          Download PDF Dossier
        </button>
      </div>

      {project && <WorkflowProgress currentStage={project.current_stage} projectId={project.id} />}

      {/* Formal Dossier Preview Document */}
      <div className="bg-white border border-charcoal-200 rounded-2xl shadow-sm p-6 sm:p-12 space-y-8 font-sans">
        {/* Document Header Banner */}
        <div className="border-b-2 border-charcoal-900 pb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black tracking-widest uppercase text-brand-700">
              HYPOTHESIS GATE — ACADEMIC RESEARCH DOSSIER
            </span>
            <span className="text-xs font-mono text-charcoal-400">
              CONFIDENTIAL CAPSTONE AUDIT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
            {project.title}
          </h1>
          <p className="text-xs text-charcoal-500 mt-2">
            Date Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-frost border border-charcoal-200 text-xs">
          <div>
            <span className="font-bold text-charcoal-400 uppercase tracking-wider text-[10px] block mb-0.5">
              Principal Investigator
            </span>
            <div className="font-bold text-charcoal-900">{student?.name || 'Student Author'}</div>
            <div className="text-charcoal-500">{student?.department || ''}</div>
            <div className="text-charcoal-500">{student?.institution || ''}</div>
          </div>

          <div>
            <span className="font-bold text-charcoal-400 uppercase tracking-wider text-[10px] block mb-0.5">
              Assigned Faculty Mentor
            </span>
            <div className="font-bold text-charcoal-900">{mentor ? mentor.name : 'Pending Assignment'}</div>
            <div className="text-charcoal-500">{mentor ? mentor.department : ''}</div>
            <div className="text-charcoal-500">{mentor ? mentor.institution : ''}</div>
          </div>

          <div>
            <span className="font-bold text-charcoal-400 uppercase tracking-wider text-[10px] block mb-0.5">
              Classification
            </span>
            <div className="font-bold text-charcoal-900">{project.domain}</div>
            <div className="text-brand-700 font-semibold mt-0.5">
              Status: {project.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* 1. Problem Statement */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-800 pb-1 border-b border-charcoal-100 flex items-center gap-2">
            1. Problem Statement & Operational Limitations
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-800 leading-relaxed text-justify">
            {project.problem_statement}
          </p>
          {project.limitations && (
            <div className="p-3.5 rounded-xl bg-frost border border-charcoal-200 text-xs text-charcoal-700 leading-relaxed">
              <strong>Shortcomings of Existing Systems: </strong> {project.limitations}
            </div>
          )}
        </div>

        {/* 2. Proposed Methodology & Objectives */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-800 pb-1 border-b border-charcoal-100 flex items-center gap-2">
            2. Proposed Technical Methodology & Phased Objectives
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-800 leading-relaxed text-justify">
            {project.proposed_solution}
          </p>
          <div className="p-3.5 rounded-xl bg-frost border border-charcoal-200 text-xs text-charcoal-700 font-mono whitespace-pre-line leading-relaxed">
            {project.objectives}
          </div>
          {project.technologies && (
            <p className="text-xs text-charcoal-600">
              <strong>Implementation Technologies: </strong> {project.technologies}
            </p>
          )}
        </div>

        {/* 3. Research Papers Reviewed */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-800 pb-1 border-b border-charcoal-100 flex items-center gap-2">
            3. Peer-Reviewed Academic Literature Benchmark Citations
          </h2>
          {papers.length === 0 ? (
            <p className="text-xs text-charcoal-400 italic">No academic literature citations recorded.</p>
          ) : (
            <div className="space-y-3 text-xs">
              {papers.map((p, idx) => (
                <div key={p.id} className="p-3.5 rounded-xl bg-frost border border-charcoal-200 space-y-1">
                  <div className="font-bold text-charcoal-900">
                    [{idx + 1}] {p.title} ({p.publication_year || 'n.d.'})
                  </div>
                  <div className="text-charcoal-500">{p.authors}</div>
                  {p.doi && <div className="text-[11px] font-mono text-charcoal-400">DOI: {p.doi}</div>}
                  {p.comparison_notes && (
                    <div className="text-xs text-brand-800 italic pt-1">
                      <strong>Relevance Note: </strong> {p.comparison_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Evidence Validation Results */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-800 pb-1 border-b border-charcoal-100 flex items-center gap-2">
            4. 5-Dimension Evidence Validation Audit
          </h2>
          {validation ? (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-frost border border-charcoal-200">
                  <div className="text-[10px] text-charcoal-500 font-bold uppercase">Clarity</div>
                  <div className="text-base font-black text-brand-700">{validation.problem_clarity_score}/100</div>
                </div>
                <div className="p-2.5 rounded-lg bg-frost border border-charcoal-200">
                  <div className="text-[10px] text-charcoal-500 font-bold uppercase">Literature</div>
                  <div className="text-base font-black text-brand-700">{validation.research_support_score}/100</div>
                </div>
                <div className="p-2.5 rounded-lg bg-frost border border-charcoal-200">
                  <div className="text-[10px] text-charcoal-500 font-bold uppercase">Originality</div>
                  <div className="text-base font-black text-brand-700">{validation.originality_score}/100</div>
                </div>
                <div className="p-2.5 rounded-lg bg-frost border border-charcoal-200">
                  <div className="text-[10px] text-charcoal-500 font-bold uppercase">Feasibility</div>
                  <div className="text-base font-black text-brand-700">{validation.feasibility_score}/100</div>
                </div>
                <div className="p-2.5 rounded-lg bg-frost border border-charcoal-200">
                  <div className="text-[10px] text-charcoal-500 font-bold uppercase">Testability</div>
                  <div className="text-base font-black text-brand-700">{validation.testability_score}/100</div>
                </div>
              </div>
              <div className="p-3 bg-brand-50/70 border border-brand-200 rounded-xl font-semibold text-brand-900">
                Composite Score: {validation.overall_score}/100 — Status: {validation.overall_status}
              </div>
            </div>
          ) : (
            <p className="text-xs text-charcoal-400 italic">Validation audit pending execution.</p>
          )}
        </div>

        {/* 5. Mentor Evaluation Record */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-800 pb-1 border-b border-charcoal-100 flex items-center gap-2">
            5. Faculty Mentor Formal Review
          </h2>
          {mentorReview ? (
            <div className="p-4 rounded-xl bg-frost border border-charcoal-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-charcoal-900">
                  Reviewed by: {mentorReview.mentor_name}
                </span>
                <span className="font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  {mentorReview.review_decision}
                </span>
              </div>
              <p className="text-charcoal-800 leading-relaxed font-medium">
                "{mentorReview.general_feedback}"
              </p>
              {mentorReview.strengths && (
                <div className="text-charcoal-600">
                  <strong>Key Strengths: </strong> {mentorReview.strengths}
                </div>
              )}
              {mentorReview.recommended_actions && (
                <div className="text-brand-800">
                  <strong>Recommended Next Steps: </strong> {mentorReview.recommended_actions}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-charcoal-400 italic">No formal mentor review logged yet.</p>
          )}
        </div>

        {/* 6. Hypotheses & Experiments */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-800 pb-1 border-b border-charcoal-100 flex items-center gap-2">
            6. Empirical Validations & Experiments
          </h2>
          {experiments.length === 0 ? (
            <p className="text-xs text-charcoal-400 italic">No laboratory experiments logged.</p>
          ) : (
            <div className="space-y-3 text-xs">
              {experiments.map((exp, idx) => (
                <div key={exp.id} className="p-4 rounded-xl bg-frost border border-charcoal-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-charcoal-900">
                      Experiment {idx + 1}: {exp.title}
                    </span>
                    <span className="font-bold uppercase text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {exp.result_outcome}
                    </span>
                  </div>
                  <div className="text-charcoal-600 font-mono text-[11px]">
                    Metric: {exp.evaluation_metric} | Criteria: {exp.success_criteria}
                  </div>
                  {exp.observations && (
                    <div className="text-charcoal-700">
                      <strong>Observation: </strong> {exp.observations}
                    </div>
                  )}
                  {exp.conclusion && (
                    <div className="text-charcoal-900 font-semibold bg-white p-2.5 rounded-lg border border-charcoal-100">
                      <strong>Conclusion: </strong> {exp.conclusion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7. Limitations & Future Directions */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-800 pb-1 border-b border-charcoal-100 flex items-center gap-2">
            7. Empirical Bounds & Future Research
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed text-justify">
            Current validation outcomes are bounded by the specific experimental conditions, synthetic or simulated partitions, and hardware architectures utilized. Future extensions will investigate multi-center clinical trials, heterogeneous IoT bandwidth constraints, and formal differential privacy verification.
          </p>
        </div>

        {/* Dossier Footer */}
        <div className="pt-6 border-t border-charcoal-200 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-400 gap-2">
          <span>Hypothesis Gate — College Mini Project Research Validation System</span>
          <span>Verified Academic Dossier</span>
        </div>
      </div>
    </div>
  );
}
