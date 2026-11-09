import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { WorkflowProgress } from '../../components/common/WorkflowProgress';
import { Card, CardHeader } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { 
  Users, 
  Award, 
  BookOpen, 
  Check, 
  Clock, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  Info,
  Calendar,
  Layers
} from 'lucide-react';

export function MentorMatching() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [assignedMentorId, setAssignedMentorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Request Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  useEffect(() => {
    loadRecommendations();
  }, [id]);

  async function loadRecommendations() {
    try {
      const projRes = await api.getProjectById(id);
      setProject(projRes.project);

      const recRes = await api.getMentorRecommendations(id);
      setRecommendations(recRes.recommendations || []);
      setAssignedMentorId(recRes.assigned_mentor_id);
    } catch (err) {
      setError(err.message || 'Failed to compute mentor matching');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenRequestModal = (mentor) => {
    setSelectedMentor(mentor);
    setRequestMessage(
      `Dear ${mentor.mentor_name}, I am researching "${project?.title}". Based on your expertise in ${mentor.expertise}, I would be honored to receive your guidance and review for this work.`
    );
    setRequestModalOpen(true);
    setSuccessBanner('');
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedMentor) return;

    setSendingRequest(true);
    setError('');

    try {
      await api.requestMentor(id, {
        mentor_id: selectedMentor.mentor_id,
        request_message: requestMessage
      });

      setRequestModalOpen(false);
      setSuccessBanner(`Mentorship request successfully sent to ${selectedMentor.mentor_name}!`);
      // Reload recommendations to reflect 'pending' status
      await loadRecommendations();
    } catch (err) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setSendingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-charcoal-400">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-brand-600" />
        <span className="text-sm font-semibold">Computing weighted mentor recommendations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-charcoal-400 mb-1">
          <Link to={`/projects/${id}`} className="hover:text-brand-600">Project Overview</Link>
          <span>/</span>
          <span className="text-charcoal-700 font-semibold">Stage 4: Mentor Matching</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
          Project-Based Mentor Matching
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
          Recommend faculty advisors based on domain alignment, technical skills, research interests, and active lab capacity
        </p>
      </div>

      {project && <WorkflowProgress currentStage={project.current_stage} projectId={project.id} />}

      {/* Success Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Matching Algorithm Information Card */}
      <Card className="bg-gradient-to-r from-frost via-white to-brand-50/40 border-brand-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-600" />
              <h3 className="font-bold text-charcoal-900 text-sm">Weighted Matching Criteria Formula</h3>
            </div>
            <p className="text-xs text-charcoal-600">
              Matches are objectively computed using normalized weights:
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded-md bg-brand-50 border border-brand-200 text-brand-700">Domain: 30%</span>
            <span className="px-2.5 py-1 rounded-md bg-accent-50 border border-accent-200 text-accent-700">Skills: 25%</span>
            <span className="px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-700">Interests: 20%</span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700">Experience: 15%</span>
            <span className="px-2.5 py-1 rounded-md bg-charcoal-100 border border-charcoal-200 text-charcoal-700">Capacity: 10%</span>
          </div>
        </div>
      </Card>

      {/* Mentor Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {recommendations.map((mentor) => {
          const isAssigned = mentor.is_assigned || mentor.mentor_id === assignedMentorId;
          const isPending = mentor.request_status === 'pending';
          const isRejected = mentor.request_status === 'rejected';
          const isAtCapacity = mentor.is_at_capacity;

          return (
            <Card key={mentor.mentor_id} className={`flex flex-col justify-between space-y-4 ${
              isAssigned ? 'ring-2 ring-emerald-500/30 border-emerald-300 bg-emerald-50/20' : ''
            }`}>
              <div className="space-y-3">
                {/* Header row: Mentor name & Match score */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {mentor.mentor_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-charcoal-900">{mentor.mentor_name}</h3>
                        {isAssigned && (
                          <Badge variant="success" size="sm">
                            <Check className="w-3 h-3" /> Assigned Mentor
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-charcoal-500 font-medium">
                        {mentor.department} • {mentor.institution}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-black text-brand-700">
                      {mentor.match_score}%
                    </div>
                    <div className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">
                      Match Score
                    </div>
                  </div>
                </div>

                {/* Match Score Progress Bar */}
                <div className="w-full bg-charcoal-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 to-accent-600 rounded-full"
                    style={{ width: `${mentor.match_score}%` }}
                  />
                </div>

                {/* Match Explanation */}
                <div className="p-3 bg-frost rounded-xl border border-charcoal-100 text-xs text-charcoal-700 leading-relaxed">
                  <strong>Why Recommended: </strong> {mentor.explanation}
                </div>

                {/* Expertise & Skills */}
                <div className="space-y-2">
                  <div>
                    <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider">
                      Research Expertise:
                    </span>
                    <p className="text-xs font-semibold text-charcoal-800 mt-0.5">
                      {mentor.expertise || 'General Computer Science'}
                    </p>
                  </div>

                  {mentor.skills && (
                    <div>
                      <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider">
                        Technical Stack:
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {mentor.skills.split(',').map((skill, sIdx) => (
                          <span key={sIdx} className="text-[11px] px-2 py-0.5 rounded-md bg-charcoal-100 text-charcoal-700 font-medium">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Capacity & Experience Status */}
                <div className="flex items-center justify-between text-xs text-charcoal-500 pt-2 border-t border-charcoal-100">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-accent-600" />
                    <span>{mentor.experience_years}+ years experience</span>
                  </div>
                  <div>
                    <span className="font-semibold text-charcoal-600">
                      Capacity: {mentor.current_capacity || 0} / {mentor.max_capacity || 5} students
                    </span>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="pt-2">
                {isAssigned ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-xs font-bold text-emerald-700">
                     Mentorship Active — Faculty Guidance Assigned
                  </div>
                ) : isPending ? (
                  <div className="w-full py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center text-xs font-bold text-amber-700 flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4" /> Request Pending Mentor Review
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isAtCapacity}
                    onClick={() => handleOpenRequestModal(mentor)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm shadow-brand-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isAtCapacity ? 'Mentor Full Capacity' : 'Request Mentorship'}
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Request Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title={`Request Mentorship — ${selectedMentor?.mentor_name}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSendRequest} className="space-y-4">
          <div className="p-3.5 bg-frost rounded-xl border border-charcoal-200 text-xs">
            <div className="font-bold text-charcoal-900">{project?.title}</div>
            <div className="text-charcoal-500 mt-0.5">Domain: {project?.domain}</div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Personalized Request Message
            </label>
            <textarea
              required
              rows={4}
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="State your research motivation and specific guidance you are seeking from this mentor..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs outline-none transition-all leading-relaxed"
            />
            <p className="text-[11px] text-charcoal-400 mt-1">
              Mentors receive your full project details, literature citations, and 5-dimension validation score with your request.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRequestModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-charcoal-300 text-xs font-bold text-charcoal-700 hover:bg-charcoal-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sendingRequest}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {sendingRequest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send Mentorship Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
