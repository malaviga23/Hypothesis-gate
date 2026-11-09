import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { WorkflowProgress } from '../../components/common/WorkflowProgress';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { 
  ShieldCheck, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  RotateCw, 
  Loader2, 
  FileText, 
  Search, 
  Lightbulb, 
  Cpu, 
  FlaskConical,
  Info
} from 'lucide-react';

export function EvidenceValidation() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadValidation();
  }, [id]);

  async function loadValidation() {
    try {
      const projRes = await api.getProjectById(id);
      setProject(projRes.project);
      setValidation(projRes.validation);
    } catch (err) {
      setError(err.message || 'Failed to load validation data');
    } finally {
      setLoading(false);
    }
  }

  const handleRunAudit = async () => {
    setAuditing(true);
    setError('');
    try {
      const res = await api.runValidation(id);
      setValidation(res.evaluation);
      // Reload project to update stage
      const pRes = await api.getProjectById(id);
      setProject(pRes.project);
    } catch (err) {
      setError(err.message || 'Failed to complete validation audit');
    } finally {
      setAuditing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-charcoal-400">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-brand-600" />
        <span className="text-sm font-semibold">Loading validation scorecard...</span>
      </div>
    );
  }

  // Parse dimensional data
  const dimensions = validation?.dimensions || {
    problem_clarity: {
      score: validation?.problem_clarity_score || 0,
      status: validation?.problem_clarity_score >= 80 ? 'Strong' : 'Moderate',
      explanation: validation?.problem_clarity_feedback || 'Pending audit.',
      missing_info: [],
      recommended_improvement: 'Ensure problem statement details specific pain points.'
    },
    research_support: {
      score: validation?.research_support_score || 0,
      status: validation?.research_support_score >= 80 ? 'Strong' : 'Insufficient evidence',
      explanation: validation?.research_support_feedback || 'Pending audit.',
      missing_info: [],
      recommended_improvement: 'Link peer-reviewed literature in the Research module.'
    },
    potential_originality: {
      score: validation?.originality_score || 0,
      status: validation?.originality_score >= 80 ? 'Strong' : 'Moderate',
      explanation: validation?.originality_feedback || 'Pending audit.',
      missing_info: [],
      recommended_improvement: 'Clarify architectural novelty.'
    },
    technical_feasibility: {
      score: validation?.feasibility_score || 0,
      status: validation?.feasibility_score >= 80 ? 'Feasible' : 'Moderate',
      explanation: validation?.feasibility_feedback || 'Pending audit.',
      missing_info: [],
      recommended_improvement: 'Verify library dependencies and resources.'
    },
    testability: {
      score: validation?.testability_score || 0,
      status: validation?.testability_score >= 80 ? 'Highly Testable' : 'Moderate',
      explanation: validation?.testability_feedback || 'Pending audit.',
      missing_info: [],
      recommended_improvement: 'Define quantitative metrics in the hypothesis.'
    }
  };

  const dimConfigs = [
    {
      key: 'problem_clarity',
      label: '1. Problem Clarity & Pain Point Formulation',
      icon: FileText,
      data: dimensions.problem_clarity,
      description: 'Evaluates problem statement specificity, real-world constraints, and breakdown of existing deficiencies.'
    },
    {
      key: 'research_support',
      label: '2. Research Support & Academic Grounding',
      icon: Search,
      data: dimensions.research_support,
      description: 'Evaluates peer-reviewed literature citations, benchmark awareness, and recent academic references.'
    },
    {
      key: 'potential_originality',
      label: '3. Potential Originality & Methodological Novelty',
      icon: Lightbulb,
      data: dimensions.potential_originality,
      description: 'Evaluates architectural distinctions, algorithmic novelty, and clear differentiation from off-the-shelf systems.'
    },
    {
      key: 'technical_feasibility',
      label: '4. Technical Feasibility & Implementation Scope',
      icon: Cpu,
      data: dimensions.technical_feasibility,
      description: 'Evaluates language stacks, libraries, milestone phased objectives, and college lab deliverability.'
    },
    {
      key: 'testability',
      label: '5. Scientific Testability & Metric Verification',
      icon: FlaskConical,
      data: dimensions.testability,
      description: 'Evaluates falsifiable hypothesis formulation, quantitative thresholds, and experimental verifiability.'
    }
  ];

  const overallScore = validation?.overall_score || 0;
  const overallStatus = validation?.overall_status || 'Pending Validation Audit';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-charcoal-400 mb-1">
            <Link to={`/projects/${id}`} className="hover:text-brand-600">Project Overview</Link>
            <span>/</span>
            <span className="text-charcoal-700 font-semibold">Stage 3: Evidence Validation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
            5-Dimension Evidence Validation
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
            Transparent, explainable rules-based rubric auditing the academic readiness of your proposal
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={auditing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-brand-500/25 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          {auditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
          Run Validation Audit
        </button>
      </div>

      {project && <WorkflowProgress currentStage={project.current_stage} projectId={project.id} />}

      {/* Notice Pill: Explainable Rules vs AI */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-frost border border-charcoal-200 text-charcoal-600 text-xs leading-relaxed">
        <Info className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Transparent Academic Rubric: </strong>
          Evaluations are computed using deterministic scoring rules based on proposal elaboration, peer citations saved from OpenAlex, and measurable quantitative metrics. No black-box paid APIs are required.
        </div>
      </div>

      {/* Overall Score Header Banner */}
      <Card className="bg-gradient-to-r from-frost via-white to-brand-50/50 border-brand-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-400">
              Composite Readiness Score
            </span>
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl font-black text-charcoal-900">
                {overallScore}
                <span className="text-base font-semibold text-charcoal-400">/100</span>
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                overallScore >= 80
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : overallScore >= 60
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {overallStatus}
              </span>
            </div>
            <p className="text-xs text-charcoal-500 mt-1 max-w-xl">
              {overallScore >= 80
                ? 'Your project satisfies core academic benchmarks and is ready for mentor matching and hypothesis laboratory testing.'
                : 'Review the missing information and recommended improvements on the dimension cards below.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/projects/${id}/mentors`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm shadow-brand-500/25 transition-all"
            >
              Match Mentors <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Card>

      {/* 5 Dimension Cards */}
      <div className="space-y-4">
        {dimConfigs.map((dim) => {
          const Icon = dim.icon;
          const score = dim.data?.score || 0;
          const status = dim.data?.status || 'Evaluated';
          const isStrong = score >= 80;
          const isModerate = score >= 60 && score < 80;

          return (
            <Card key={dim.key} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-2 border-b border-charcoal-100">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isStrong ? 'bg-emerald-50 text-emerald-700' : isModerate ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-charcoal-900">{dim.label}</h3>
                    <p className="text-xs text-charcoal-500">{dim.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    isStrong
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isModerate
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {status}
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-black text-charcoal-900">{score}</span>
                    <span className="text-xs text-charcoal-400">/100</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-charcoal-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isStrong ? 'bg-emerald-600' : isModerate ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>

              {/* Explanation */}
              <div className="text-xs text-charcoal-700 leading-relaxed bg-frost p-3.5 rounded-xl border border-charcoal-100">
                <strong>Analysis: </strong> {dim.data?.explanation || 'No feedback recorded.'}
              </div>

              {/* Missing Information Alerts */}
              {dim.data?.missing_info && dim.data.missing_info.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5" /> Missing Information Identified:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                    {dim.data.missing_info.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Improvement */}
              {dim.data?.recommended_improvement && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-brand-50/60 border border-brand-200/60 text-brand-900 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-brand-800">Recommended Improvement: </span>
                    <span className="text-brand-700">{dim.data.recommended_improvement}</span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
