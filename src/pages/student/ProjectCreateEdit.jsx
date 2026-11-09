import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Card, CardHeader } from '../../components/common/Card';
import { 
  FolderPlus, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  HelpCircle,
  Code2,
  FlaskConical,
  Target
} from 'lucide-react';

const POPULAR_DOMAINS = [
  'Healthcare AI & Medical Imaging',
  'Natural Language Processing',
  'Distributed Systems & Edge Computing',
  'Computer Vision & Robotics',
  'Cybersecurity & Privacy Engineering',
  'IoT & Smart Energy Grids',
  'Bioinformatics & Computational Biology',
  'Applied Machine Learning'
];

export function ProjectCreateEdit() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    domain: POPULAR_DOMAINS[0],
    customDomain: '',
    problem_statement: '',
    limitations: '',
    proposed_solution: '',
    objectives: '',
    technologies: '',
    expected_outcome: '',
    initial_hypothesis: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoadSample = () => {
    setFormData({
      title: 'Decentralized Microgrid Energy Dispatch via Reinforcement Learning',
      domain: 'IoT & Smart Energy Grids',
      customDomain: '',
      problem_statement: 'Unpredictable renewable generation and fluctuating household demand cause severe voltage instability and transmission losses in localized suburban microgrids. Centralized utility dispatch suffers from communication latency and single points of failure.',
      limitations: 'Existing rule-based load shedding and centralized PID controllers cannot adapt in real-time to sudden cloud cover or solar intermittency. High latency communication backhauls lead to oscillatory voltage swings.',
      proposed_solution: 'A multi-agent reinforcement learning (MARL) framework where smart battery inverters act as autonomous decentralized agents exchanging local state estimates to optimize active and reactive power dispatch.',
      objectives: '1. Model a 14-bus distribution microgrid environment with solar PV and battery storage.\n2. Formulate a decentralized Multi-Agent DDPG (MADDPG) dispatch algorithm.\n3. Benchmark voltage violation rate and peak-to-average power ratio against central optimal power flow (OPF).',
      technologies: 'Python, PyTorch, Gym-ANM / OpenDSS, NumPy, FastAPI, Redis',
      expected_outcome: 'Achieve > 30% reduction in peak-hour transmission losses and zero critical voltage violations (< 0.95 p.u.) during abrupt cloud shading events.',
      initial_hypothesis: 'Decentralized multi-agent reinforcement learning agents can stabilize distribution bus voltage within +/- 5% margins in under 200ms without requiring global telemetry.'
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalDomain = formData.domain === 'Other' ? formData.customDomain : formData.domain;

    if (!formData.title.trim()) {
      setError('Please provide a project title');
      return;
    }
    if (!formData.problem_statement.trim() || formData.problem_statement.trim().length < 20) {
      setError('Please provide an elaborated problem statement (at least 20 characters)');
      return;
    }
    if (!formData.proposed_solution.trim() || formData.proposed_solution.trim().length < 20) {
      setError('Please describe your proposed solution and methodology (at least 20 characters)');
      return;
    }
    if (!formData.objectives.trim()) {
      setError('Please outline concrete project objectives');
      return;
    }

    setLoading(true);

    try {
      const res = await api.createProject({
        title: formData.title,
        domain: finalDomain || 'General Computing',
        problem_statement: formData.problem_statement,
        limitations: formData.limitations,
        proposed_solution: formData.proposed_solution,
        objectives: formData.objectives,
        technologies: formData.technologies,
        expected_outcome: formData.expected_outcome,
        initial_hypothesis: formData.initial_hypothesis
      });

      navigate(`/projects/${res.projectId}`);
    } catch (err) {
      setError(err.message || 'Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
            Submit Research Proposal
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
            Stage 1: Articulate your project concept for literature comparison and validation
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent-50 border border-accent-200 text-accent-700 hover:bg-accent-100 font-bold text-xs transition-colors self-start sm:self-auto shadow-2xs"
        >
          <Sparkles className="w-4 h-4 text-accent-600" /> Autofill Sample Idea
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs sm:text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader
            title="1. Project Identification & Scope"
            subtitle="Core title and research domain classification"
          />

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Federated Learning for Privacy-Preserving Chest X-ray Anomaly Detection"
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm font-semibold outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Research Domain *
                </label>
                <select
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs sm:text-sm font-medium outline-none transition-all bg-white cursor-pointer"
                >
                  {POPULAR_DOMAINS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                  <option value="Other">Other / Interdisciplinary</option>
                </select>
              </div>

              {formData.domain === 'Other' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                    Specify Custom Domain
                  </label>
                  <input
                    type="text"
                    name="customDomain"
                    value={formData.customDomain}
                    onChange={handleChange}
                    placeholder="e.g. Quantum Algorithms, AgriTech"
                    className="w-full px-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm outline-none transition-all"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="2. Problem Statement & Motivation"
            subtitle="Detail the pain point and why existing approaches fall short"
          />

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                  Problem Statement *
                </label>
                <span className="text-[11px] text-charcoal-400">
                  {formData.problem_statement.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                name="problem_statement"
                required
                rows={4}
                value={formData.problem_statement}
                onChange={handleChange}
                placeholder="Describe the real-world or theoretical challenge. What fails? Who is affected? What are the practical or clinical consequences?"
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs sm:text-sm outline-none transition-all leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Existing System Limitations
              </label>
              <textarea
                name="limitations"
                rows={3}
                value={formData.limitations}
                onChange={handleChange}
                placeholder="What are the specific shortcomings of current commercial or academic solutions (e.g. high latency, privacy leakage, scalability bottlenecks)?"
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs sm:text-sm outline-none transition-all leading-relaxed"
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="3. Proposed Solution & Objectives"
            subtitle="Your proposed architecture, milestones, and tech stack"
          />

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                  Proposed Solution & Methodology *
                </label>
                <span className="text-[11px] text-charcoal-400">
                  {formData.proposed_solution.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                name="proposed_solution"
                required
                rows={4}
                value={formData.proposed_solution}
                onChange={handleChange}
                placeholder="Explain the technical design, algorithmic approach, or architectural novelty of your proposed solution."
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs sm:text-sm outline-none transition-all leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Phased Milestone Objectives * (Numbered list recommended)
              </label>
              <textarea
                name="objectives"
                required
                rows={3}
                value={formData.objectives}
                onChange={handleChange}
                placeholder="1. Build data preprocessing pipeline.&#10;2. Implement core model architecture.&#10;3. Benchmark against baseline X and evaluate metric Y."
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs sm:text-sm font-mono outline-none transition-all leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Proposed Technologies & Tools
                </label>
                <input
                  type="text"
                  name="technologies"
                  value={formData.technologies}
                  onChange={handleChange}
                  placeholder="e.g. PyTorch, React, Node.js, Docker, FAISS"
                  className="w-full px-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Expected Measurable Outcome
                </label>
                <input
                  type="text"
                  name="expected_outcome"
                  value={formData.expected_outcome}
                  onChange={handleChange}
                  placeholder="e.g. 35% reduction in latency with AUC >= 0.88"
                  className="w-full px-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="4. Initial Testable Hypothesis"
            subtitle="Falsifiable claim to be validated in the Hypothesis Lab"
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Initial Hypothesis Statement
            </label>
            <textarea
              name="initial_hypothesis"
              rows={2}
              value={formData.initial_hypothesis}
              onChange={handleChange}
              placeholder="e.g. Using adaptive dynamic gradient clipping will preserve clinical AUC within 3.5% of centralized pooling while strictly capping privacy budget epsilon <= 3.8."
              className="w-full px-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs sm:text-sm outline-none transition-all leading-relaxed"
            />
            <p className="text-[11px] text-charcoal-500 mt-1.5">
              Tip: A good hypothesis specifies cause, effect, and measurable threshold.
            </p>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-5 py-2.5 rounded-xl border border-charcoal-300 text-xs font-bold text-charcoal-700 hover:bg-charcoal-100 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting Proposal...' : 'Create & Proceed to Stage 2: Research'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
