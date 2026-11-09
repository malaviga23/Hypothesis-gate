import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge, StatusBadge } from '../../components/common/Badge';
import { 
  Inbox, 
  UserCheck, 
  Award, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  Loader2,
  FileText
} from 'lucide-react';

export function MentorDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMentorData() {
      try {
        const reqRes = await api.getIncomingRequests();
        setRequests(reqRes.requests || []);

        const projRes = await api.getAssignedProjects();
        setAssignedProjects(projRes.projects || []);
      } catch (err) {
        console.error('Failed to load mentor dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMentorData();
  }, []);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const activeProjectsCount = assignedProjects.length;

  return (
    <div className="space-y-6">
      {/* Mentor Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-accent-700 via-accent-600 to-brand-700 rounded-2xl p-6 sm:p-8 text-white shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent-200" /> Faculty Mentorship Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {user?.name || 'Professor'}
          </h1>
          <p className="text-xs sm:text-sm text-accent-100 mt-2 leading-relaxed">
            Review incoming student proposals, evaluate peer literature citations, and guide laboratory hypothesis testing.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/mentor/requests"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-accent-800 font-bold text-xs hover:bg-accent-50 transition-all shadow-sm"
            >
              <Inbox className="w-4 h-4" /> Incoming Requests ({pendingRequests.length})
            </Link>
            <Link
              to="/mentor/projects"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-900/50 hover:bg-accent-900/80 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              <UserCheck className="w-4 h-4" /> Assigned Projects ({activeProjectsCount})
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Pending Requests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-charcoal-900 mt-2">{pendingRequests.length}</div>
          <div className="text-[11px] text-charcoal-400 mt-0.5">Students awaiting response</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Supervised Projects</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-charcoal-900 mt-2">{activeProjectsCount}</div>
          <div className="text-[11px] text-charcoal-400 mt-0.5">Active research teams</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Capacity Status</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-charcoal-900 mt-2">
            {activeProjectsCount} / {user?.max_capacity || 5}
          </div>
          <div className="text-[11px] text-charcoal-400 mt-0.5">
            {user?.availability_status?.toUpperCase() || 'AVAILABLE'}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Experience Level</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-charcoal-900 mt-2">
            {user?.experience_years || 12}+ Yrs
          </div>
          <div className="text-[11px] text-charcoal-400 mt-0.5">Academic mentorship</div>
        </Card>
      </div>

      {/* Pending Requests & Assigned Projects Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests Preview */}
        <Card>
          <CardHeader
            title="Pending Mentorship Requests"
            subtitle="Student proposals matched via weighted algorithm"
            action={
              <Link to="/mentor/requests" className="text-xs font-bold text-accent-700 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />

          {loading ? (
            <div className="flex items-center justify-center py-8 text-charcoal-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading requests...
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-8 bg-frost rounded-xl border border-dashed border-charcoal-200">
              <Inbox className="w-8 h-8 text-charcoal-300 mx-auto mb-1.5" />
              <p className="text-xs text-charcoal-500">No pending student requests at this time.</p>
            </div>
          ) : (
            <div className="divide-y divide-charcoal-100">
              {pendingRequests.slice(0, 3).map(r => (
                <div key={r.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-900">{r.student_name}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                      {r.match_score}% Match
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-charcoal-800 line-clamp-1">{r.project_title}</div>
                  <p className="text-[11px] text-charcoal-500 line-clamp-2 italic">"{r.request_message}"</p>
                  <div className="pt-1 flex justify-end">
                    <Link
                      to="/mentor/requests"
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      Respond to Request <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Assigned Projects Preview */}
        <Card>
          <CardHeader
            title="Supervised Student Projects"
            subtitle="Active projects undergoing evaluation and hypothesis testing"
            action={
              <Link to="/mentor/projects" className="text-xs font-bold text-accent-700 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />

          {loading ? (
            <div className="flex items-center justify-center py-8 text-charcoal-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading projects...
            </div>
          ) : assignedProjects.length === 0 ? (
            <div className="text-center py-8 bg-frost rounded-xl border border-dashed border-charcoal-200">
              <UserCheck className="w-8 h-8 text-charcoal-300 mx-auto mb-1.5" />
              <p className="text-xs text-charcoal-500">No active assigned student projects.</p>
            </div>
          ) : (
            <div className="divide-y divide-charcoal-100">
              {assignedProjects.slice(0, 3).map(p => (
                <div key={p.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-charcoal-100 text-charcoal-700">
                      {p.domain}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-charcoal-900 line-clamp-1">{p.title}</div>
                  <div className="text-[11px] text-charcoal-500">
                    Student: <strong>{p.student_name}</strong> • Stage: <strong>{p.current_stage}</strong>
                  </div>
                  <div className="pt-1 flex justify-end">
                    <Link
                      to={`/mentor/projects/${p.id}/review`}
                      className="px-3 py-1 rounded-lg bg-accent-600 hover:bg-accent-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <FileText className="w-3 h-3" /> Review Proposal
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
