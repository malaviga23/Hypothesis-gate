import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { WorkflowProgress } from '../../components/common/WorkflowProgress';
import { Card, CardHeader } from '../../components/common/Card';
import { StatusBadge, Badge } from '../../components/common/Badge';
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  Users, 
  FlaskConical, 
  GitBranch, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Loader2,
  Sparkles
} from 'lucide-react';

export function ProjectOverview() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await api.getProjectById(id);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load project details');
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-charcoal-400">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-brand-600" />
        <span className="text-sm font-semibold">Loading research dossier...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
        <h3 className="font-bold text-base mb-1">Error Loading Project</h3>
        <p className="text-xs">{error || 'Project not found.'}</p>
        <Link to="/projects" className="inline-block mt-3 text-xs font-bold text-brand-600 underline">
          Back to My Projects
        </Link>
      </div>
    );
  }

  const { project, papers = [], validation = null, requests = [], reviews = [], hypotheses = [], experiments = [], versions = [] } = data;

  return (
    <div className="space-y-6">
      {/* Top Project Header Card */}
      <div className="bg-white rounded-2xl border border-charcoal-200/80 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-charcoal-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={project.status} />
              <Badge variant="brand" size="md">{project.domain}</Badge>
              <Badge variant="slate" size="sm">
                <GitBranch className="w-3 h-3" /> v{versions.length || 1}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
              {project.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/projects/${project.id}/report`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" /> PDF Dossier
            </Link>
            <Link
              to={`/projects/${project.id}/validation`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm shadow-brand-500/25 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Run Validation
            </Link>
          </div>
        </div>

        {/* Workflow Progression Bar */}
        <div className="mt-4">
          <WorkflowProgress currentStage={project.current_stage} projectId={project.id} />
        </div>
      </div>

      {/* Quick Stage Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Research Literature */}
        <Card hover className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center font-bold">
                <Search className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-accent-700 bg-accent-50 px-2 py-0.5 rounded-full border border-accent-200">
                {papers.length} Papers
              </span>
            </div>
            <h3 className="font-bold text-charcoal-900 text-base mb-1">Literature Analysis</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              OpenAlex integration for peer-reviewed academic papers and keyword overlap comparisons.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-charcoal-100">
            <Link
              to={`/projects/${project.id}/research`}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Search & Compare Literature <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* 2. Evidence Validation */}
        <Card hover className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                validation?.overall_score >= 80
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {validation ? `${validation.overall_score}/100` : 'Not evaluated'}
              </span>
            </div>
            <h3 className="font-bold text-charcoal-900 text-base mb-1">Evidence Validation</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              5-dimension rubric evaluating problem clarity, research grounding, originality, feasibility, and testability.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-charcoal-100">
            <Link
              to={`/projects/${project.id}/validation`}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              View Validation Scorecard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* 3. Mentor Matching */}
        <Card hover className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                {project.mentor_name ? 'Assigned' : 'Recommendations Ready'}
              </span>
            </div>
            <h3 className="font-bold text-charcoal-900 text-base mb-1">Faculty Mentor</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              {project.mentor_name ? `Assigned to ${project.mentor_name} (${project.mentor_department || 'NIT'})` : 'Weighted recommendation based on domain (30%), skills (25%), and experience.'}
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-charcoal-100">
            <Link
              to={`/projects/${project.id}/mentors`}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              {project.mentor_name ? 'View Mentorship Status' : 'Browse Recommended Mentors'} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* 4. Hypothesis Lab */}
        <Card hover className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <FlaskConical className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {experiments.length} Experiments
              </span>
            </div>
            <h3 className="font-bold text-charcoal-900 text-base mb-1">Hypothesis Lab</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Log experimental procedures, benchmark quantitative metrics, and record verifiable outcomes.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-charcoal-100">
            <Link
              to={`/projects/${project.id}/hypotheses`}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Enter Laboratory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* 5. Version History */}
        <Card hover className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-charcoal-100 text-charcoal-700 flex items-center justify-center font-bold">
                <GitBranch className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-charcoal-700 bg-charcoal-100 px-2 py-0.5 rounded-full border border-charcoal-200">
                {versions.length} Snapshots
              </span>
            </div>
            <h3 className="font-bold text-charcoal-900 text-base mb-1">Version Evolution</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Track how the problem statement and methodology adapt following peer literature and mentor feedback.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-charcoal-100">
            <Link
              to={`/projects/${project.id}/versions`}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Compare Iterations <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* 6. Download Dossier */}
        <Card hover className="flex flex-col justify-between bg-gradient-to-br from-charcoal-900 to-charcoal-800 text-white border-charcoal-800">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold">
                <Download className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-brand-200 bg-white/10 px-2 py-0.5 rounded-full">
                Final Report
              </span>
            </div>
            <h3 className="font-bold text-white text-base mb-1">Academic Dossier</h3>
            <p className="text-xs text-charcoal-300 leading-relaxed">
              Download the comprehensive project validation report formatted with tables, citations, and mentor reviews.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-white/10">
            <Link
              to={`/projects/${project.id}/report`}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-300 hover:text-white"
            >
              View & Download PDF <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Deep Details Section */}
      <Card>
        <CardHeader
          title="Project Proposal Details"
          subtitle="Submitted theoretical formulation and milestone objectives"
        />

        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-400 mb-1">
              Problem Statement
            </h4>
            <p className="text-sm text-charcoal-800 leading-relaxed bg-frost p-4 rounded-xl border border-charcoal-200/60">
              {project.problem_statement}
            </p>
          </div>

          {project.limitations && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-400 mb-1">
                Existing System Limitations
              </h4>
              <p className="text-sm text-charcoal-800 leading-relaxed bg-frost p-4 rounded-xl border border-charcoal-200/60">
                {project.limitations}
              </p>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-400 mb-1">
              Proposed Solution & Methodology
            </h4>
            <p className="text-sm text-charcoal-800 leading-relaxed bg-frost p-4 rounded-xl border border-charcoal-200/60">
              {project.proposed_solution}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-400 mb-1">
                Objectives & Milestones
              </h4>
              <div className="text-xs font-mono text-charcoal-800 bg-frost p-4 rounded-xl border border-charcoal-200/60 whitespace-pre-line leading-relaxed">
                {project.objectives}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-400 mb-1">
                Technologies & Expected Outcome
              </h4>
              <div className="space-y-2 bg-frost p-4 rounded-xl border border-charcoal-200/60 text-xs">
                <div>
                  <span className="font-bold text-charcoal-500">Tech Stack: </span>
                  <span className="text-charcoal-800">{project.technologies || 'Not specified'}</span>
                </div>
                <div>
                  <span className="font-bold text-charcoal-500">Expected Outcome: </span>
                  <span className="text-charcoal-800">{project.expected_outcome || 'Not specified'}</span>
                </div>
                <div>
                  <span className="font-bold text-charcoal-500">Initial Hypothesis: </span>
                  <span className="text-charcoal-800 italic">{project.initial_hypothesis || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
