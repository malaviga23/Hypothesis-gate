import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card, CardHeader } from '../../components/common/Card';
import { StatusBadge, Badge } from '../../components/common/Badge';
import { 
  UserCheck, 
  FileText, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  FlaskConical, 
  BookOpen, 
  User 
} from 'lucide-react';

export function AssignedProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssigned() {
      try {
        const res = await api.getAssignedProjects();
        setProjects(res.projects || []);
      } catch (err) {
        console.error('Failed to load assigned projects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAssigned();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-charcoal-400">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-accent-600" />
        <span className="text-sm font-semibold">Loading supervised projects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
          Supervised Student Research Projects
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
          Active projects under your faculty supervision. Review validation audits, provide critiques, and approve laboratory stages.
        </p>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center py-16 bg-white">
          <UserCheck className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-charcoal-800">No assigned projects yet</h3>
          <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
            Once you accept incoming student requests, their proposals will appear here for structured academic reviews.
          </p>
          <Link
            to="/mentor/requests"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-accent-600 text-white text-xs font-bold hover:bg-accent-700 transition-colors shadow-2xs"
          >
            Check Incoming Requests
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((p) => (
            <Card key={p.id} hover className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <StatusBadge status={p.status} />
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                    {p.domain}
                  </span>
                </div>

                <Link
                  to={`/mentor/projects/${p.id}/review`}
                  className="text-base font-bold text-charcoal-900 hover:text-brand-600 transition-colors line-clamp-2 block mb-2"
                >
                  {p.title}
                </Link>

                <p className="text-xs text-charcoal-500 line-clamp-3 leading-relaxed mb-3">
                  {p.problem_statement}
                </p>

                <div className="flex items-center gap-2 text-xs text-charcoal-600 font-medium pb-2 border-b border-charcoal-100">
                  <User className="w-3.5 h-3.5 text-charcoal-400" />
                  <span>Student: <strong>{p.student_name}</strong></span>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-frost p-2 rounded-lg border border-charcoal-100">
                    <div className="font-bold text-charcoal-800">{p.papers_count || 0}</div>
                    <div className="text-[10px] text-charcoal-400">Literature</div>
                  </div>
                  <div className="bg-frost p-2 rounded-lg border border-charcoal-100">
                    <div className="font-bold text-brand-700">{p.validation_score ? `${p.validation_score}%` : 'N/A'}</div>
                    <div className="text-[10px] text-charcoal-400">Validation</div>
                  </div>
                  <div className="bg-frost p-2 rounded-lg border border-charcoal-100">
                    <div className="font-bold text-charcoal-800">{p.experiments_count || 0}</div>
                    <div className="text-[10px] text-charcoal-400">Experiments</div>
                  </div>
                </div>

                <Link
                  to={`/mentor/projects/${p.id}/review`}
                  className="w-full py-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-accent-500/25 transition-all"
                >
                  <FileText className="w-3.5 h-3.5" /> Review Proposal & Experiments
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
