import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card, CardHeader } from '../../components/common/Card';
import { StatusBadge, Badge } from '../../components/common/Badge';
import { 
  FolderPlus, 
  Folders, 
  Search, 
  ShieldCheck, 
  FlaskConical, 
  ArrowRight, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Sparkles,
  Loader2
} from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await api.getStudentProjects();
        setProjects(res.projects || []);
      } catch (err) {
        console.error('Failed to load dashboard projects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const totalProjects = projects.length;
  const underReviewCount = projects.filter(p => p.status === 'under_review' || p.status === 'submitted').length;
  const approvedCount = projects.filter(p => p.status === 'approved' || p.status === 'completed').length;
  const totalPapers = projects.reduce((acc, p) => acc + (p.papers_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-700 via-brand-600 to-accent-600 rounded-2xl p-6 sm:p-8 text-white shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent-200" /> Research Ideation & Validation
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || 'Scholar'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 mt-2 leading-relaxed">
            Validate project hypotheses against academic literature, consult faculty mentors, and record experimental findings.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-brand-700 font-bold text-xs hover:bg-brand-50 transition-all shadow-sm"
            >
              <FolderPlus className="w-4 h-4" /> Submit Research Idea
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-800/60 hover:bg-brand-800/90 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              <Folders className="w-4 h-4" /> View All Projects
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Total Projects</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Folders className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-charcoal-900 mt-2">{totalProjects}</div>
          <div className="text-[11px] text-charcoal-400 mt-0.5">Active research proposals</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Literature Linked</span>
            <div className="w-8 h-8 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-charcoal-900 mt-2">{totalPapers}</div>
          <div className="text-[11px] text-charcoal-400 mt-0.5">OpenAlex peer-reviewed papers</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Under Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-charcoal-900 mt-2">{underReviewCount}</div>
          <div className="text-[11px] text-charcoal-400 mt-0.5">Faculty evaluation pending</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Approved / Active</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-charcoal-900 mt-2">{approvedCount}</div>
          <div className="text-[11px] text-charcoal-400 mt-0.5">Advanced to hypothesis lab</div>
        </Card>
      </div>

      {/* Recent Projects Section */}
      <Card>
        <CardHeader
          title="Active Research Proposals"
          subtitle="Recent projects moving through the validation and experimentation pipeline"
          action={
            <Link
              to="/projects"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-charcoal-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-10 bg-frost rounded-xl border border-dashed border-charcoal-200">
            <Folders className="w-10 h-10 text-charcoal-400 mx-auto mb-2" />
            <h4 className="font-bold text-charcoal-800 text-sm">No research projects yet</h4>
            <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
              Start by submitting your first innovative research proposal for evidence validation.
            </p>
            <Link
              to="/projects/new"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-xs hover:bg-brand-700 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" /> Submit New Proposal
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-charcoal-100">
            {projects.slice(0, 4).map((p) => (
              <div key={p.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={p.status} />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-charcoal-100 text-charcoal-600">
                      {p.domain}
                    </span>
                    {p.validation_score ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Score: {p.validation_score}/100
                      </span>
                    ) : null}
                  </div>
                  <Link
                    to={`/projects/${p.id}`}
                    className="text-sm sm:text-base font-bold text-charcoal-900 hover:text-brand-600 transition-colors line-clamp-1"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-charcoal-500 line-clamp-2 leading-relaxed">
                    {p.problem_statement}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-charcoal-400 pt-1">
                    <span>Literature: <strong>{p.papers_count || 0}</strong> papers</span>
                    <span>Experiments: <strong>{p.experiments_count || 0}</strong> runs</span>
                    <span>Mentor: <strong>{p.mentor_name || 'Pending matching'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/projects/${p.id}`}
                    className="px-3.5 py-1.5 rounded-lg border border-charcoal-200 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                  >
                    Overview
                  </Link>
                  <Link
                    to={`/projects/${p.id}/validation`}
                    className="px-3.5 py-1.5 rounded-lg bg-brand-50 border border-brand-200 text-xs font-bold text-brand-700 hover:bg-brand-100 transition-colors flex items-center gap-1"
                  >
                    Validate <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
