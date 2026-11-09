import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card, CardHeader } from '../../components/common/Card';
import { StatusBadge, Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { 
  FolderPlus, 
  Folders, 
  Search, 
  ArrowRight, 
  Trash2, 
  FileText, 
  Loader2,
  Calendar,
  Sparkles
} from 'lucide-react';

export function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const res = await api.getStudentProjects();
      setProjects(res.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this project? All associated validation and hypothesis logs will be permanently removed.')) {
      return;
    }
    try {
      await api.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete project');
    }
  };

  const domains = Array.from(new Set(projects.map(p => p.domain))).filter(Boolean);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.problem_statement.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = domainFilter === 'all' || p.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
            My Research Projects
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
            Manage your research ideas, validation progress, and mentor collaboration
          </p>
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm shadow-brand-500/25 transition-all self-start sm:self-auto"
        >
          <FolderPlus className="w-4 h-4" /> Submit New Proposal
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search projects by title, keyword, or problem..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-charcoal-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs sm:text-sm outline-none transition-all shadow-2xs"
          />
        </div>

        {domains.length > 0 && (
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-white border border-charcoal-200 text-xs font-semibold text-charcoal-700 outline-none shadow-2xs cursor-pointer"
          >
            <option value="all">All Domains ({projects.length})</option>
            {domains.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-charcoal-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading research proposals...
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={Folders}
          title={searchQuery ? 'No matching projects found' : 'No research projects yet'}
          description={
            searchQuery
              ? 'Try modifying your search keywords or clear domain filters.'
              : 'Submit your first college mini-project proposal to begin literature validation and mentor guidance.'
          }
          action={
            !searchQuery && (
              <Link
                to="/projects/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm hover:bg-brand-700 transition-colors"
              >
                <FolderPlus className="w-4 h-4" /> Create First Project
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((p) => (
            <Card key={p.id} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.status} />
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-charcoal-100 text-charcoal-600">
                      {p.domain}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(p.id, e)}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Link
                  to={`/projects/${p.id}`}
                  className="text-base font-bold text-charcoal-900 hover:text-brand-600 transition-colors line-clamp-2 mb-2 block"
                >
                  {p.title}
                </Link>

                <p className="text-xs text-charcoal-500 line-clamp-3 leading-relaxed mb-4">
                  {p.problem_statement}
                </p>
              </div>

              <div className="pt-3 border-t border-charcoal-100 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="bg-frost p-2 rounded-lg border border-charcoal-100">
                    <div className="font-bold text-charcoal-800">{p.papers_count || 0}</div>
                    <div className="text-[10px] text-charcoal-400">Papers</div>
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

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-charcoal-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(p.updated_at).toLocaleDateString()}
                  </div>
                  <Link
                    to={`/projects/${p.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    Open Hub <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
