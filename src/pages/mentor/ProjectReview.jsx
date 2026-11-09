import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge, StatusBadge } from '../../components/common/Badge';
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  FlaskConical, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  MessageSquare, 
  Award, 
  Loader2, 
  User, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export function ProjectReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [decision, setDecision] = useState('approved');
  const [feedback, setFeedback] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [actions, setActions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Experiment Review State
  const [selectedExpId, setSelectedExpId] = useState(null);
  const [mentorNotes, setMentorNotes] = useState('');
  const [reviewingExp, setReviewingExp] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  async function loadProject() {
    try {
      const res = await api.getProjectById(id);
      setProjectData(res);
      // Pre-fill existing review if any
      if (res.reviews && res.reviews.length > 0) {
        const last = res.reviews[0];
        setDecision(last.review_decision);
        setFeedback(last.general_feedback);
        setStrengths(last.strengths || '');
        setWeaknesses(last.weaknesses || '');
        setActions(last.recommended_actions || '');
      }
    } catch (err) {
      console.error('Failed to load project for review:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setSubmitting(true);
    setSuccessMsg('');

    try {
      await api.submitReview(id, {
        review_decision: decision,
        general_feedback: feedback,
        strengths,
        weaknesses,
        recommended_actions: actions
      });

      setSuccessMsg('Formal review decision recorded and synced to project stage!');
      await loadProject();
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewExperiment = async (expId) => {
    if (!mentorNotes.trim()) return;
    setReviewingExp(true);
    try {
      await api.mentorReviewExperiment(expId, { mentor_notes: mentorNotes });
      setSelectedExpId(null);
      setMentorNotes('');
      await loadProject();
    } catch (err) {
      alert(err.message || 'Failed to review experiment');
    } finally {
      setReviewingExp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-charcoal-400">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-accent-600" />
        <span className="text-sm font-semibold">Loading student project dossier...</span>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
        <h3 className="font-bold text-base mb-1">Project Not Found</h3>
        <Link to="/mentor/projects" className="text-xs font-bold text-accent-700 underline">
          Back to Assigned Projects
        </Link>
      </div>
    );
  }

  const { project, papers = [], validation = null, hypotheses = [], experiments = [], reviews = [] } = projectData;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-charcoal-400 mb-1">
          <Link to="/mentor/projects" className="hover:text-accent-700">Assigned Projects</Link>
          <span>/</span>
          <span className="text-charcoal-700 font-semibold">Faculty Review Console</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
            Academic Evaluation & Guidance Console
          </h1>
          <div className="flex items-center gap-2">
            <StatusBadge status={project.status} />
            <Badge variant="brand" size="md">{project.domain}</Badge>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Student & Project Summary Card */}
      <Card className="bg-frost border-charcoal-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-200">
          <div>
            <h2 className="text-lg font-bold text-charcoal-900">{project.title}</h2>
            <div className="flex items-center gap-2 text-xs text-charcoal-500 mt-1">
              <User className="w-3.5 h-3.5 text-accent-600" />
              <span>Investigator: <strong>{project.student_name}</strong> ({project.student_email})</span>
              <span>•</span>
              <span>{project.student_institution || 'NIT'}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-charcoal-400 block">Current Stage</span>
            <span className="text-xs font-bold text-charcoal-800 uppercase px-2.5 py-1 rounded-md bg-white border border-charcoal-200">
              {project.current_stage}
            </span>
          </div>
        </div>

        {/* Quick Review of Formulation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
          <div>
            <span className="font-bold text-charcoal-500 uppercase tracking-wider text-[10px] block mb-1">
              Problem Statement
            </span>
            <p className="text-charcoal-800 leading-relaxed bg-white p-3 rounded-lg border border-charcoal-200">
              {project.problem_statement}
            </p>
          </div>

          <div>
            <span className="font-bold text-charcoal-500 uppercase tracking-wider text-[10px] block mb-1">
              Proposed Solution & Methodology
            </span>
            <p className="text-charcoal-800 leading-relaxed bg-white p-3 rounded-lg border border-charcoal-200">
              {project.proposed_solution}
            </p>
          </div>
        </div>
      </Card>

      {/* Evidence & Literature Summary Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Linked Literature */}
        <Card>
          <CardHeader
            title={`Literature Benchmarks (${papers.length})`}
            subtitle="Papers linked from OpenAlex with relevance notes"
          />

          {papers.length === 0 ? (
            <p className="text-xs text-charcoal-400 italic">No academic literature citations linked yet.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {papers.map((p, idx) => (
                <div key={p.id} className="p-3 bg-frost rounded-xl border border-charcoal-200 text-xs space-y-1">
                  <div className="font-bold text-charcoal-900 leading-snug">
                    [{idx + 1}] {p.title} ({p.publication_year || 'n.d.'})
                  </div>
                  <div className="text-charcoal-500 text-[11px]">{p.authors}</div>
                  {p.comparison_notes && (
                    <div className="text-[11px] text-brand-800 italic pt-0.5">
                      Note: {p.comparison_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 5-Dimension Validation Results */}
        <Card>
          <CardHeader
            title="Validation Audit Scorecard"
            subtitle={validation ? `Score: ${validation.overall_score}/100 — ${validation.overall_status}` : 'Pending audit'}
          />

          {validation ? (
            <div className="space-y-2.5 text-xs">
              {[
                { label: 'Problem Clarity', score: validation.problem_clarity_score },
                { label: 'Research Support', score: validation.research_support_score },
                { label: 'Originality', score: validation.originality_score },
                { label: 'Feasibility', score: validation.feasibility_score },
                { label: 'Testability', score: validation.testability_score }
              ].map(d => (
                <div key={d.label} className="flex items-center justify-between p-2 rounded-lg bg-frost border border-charcoal-100">
                  <span className="font-semibold text-charcoal-700">{d.label}</span>
                  <span className="font-black text-charcoal-900">{d.score}/100</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-charcoal-400 italic">Student has not run validation audit yet.</p>
          )}
        </Card>
      </div>

      {/* Hypothesis & Experiments Review */}
      <Card>
        <CardHeader
          title={`Laboratory Experiments (${experiments.length})`}
          subtitle="Review empirical trials, baseline comparisons, and outcomes"
        />

        {experiments.length === 0 ? (
          <p className="text-xs text-charcoal-400 italic">No experiments conducted yet.</p>
        ) : (
          <div className="space-y-4">
            {experiments.map((exp, idx) => (
              <div key={exp.id} className="p-4 rounded-xl bg-frost border border-charcoal-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal-900 text-sm">
                    Experiment #{idx + 1}: {exp.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {exp.result_outcome}
                    </span>
                    {exp.mentor_reviewed && (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-charcoal-700">
                  <div><strong>Metric:</strong> {exp.evaluation_metric}</div>
                  <div><strong>Criteria:</strong> {exp.success_criteria}</div>
                </div>

                {exp.observations && (
                  <div className="text-charcoal-700">
                    <strong>Observations:</strong> {exp.observations}
                  </div>
                )}

                {exp.conclusion && (
                  <div className="text-charcoal-800 bg-white p-2.5 rounded-lg border border-charcoal-100">
                    <strong>Conclusion:</strong> {exp.conclusion}
                  </div>
                )}

                {/* Mentor Notes Section */}
                {exp.mentor_notes && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <strong>Your Previous Feedback: </strong> {exp.mentor_notes}
                  </div>
                )}

                {/* Provide Experiment Feedback */}
                {selectedExpId === exp.id ? (
                  <div className="space-y-2 pt-2 border-t border-charcoal-200">
                    <textarea
                      rows={2}
                      value={mentorNotes}
                      onChange={(e) => setMentorNotes(e.target.value)}
                      placeholder="Add specific critique or approval notes on this experiment..."
                      className="w-full p-2 rounded-lg border border-charcoal-300 text-xs outline-none bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedExpId(null)}
                        className="px-3 py-1 rounded-lg border border-charcoal-300 text-xs font-bold text-charcoal-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={reviewingExp}
                        onClick={() => handleReviewExperiment(exp.id)}
                        className="px-3 py-1 rounded-lg bg-accent-600 text-white text-xs font-bold hover:bg-accent-700"
                      >
                        {reviewingExp ? 'Saving...' : 'Save Feedback'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => { setSelectedExpId(exp.id); setMentorNotes(exp.mentor_notes || ''); }}
                      className="text-xs font-bold text-accent-700 hover:underline"
                    >
                      {exp.mentor_notes ? 'Edit Experiment Feedback' : 'Add Experiment Feedback'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Formal Review Submission Form */}
      <Card className="border-accent-200 shadow-sm">
        <CardHeader
          title="Submit Formal Project Review"
          subtitle="Your verdict will update the project stage and notify the student author"
        />

        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Review Decision Verdict *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'approved', label: 'Approve Proposal', desc: 'Ready for full lab testing' },
                { key: 'revision_requested', label: 'Request Revision', desc: 'Changes required' },
                { key: 'feedback_only', label: 'Interim Feedback', desc: 'Guidance only' },
                { key: 'rejected', label: 'Reject Idea', desc: 'Fundamental flaws' }
              ].map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setDecision(opt.key)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    decision === opt.key
                      ? 'border-accent-600 bg-accent-50/70 ring-2 ring-accent-500/20 shadow-xs'
                      : 'border-charcoal-200 bg-white hover:border-charcoal-300'
                  }`}
                >
                  <div className={`font-bold text-xs ${decision === opt.key ? 'text-accent-800' : 'text-charcoal-800'}`}>
                    {opt.label}
                  </div>
                  <div className="text-[10px] text-charcoal-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              General Evaluation & Assessment *
            </label>
            <textarea
              required
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide a comprehensive academic critique of the formulation, literature grounding, and feasibility..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 focus:border-accent-500 text-xs outline-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Key Strengths
              </label>
              <textarea
                rows={2}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="What did the student formulate particularly well?"
                className="w-full px-3.5 py-2 rounded-xl border border-charcoal-300 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Weaknesses / Potential Pitfalls
              </label>
              <textarea
                rows={2}
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                placeholder="Where could the methodology or evaluation fall short?"
                className="w-full px-3.5 py-2 rounded-xl border border-charcoal-300 text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Recommended Action Items for Next Revision
            </label>
            <input
              type="text"
              value={actions}
              onChange={(e) => setActions(e.target.value)}
              placeholder="e.g. Conduct ablation study on learning rates; cite Abadi et al. 2016 for privacy budgets."
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 text-xs outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-accent-500/25 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
              Submit Formal Review Decision
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
