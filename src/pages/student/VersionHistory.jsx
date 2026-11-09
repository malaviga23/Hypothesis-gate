import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { 
  GitBranch, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Plus, 
  CheckCircle2, 
  Loader2, 
  Layers, 
  Sparkles,
  GitCommit
} from 'lucide-react';

export function VersionHistory() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedV1, setSelectedV1] = useState(null);
  const [selectedV2, setSelectedV2] = useState(null);
  const [loading, setLoading] = useState(true);

  // Snapshot modal
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [savingSnapshot, setSavingSnapshot] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [id]);

  async function loadVersions() {
    try {
      const projRes = await api.getProjectById(id);
      setProject(projRes.project);

      const vRes = await api.getVersions(id);
      const vList = vRes.versions || [];
      setVersions(vList);

      if (vList.length >= 2) {
        setSelectedV1(vList[vList.length - 2]);
        setSelectedV2(vList[vList.length - 1]);
      } else if (vList.length === 1) {
        setSelectedV1(vList[0]);
        setSelectedV2(vList[0]);
      }
    } catch (err) {
      console.error('Failed to load version history:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateSnapshot = async (e) => {
    e.preventDefault();
    if (!summaryText.trim()) return;

    setSavingSnapshot(true);
    try {
      await api.createSnapshot(id, { change_summary: summaryText });
      setSnapshotModalOpen(false);
      setSummaryText('');
      await loadVersions();
    } catch (err) {
      alert(err.message || 'Failed to capture version snapshot');
    } finally {
      setSavingSnapshot(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-charcoal-400">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-brand-600" />
        <span className="text-sm font-semibold">Loading version lineage...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-charcoal-400 mb-1">
            <Link to={`/projects/${id}`} className="hover:text-brand-600">Project Overview</Link>
            <span>/</span>
            <span className="text-charcoal-700 font-semibold">Version Tracking</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
            Research Proposal Evolution & History
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
            Compare historical iterations showing how your proposal adapted to peer literature and mentor guidance
          </p>
        </div>

        <button
          onClick={() => setSnapshotModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-brand-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Save Manual Snapshot
        </button>
      </div>

      {/* Timeline Section */}
      <Card>
        <CardHeader
          title="Version Timeline"
          subtitle="All captured snapshots are permanently stored in MySQL and cannot be overwritten"
        />

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3.5 sm:before:left-4.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-brand-200">
          {versions.map((v, idx) => (
            <div key={v.id} className="relative group">
              {/* Dot */}
              <div className="absolute -left-6 sm:-left-8 top-1 w-7 h-7 rounded-full bg-brand-50 border-2 border-brand-600 text-brand-700 flex items-center justify-center font-bold text-xs shadow-xs">
                v{v.version_number}
              </div>

              <div className="p-4 rounded-xl bg-frost border border-charcoal-200/80 hover:border-brand-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal-900 text-sm">
                      Version {v.version_number}: {v.title}
                    </span>
                    {idx === versions.length - 1 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        Latest Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-charcoal-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(v.created_at).toLocaleString()}
                  </div>
                </div>

                <p className="text-xs text-charcoal-600 leading-relaxed font-medium">
                  {v.change_summary || 'Iterative refinement.'}
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setSelectedV1(v)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                      selectedV1?.id === v.id
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-charcoal-600 border-charcoal-300 hover:bg-charcoal-50'
                    }`}
                  >
                    Select as Baseline (Left)
                  </button>
                  <button
                    onClick={() => setSelectedV2(v)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                      selectedV2?.id === v.id
                        ? 'bg-accent-600 text-white border-accent-600'
                        : 'bg-white text-charcoal-600 border-charcoal-300 hover:bg-charcoal-50'
                    }`}
                  >
                    Select as Comparison (Right)
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Side-by-Side Comparison Diff View */}
      {selectedV1 && selectedV2 && (
        <Card>
          <CardHeader
            title="Side-by-Side Version Comparison"
            subtitle={`Comparing Version ${selectedV1.version_number} vs Version ${selectedV2.version_number}`}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Version 1 Panel */}
            <div className="p-4 rounded-xl bg-frost border border-charcoal-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-charcoal-200">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-brand-100 text-brand-800">
                  Version {selectedV1.version_number}
                </span>
                <span className="text-[11px] text-charcoal-400">
                  {new Date(selectedV1.created_at).toLocaleDateString()}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 block mb-1">
                  Title
                </span>
                <p className="text-xs font-bold text-charcoal-900">{selectedV1.title}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 block mb-1">
                  Problem Statement
                </span>
                <p className="text-xs text-charcoal-700 leading-relaxed bg-white p-3 rounded-lg border border-charcoal-100">
                  {selectedV1.problem_statement}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 block mb-1">
                  Proposed Solution & Novelty
                </span>
                <p className="text-xs text-charcoal-700 leading-relaxed bg-white p-3 rounded-lg border border-charcoal-100">
                  {selectedV1.proposed_solution}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 block mb-1">
                  Objectives
                </span>
                <div className="text-xs font-mono text-charcoal-700 leading-relaxed bg-white p-3 rounded-lg border border-charcoal-100 whitespace-pre-line">
                  {selectedV1.objectives}
                </div>
              </div>
            </div>

            {/* Version 2 Panel */}
            <div className="p-4 rounded-xl bg-accent-50/20 border border-accent-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-accent-200">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-accent-100 text-accent-800">
                  Version {selectedV2.version_number}
                </span>
                <span className="text-[11px] text-charcoal-400">
                  {new Date(selectedV2.created_at).toLocaleDateString()}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 block mb-1">
                  Title
                </span>
                <p className="text-xs font-bold text-charcoal-900">{selectedV2.title}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 block mb-1">
                  Problem Statement
                </span>
                <p className="text-xs text-charcoal-700 leading-relaxed bg-white p-3 rounded-lg border border-charcoal-100">
                  {selectedV2.problem_statement}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 block mb-1">
                  Proposed Solution & Novelty
                </span>
                <p className="text-xs text-charcoal-700 leading-relaxed bg-white p-3 rounded-lg border border-charcoal-100">
                  {selectedV2.proposed_solution}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 block mb-1">
                  Objectives
                </span>
                <div className="text-xs font-mono text-charcoal-700 leading-relaxed bg-white p-3 rounded-lg border border-charcoal-100 whitespace-pre-line">
                  {selectedV2.objectives}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Snapshot Modal */}
      <Modal
        isOpen={snapshotModalOpen}
        onClose={() => setSnapshotModalOpen(false)}
        title="Capture Project Snapshot"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateSnapshot} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Change Summary & Milestone Reason
            </label>
            <textarea
              required
              rows={3}
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              placeholder="e.g. Refined Differential Privacy epsilon parameters based on Dr. Jenkins' literature review feedback."
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 text-xs outline-none leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSnapshotModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-charcoal-300 text-xs font-bold text-charcoal-700 hover:bg-charcoal-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingSnapshot}
              className="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-all disabled:opacity-50"
            >
              {savingSnapshot ? 'Capturing...' : 'Capture Snapshot'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
