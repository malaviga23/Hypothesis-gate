import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { WorkflowProgress } from '../../components/common/WorkflowProgress';
import { Card, CardHeader } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { 
  Search, 
  BookOpen, 
  ExternalLink, 
  BookmarkPlus, 
  Trash2, 
  GitCompare, 
  AlertCircle, 
  Check, 
  HelpCircle, 
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function ResearchAnalysis() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [savedPapers, setSavedPapers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'saved'

  // Comparison Modal state
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparing, setComparing] = useState(false);

  // Saving state
  const [savingPaperId, setSavingPaperId] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const res = await api.getProjectById(id);
      setProject(res.project);
      setSavedPapers(res.papers || []);
      // Set initial search query based on project domain or title
      if (!searchQuery && res.project) {
        setSearchQuery(res.project.domain.split('&')[0].trim());
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  }

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError('');
    setActiveTab('search');

    try {
      const data = await api.searchLiterature(searchQuery);
      setSearchResults(data.results || []);
    } catch (err) {
      setSearchError(err.message || 'Unable to connect to OpenAlex academic database. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCompare = async (paper) => {
    setSelectedPaper(paper);
    setCompareModalOpen(true);
    setComparing(true);
    setComparisonResult(null);

    try {
      const res = await api.comparePaper(id, {
        title: paper.title,
        abstract: paper.full_abstract || paper.abstract
      });
      setComparisonResult(res.comparison);
    } catch (err) {
      alert(err.message || 'Comparison failed');
    } finally {
      setComparing(false);
    }
  };

  const handleSavePaper = async (paper) => {
    setSavingPaperId(paper.id);
    try {
      const res = await api.savePaper(id, {
        title: paper.title,
        authors: paper.authors,
        publication_year: paper.publication_year,
        abstract: paper.full_abstract || paper.abstract,
        source_url: paper.source_url,
        doi: paper.doi,
        relevance_score: paper.cited_by_count > 50 ? 88 : 75,
        comparison_notes: `Saved via OpenAlex query: "${searchQuery}"`
      });

      // Reload saved papers
      const savedRes = await api.getSavedPapers(id);
      setSavedPapers(savedRes.papers || []);
    } catch (err) {
      alert(err.message || 'Failed to save paper');
    } finally {
      setSavingPaperId(null);
    }
  };

  const handleDeleteSavedPaper = async (paperId) => {
    if (!window.confirm('Remove this paper from project references?')) return;
    try {
      await api.deletePaper(id, paperId);
      setSavedPapers(prev => prev.filter(p => p.id !== paperId));
    } catch (err) {
      alert(err.message || 'Failed to remove paper');
    }
  };

  const isPaperAlreadySaved = (title) => {
    return savedPapers.some(p => p.title.toLowerCase() === title.toLowerCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-charcoal-400 mb-1">
          <Link to={`/projects/${id}`} className="hover:text-brand-600">Project Overview</Link>
          <span>/</span>
          <span className="text-charcoal-700 font-semibold">Stage 2: Research Analysis</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
          Academic Literature & Prior Art Analysis
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
          Search real peer-reviewed papers via OpenAlex to baseline your methodology and identify research gaps
        </p>
      </div>

      {project && <WorkflowProgress currentStage={project.current_stage} projectId={project.id} />}

      {/* Tabs */}
      <div className="flex border-b border-charcoal-200">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 py-3 px-5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'search'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          <Search className="w-4 h-4" /> OpenAlex Live Repository
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 py-3 px-5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'saved'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Saved Project Literature ({savedPapers.length})
        </button>
      </div>

      {/* TAB 1: Search OpenAlex */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search Box */}
          <Card>
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter keywords e.g. Federated Learning medical imaging, differential privacy, transformer caching..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs sm:text-sm outline-none transition-all shadow-2xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-brand-500/25 transition-all disabled:opacity-50"
                >
                  {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search Literature
                </button>
              </div>

              {/* Sample Quick Searches */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal-500 pt-1">
                <span className="font-semibold text-charcoal-400">Quick Searches:</span>
                {[
                  'Federated Learning healthcare',
                  'Differential Privacy deep learning',
                  'Semantic cache LLM',
                  'Multi-agent reinforcement learning'
                ].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => { setSearchQuery(q); }}
                    className="px-2.5 py-1 rounded-md bg-frost hover:bg-charcoal-100 border border-charcoal-200 text-charcoal-600 text-[11px] font-medium transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </form>
          </Card>

          {/* Error Message */}
          {searchError && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3 text-amber-800 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <div className="font-bold">OpenAlex API Status Notice</div>
                  <div className="mt-0.5 text-xs text-amber-700">{searchError}</div>
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="px-3 py-1 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Search Results */}
          {searchLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-charcoal-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-brand-600" />
              <span className="text-sm font-semibold">Querying OpenAlex global academic repository...</span>
              <span className="text-xs text-charcoal-400 mt-1">Reconstructing abstracts and metadata</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-charcoal-200/80 p-8">
              <BookOpen className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-charcoal-800">
                {searchQuery ? 'Ready to search' : 'Search academic works'}
              </h3>
              <p className="text-xs text-charcoal-500 max-w-md mx-auto mt-1 mb-4">
                Enter your research keywords or select a quick search query above to fetch peer-reviewed publications.
              </p>
              <button
                type="button"
                onClick={handleSearch}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors"
              >
                Search "{searchQuery}"
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1 text-xs text-charcoal-500">
                <span>Showing <strong>{searchResults.length}</strong> peer-reviewed papers</span>
                <span className="text-[11px] text-charcoal-400">Powered by OpenAlex API</span>
              </div>

              {searchResults.map((paper) => {
                const isSaved = isPaperAlreadySaved(paper.title);
                const isSaving = savingPaperId === paper.id;

                return (
                  <Card key={paper.id || paper.title} className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                            {paper.publication_year || 'Recent'}
                          </span>
                          {paper.cited_by_count > 0 && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-charcoal-100 text-charcoal-600">
                              {paper.cited_by_count} Citations
                            </span>
                          )}
                          {paper.doi && (
                            <span className="text-[11px] font-mono text-charcoal-400">
                              DOI: {paper.doi}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-charcoal-900 leading-snug">
                          {paper.title}
                        </h3>

                        <p className="text-xs text-charcoal-500 font-medium">
                          {paper.authors}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCompare(paper)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent-200 bg-accent-50 hover:bg-accent-100 text-accent-700 text-xs font-bold transition-colors"
                          title="Compare with my idea"
                        >
                          <GitCompare className="w-3.5 h-3.5" /> Compare Idea
                        </button>

                        <button
                          type="button"
                          disabled={isSaved || isSaving}
                          onClick={() => handleSavePaper(paper)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            isSaved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                              : 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
                          }`}
                        >
                          {isSaved ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Linked
                            </>
                          ) : isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <BookmarkPlus className="w-3.5 h-3.5" /> Link Paper
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Abstract */}
                    <div className="bg-frost p-3.5 rounded-xl border border-charcoal-100 text-xs text-charcoal-600 leading-relaxed">
                      <p className="line-clamp-3 hover:line-clamp-none transition-all">
                        {paper.abstract || 'No abstract preview available for this work.'}
                      </p>
                    </div>

                    {/* Source link */}
                    {paper.source_url && (
                      <div className="flex justify-end pt-1">
                        <a
                          href={paper.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:underline"
                        >
                          Read Source Article <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Saved Literature */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedPapers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-charcoal-200/80 p-8">
              <BookOpen className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-charcoal-800">No papers linked yet</h3>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1 mb-4">
                Linking literature directly improves your Evidence Validation score and helps mentors evaluate academic grounding.
              </p>
              <button
                onClick={() => setActiveTab('search')}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors"
              >
                Search Papers Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1 text-xs text-charcoal-500">
                <span><strong>{savedPapers.length}</strong> benchmark references linked to this project</span>
                <Link
                  to={`/projects/${id}/validation`}
                  className="font-bold text-brand-600 hover:underline flex items-center gap-1"
                >
                  Proceed to Validation <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {savedPapers.map((paper, idx) => (
                <Card key={paper.id} className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Ref #{idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-charcoal-500">
                          {paper.publication_year || 'Year n/a'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-charcoal-900">{paper.title}</h3>
                      <p className="text-xs text-charcoal-500">{paper.authors}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteSavedPaper(paper.id)}
                      className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {paper.abstract && (
                    <p className="text-xs text-charcoal-600 bg-frost p-3 rounded-xl border border-charcoal-100 leading-relaxed line-clamp-3">
                      {paper.abstract}
                    </p>
                  )}

                  {paper.comparison_notes && (
                    <div className="text-xs text-brand-800 bg-brand-50/60 p-2.5 rounded-lg border border-brand-200/60">
                      <strong>Relevance Note: </strong> {paper.comparison_notes}
                    </div>
                  )}

                  {paper.source_url && (
                    <div className="flex justify-end pt-1">
                      <a
                        href={paper.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:underline"
                      >
                        Source Article <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comparison Modal */}
      <Modal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        title="Prior Art Comparison & Research Questions"
        maxWidth="max-w-3xl"
      >
        {comparing ? (
          <div className="flex flex-col items-center justify-center py-12 text-charcoal-400">
            <Loader2 className="w-7 h-7 animate-spin mb-3 text-brand-600" />
            <span className="text-sm font-semibold">Running keyword overlap and text similarity...</span>
          </div>
        ) : comparisonResult ? (
          <div className="space-y-5 text-xs sm:text-sm">
            {/* Paper Header */}
            <div className="p-3.5 bg-frost rounded-xl border border-charcoal-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">Target Paper</span>
              <h4 className="font-bold text-charcoal-900 text-sm mt-0.5">{selectedPaper?.title}</h4>
              <p className="text-xs text-charcoal-500 mt-0.5">{selectedPaper?.authors} ({selectedPaper?.publication_year})</p>
            </div>

            {/* Overlap Relevance Gauge */}
            <div className="flex items-center justify-between p-4 bg-brand-50 rounded-xl border border-brand-200">
              <div>
                <div className="font-bold text-brand-900 text-sm">Keyword Overlap Score</div>
                <div className="text-xs text-brand-700 mt-0.5">Calculated using Jaccard term-frequency intersection</div>
              </div>
              <div className="text-2xl font-black text-brand-700">
                {comparisonResult.relevance_score}%
              </div>
            </div>

            {/* Shared Keywords */}
            <div>
              <h4 className="font-bold text-charcoal-800 text-xs uppercase tracking-wider mb-2">
                Identified Shared Technical Terms:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {comparisonResult.shared_keywords?.map(kw => (
                  <span key={kw} className="px-2.5 py-1 rounded-md bg-charcoal-100 text-charcoal-700 font-mono text-xs">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Similarities */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900">
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 mb-1">
                Similarities with Your Submitted Proposal
              </h4>
              <p className="text-xs leading-relaxed">{comparisonResult.similarities}</p>
            </div>

            {/* Potential Differences */}
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-900">
              <h4 className="font-bold text-xs uppercase tracking-wider text-purple-800 mb-1.5">
                Distinguishing Differences & Novelty Scope
              </h4>
              <ul className="space-y-1 list-disc list-inside text-xs leading-relaxed">
                {comparisonResult.potential_differences?.map((diff, i) => (
                  <li key={i}>{diff}</li>
                ))}
              </ul>
            </div>

            {/* Questions for Further Research */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 mb-1.5">
                Questions Requiring Further Research
              </h4>
              <ul className="space-y-1 list-disc list-inside text-xs leading-relaxed">
                {comparisonResult.questions_for_further_research?.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCompareModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-charcoal-300 text-xs font-bold text-charcoal-700 hover:bg-charcoal-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSavePaper(selectedPaper);
                  setCompareModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-sm"
              >
                Link Paper to Project
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
