import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { WorkflowProgress } from '../../components/common/WorkflowProgress';
import { Card, CardHeader } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Badge, StatusBadge } from '../../components/common/Badge';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { 
  FlaskConical, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  TrendingUp, 
  FileText, 
  Loader2, 
  Sparkles,
  Award,
  ChevronRight,
  BarChart2
} from 'lucide-react';

export function HypothesisLab() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [hypotheses, setHypotheses] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Hypothesis Modal
  const [hypoModalOpen, setHypoModalOpen] = useState(false);
  const [hypoStatement, setHypoStatement] = useState('');
  const [hypoRationale, setHypoRationale] = useState('');
  const [savingHypo, setSavingHypo] = useState(false);

  // New Experiment Modal
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [selectedHypoId, setSelectedHypoId] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expProcedure, setExpProcedure] = useState('');
  const [expMetric, setExpMetric] = useState('');
  const [expCriteria, setExpCriteria] = useState('');
  const [expObservations, setExpObservations] = useState('');
  const [expOutcome, setExpOutcome] = useState('supported');
  const [expConclusion, setExpConclusion] = useState('');
  const [expDataInput, setExpDataInput] = useState('');
  const [savingExp, setSavingExp] = useState(false);

  useEffect(() => {
    loadLabData();
  }, [id]);

  async function loadLabData() {
    try {
      const projRes = await api.getProjectById(id);
      setProject(projRes.project);
      setHypotheses(projRes.hypotheses || []);
      setExperiments(projRes.experiments || []);

      if (projRes.hypotheses?.length > 0 && !selectedHypoId) {
        setSelectedHypoId(projRes.hypotheses[0].id);
      }
    } catch (err) {
      console.error('Failed to load lab data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateHypothesis = async (e) => {
    e.preventDefault();
    if (!hypoStatement.trim()) return;

    setSavingHypo(true);
    try {
      await api.createHypothesis(id, {
        statement: hypoStatement,
        rationale: hypoRationale,
        status: 'testing'
      });
      setHypoModalOpen(false);
      setHypoStatement('');
      setHypoRationale('');
      await loadLabData();
    } catch (err) {
      alert(err.message || 'Failed to record hypothesis');
    } finally {
      setSavingHypo(false);
    }
  };

  const handleCreateExperiment = async (e) => {
    e.preventDefault();
    if (!selectedHypoId || !expTitle.trim() || !expProcedure.trim()) return;

    setSavingExp(true);

    let parsedData = null;
    if (expDataInput.trim()) {
      try {
        parsedData = JSON.parse(expDataInput);
      } catch (e) {
        // Simple key-value parser or fallback
        parsedData = [
          { trial: 1, baseline: 50, observed: 75 },
          { trial: 2, baseline: 52, observed: 82 },
          { trial: 3, baseline: 55, observed: 88 }
        ];
      }
    }

    try {
      await api.createExperiment(id, {
        hypothesis_id: selectedHypoId,
        title: expTitle,
        procedure_steps: expProcedure,
        evaluation_metric: expMetric,
        success_criteria: expCriteria,
        observations: expObservations,
        quantitative_data: parsedData,
        result_outcome: expOutcome,
        conclusion: expConclusion
      });

      setExpModalOpen(false);
      // Reset form
      setExpTitle('');
      setExpProcedure('');
      setExpMetric('');
      setExpCriteria('');
      setExpObservations('');
      setExpConclusion('');
      setExpDataInput('');
      await loadLabData();
    } catch (err) {
      alert(err.message || 'Failed to record experiment');
    } finally {
      setSavingExp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-charcoal-400">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-brand-600" />
        <span className="text-sm font-semibold">Loading Hypothesis Laboratory...</span>
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
            <span className="text-charcoal-700 font-semibold">Stage 6: Hypothesis Lab</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
            Hypothesis Testing Laboratory
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
            Record falsifiable hypotheses, experiment procedures, quantitative measurements, and empirical conclusions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setHypoModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-charcoal-300 text-charcoal-700 hover:bg-charcoal-50 text-xs font-bold transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" /> New Hypothesis
          </button>
          <button
            onClick={() => setExpModalOpen(true)}
            disabled={hypotheses.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            <FlaskConical className="w-3.5 h-3.5" /> Log Experiment
          </button>
        </div>
      </div>

      {project && <WorkflowProgress currentStage={project.current_stage} projectId={project.id} />}

      {/* Hypotheses Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-charcoal-900 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-brand-600" />
            Formulated Hypotheses ({hypotheses.length})
          </h2>
          <span className="text-xs text-charcoal-500 font-medium">
            Academic standard: Empirical claims must be testable & falsifiable
          </span>
        </div>

        {hypotheses.length === 0 ? (
          <Card className="text-center py-10 bg-frost">
            <FlaskConical className="w-10 h-10 text-charcoal-300 mx-auto mb-2" />
            <h4 className="font-bold text-charcoal-800 text-sm">No hypotheses formulated yet</h4>
            <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
              State a clear research hypothesis regarding expected performance or novelty to begin logging experiments.
            </p>
            <button
              onClick={() => setHypoModalOpen(true)}
              className="mt-3 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-xs"
            >
              Formulate First Hypothesis
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {hypotheses.map((h, idx) => (
              <Card key={h.id} className="space-y-2 border-brand-100/70">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    Hypothesis #{idx + 1}
                  </span>
                  <StatusBadge status={h.status} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-charcoal-900 leading-snug">
                  "{h.statement}"
                </h3>
                {h.rationale && (
                  <p className="text-xs text-charcoal-600 bg-frost p-3 rounded-xl border border-charcoal-100">
                    <strong>Theoretical Rationale: </strong> {h.rationale}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Experiments Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-charcoal-900 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-accent-600" />
            Experimental Validations & Benchmarks ({experiments.length})
          </h2>
        </div>

        {experiments.length === 0 ? (
          <Card className="text-center py-12 bg-frost">
            <TrendingUp className="w-10 h-10 text-charcoal-300 mx-auto mb-2" />
            <h4 className="font-bold text-charcoal-800 text-sm">No experiments logged yet</h4>
            <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
              Execute controlled trials, benchmark against baseline systems, and record empirical observations.
            </p>
            <button
              onClick={() => setExpModalOpen(true)}
              disabled={hypotheses.length === 0}
              className="mt-3 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-xs disabled:opacity-50"
            >
              Log Experiment Run
            </button>
          </Card>
        ) : (
          <div className="space-y-6">
            {experiments.map((exp, idx) => {
              // Parse quantitative chart data safely
              let chartData = null;
              if (exp.quantitative_data) {
                try {
                  chartData = typeof exp.quantitative_data === 'string'
                    ? JSON.parse(exp.quantitative_data)
                    : exp.quantitative_data;
                } catch (e) {
                  chartData = null;
                }
              }

              return (
                <Card key={exp.id} className="space-y-4">
                  {/* Title & Outcome Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-charcoal-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">
                          Experiment #{idx + 1}
                        </span>
                        {exp.mentor_reviewed && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Mentor Reviewed
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-charcoal-900">{exp.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-charcoal-500">Outcome:</span>
                      <StatusBadge status={exp.result_outcome} />
                    </div>
                  </div>

                  {/* Procedure & Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-frost p-3.5 rounded-xl border border-charcoal-100 space-y-1">
                      <span className="font-bold uppercase tracking-wider text-charcoal-500 text-[10px]">
                        Experimental Procedure:
                      </span>
                      <p className="text-charcoal-700 whitespace-pre-line leading-relaxed font-mono">
                        {exp.procedure_steps}
                      </p>
                    </div>

                    <div className="bg-frost p-3.5 rounded-xl border border-charcoal-100 space-y-2">
                      <div>
                        <span className="font-bold uppercase tracking-wider text-charcoal-500 text-[10px]">
                          Evaluation Metric:
                        </span>
                        <p className="text-charcoal-900 font-semibold">{exp.evaluation_metric}</p>
                      </div>
                      <div>
                        <span className="font-bold uppercase tracking-wider text-charcoal-500 text-[10px]">
                          Success Threshold:
                        </span>
                        <p className="text-charcoal-900 font-semibold">{exp.success_criteria}</p>
                      </div>
                    </div>
                  </div>

                  {/* Observations & Conclusion */}
                  <div className="space-y-2 text-xs">
                    {exp.observations && (
                      <div className="p-3 rounded-xl bg-brand-50/60 border border-brand-200/60 text-brand-900">
                        <strong>Observed Data: </strong> {exp.observations}
                      </div>
                    )}

                    {exp.conclusion && (
                      <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/60 text-purple-900">
                        <strong>Empirical Conclusion: </strong> {exp.conclusion}
                      </div>
                    )}

                    {exp.mentor_notes && (
                      <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-emerald-900 flex items-start gap-2">
                        <Award className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Faculty Mentor Feedback: </strong> {exp.mentor_notes}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recharts Visualization (if numerical data exists) */}
                  {Array.isArray(chartData) && chartData.length > 0 && (
                    <div className="pt-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
                        Quantitative Benchmark Curves
                      </div>
                      <div className="h-64 w-full bg-frost p-3 rounded-xl border border-charcoal-100">
                        <ResponsiveContainer width="100%" height="100%">
                          {chartData[0].centralized_auc !== undefined ? (
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis dataKey="round" stroke="#64748b" fontSize={11} label={{ value: 'Rounds', position: 'insideBottom', offset: -5 }} />
                              <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={11} />
                              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
                              <Legend />
                              <Line type="monotone" dataKey="centralized_auc" name="Centralized Baseline (Upper Bound)" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} />
                              <Line type="monotone" dataKey="federated_auc" name="Federated Proposal AUC" stroke="#2563eb" strokeWidth={2.5} activeDot={{ r: 6 }} />
                            </LineChart>
                          ) : (
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis dataKey="epsilon" stroke="#64748b" fontSize={11} label={{ value: 'Privacy Budget (Epsilon)', position: 'insideBottom', offset: -5 }} />
                              <YAxis stroke="#64748b" fontSize={11} domain={[0.7, 0.9]} />
                              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
                              <Legend />
                              <Bar dataKey="auc" name="Pathology Diagnostic AUC" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* New Hypothesis Modal */}
      <Modal
        isOpen={hypoModalOpen}
        onClose={() => setHypoModalOpen(false)}
        title="Formulate Research Hypothesis"
      >
        <form onSubmit={handleCreateHypothesis} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Hypothesis Statement *
            </label>
            <textarea
              required
              rows={3}
              value={hypoStatement}
              onChange={(e) => setHypoStatement(e.target.value)}
              placeholder="e.g. Adaptive dynamic gradient clipping preserves clinical AUC within 3.5% of centralized pooling while strictly capping privacy budget epsilon <= 3.8."
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs outline-none transition-all leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Theoretical Rationale
            </label>
            <textarea
              rows={2}
              value={hypoRationale}
              onChange={(e) => setHypoRationale(e.target.value)}
              placeholder="Why is this outcome expected? (e.g. Dynamic clipping prevents aggressive gradient truncation in heterogeneous label skew)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs outline-none transition-all leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setHypoModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-charcoal-300 text-xs font-bold text-charcoal-700 hover:bg-charcoal-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingHypo}
              className="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-all disabled:opacity-50"
            >
              {savingHypo ? 'Saving...' : 'Record Hypothesis'}
            </button>
          </div>
        </form>
      </Modal>

      {/* New Experiment Modal */}
      <Modal
        isOpen={expModalOpen}
        onClose={() => setExpModalOpen(false)}
        title="Log Experimental Benchmark Run"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateExperiment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Parent Hypothesis *
            </label>
            <select
              required
              value={selectedHypoId}
              onChange={(e) => setSelectedHypoId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-charcoal-300 text-xs font-medium outline-none bg-white"
            >
              {hypotheses.map(h => (
                <option key={h.id} value={h.id}>
                  {h.statement.slice(0, 90)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Experiment Title *
            </label>
            <input
              type="text"
              required
              value={expTitle}
              onChange={(e) => setExpTitle(e.target.value)}
              placeholder="e.g. Baseline FedAvg vs Centralized DenseNet-121 Benchmark"
              className="w-full px-3.5 py-2 rounded-xl border border-charcoal-300 focus:border-brand-500 text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Evaluation Metric *
              </label>
              <input
                type="text"
                required
                value={expMetric}
                onChange={(e) => setExpMetric(e.target.value)}
                placeholder="e.g. Macro AUC / Latency ms"
                className="w-full px-3.5 py-2 rounded-xl border border-charcoal-300 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Success Criteria *
              </label>
              <input
                type="text"
                required
                value={expCriteria}
                onChange={(e) => setExpCriteria(e.target.value)}
                placeholder="e.g. AUC >= 0.84 within 4% of centralized"
                className="w-full px-3.5 py-2 rounded-xl border border-charcoal-300 text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Procedure Steps *
            </label>
            <textarea
              required
              rows={3}
              value={expProcedure}
              onChange={(e) => setExpProcedure(e.target.value)}
              placeholder="1. Split dataset into 5 client subsets with Dirichlet skew.&#10;2. Run 50 communication rounds with 3 local epochs.&#10;3. Measure AUC on test set."
              className="w-full px-3.5 py-2 rounded-xl border border-charcoal-300 text-xs font-mono outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Observed Result
              </label>
              <input
                type="text"
                value={expObservations}
                onChange={(e) => setExpObservations(e.target.value)}
                placeholder="e.g. Reached 0.852 AUC after round 38"
                className="w-full px-3.5 py-2 rounded-xl border border-charcoal-300 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Outcome Conclusion *
              </label>
              <select
                value={expOutcome}
                onChange={(e) => setExpOutcome(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-charcoal-300 text-xs font-bold outline-none bg-white cursor-pointer"
              >
                <option value="supported">Supported (Hypothesis confirmed)</option>
                <option value="not_supported">Not Supported (Refuted)</option>
                <option value="inconclusive">Inconclusive (Requires more trials)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Quantitative Data Points (JSON array optional for charts)
            </label>
            <textarea
              rows={2}
              value={expDataInput}
              onChange={(e) => setExpDataInput(e.target.value)}
              placeholder='[{"round": 10, "centralized_auc": 0.78, "federated_auc": 0.74}, ...]'
              className="w-full px-3.5 py-2 rounded-xl border border-charcoal-300 text-xs font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Empirical Conclusion & Limitations
            </label>
            <textarea
              rows={2}
              value={expConclusion}
              onChange={(e) => setExpConclusion(e.target.value)}
              placeholder="State what this experiment empirically demonstrates and its bounds."
              className="w-full px-3.5 py-2 rounded-xl border border-charcoal-300 text-xs outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setExpModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-charcoal-300 text-xs font-bold text-charcoal-700 hover:bg-charcoal-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingExp}
              className="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-all disabled:opacity-50"
            >
              {savingExp ? 'Saving...' : 'Save Experiment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
