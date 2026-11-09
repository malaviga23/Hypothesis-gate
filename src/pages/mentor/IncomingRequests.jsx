import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, CardHeader } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { StatusBadge, Badge } from '../../components/common/Badge';
import { 
  Inbox, 
  Check, 
  X, 
  Clock, 
  User, 
  School, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  Sparkles,
  MessageSquare
} from 'lucide-react';

export function IncomingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Response Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [decision, setDecision] = useState('accepted');
  const [responseMsg, setResponseMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const res = await api.getIncomingRequests();
      setRequests(res.requests || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenResponseModal = (req, dec) => {
    setActiveRequest(req);
    setDecision(dec);
    setResponseMsg(
      dec === 'accepted'
        ? 'Proposal accepted. Looking forward to reviewing your literature synthesis and experimental benchmarks.'
        : 'Thank you for your interest. Due to current lab scope constraints, I am unable to accept this request at this time.'
    );
    setModalOpen(true);
  };

  const handleConfirmResponse = async (e) => {
    e.preventDefault();
    if (!activeRequest) return;

    setSubmitting(true);
    try {
      await api.respondToRequest(activeRequest.id, {
        decision,
        response_message: responseMsg
      });
      setModalOpen(false);
      await loadRequests();
    } catch (err) {
      alert(err.message || 'Failed to update request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-charcoal-400">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-accent-600" />
        <span className="text-sm font-semibold">Loading student mentorship requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
          Incoming Mentorship Requests
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
          Student research proposals requesting your faculty supervision
        </p>
      </div>

      {requests.length === 0 ? (
        <Card className="text-center py-16 bg-white">
          <Inbox className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-charcoal-800">No requests in queue</h3>
          <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
            When students match with your expertise profile and request guidance, they will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => {
            const isPending = r.status === 'pending';
            const isAccepted = r.status === 'accepted';
            const isRejected = r.status === 'rejected';

            return (
              <Card key={r.id} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={r.status} />
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                        {r.project_domain}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-accent-50 text-accent-700 border border-accent-200">
                        {r.match_score}% Match Alignment
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-charcoal-900 mt-1">
                      {r.project_title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-charcoal-500 font-medium">
                      <User className="w-3.5 h-3.5" />
                      <span>{r.student_name} ({r.student_email})</span>
                      <span>•</span>
                      <School className="w-3.5 h-3.5" />
                      <span>{r.student_institution || 'NIT'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isPending && (
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => handleOpenResponseModal(r, 'rejected')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-charcoal-300 text-xs font-bold text-charcoal-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                      <button
                        onClick={() => handleOpenResponseModal(r, 'accepted')}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept Mentorship
                      </button>
                    </div>
                  )}
                </div>

                {/* Request Message */}
                <div className="p-3.5 rounded-xl bg-frost border border-charcoal-100 text-xs text-charcoal-700 leading-relaxed">
                  <div className="font-bold text-charcoal-900 mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-accent-600" /> Student Request Message:
                  </div>
                  "{r.request_message || 'I would like to request your academic mentorship for this research idea.'}"
                </div>

                {/* Response Message (if already responded) */}
                {r.response_message && (
                  <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                    isAccepted ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-charcoal-100 text-charcoal-700'
                  }`}>
                    <strong>Your Response: </strong> "{r.response_message}"
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Response Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={decision === 'accepted' ? 'Accept Mentorship Request' : 'Decline Request'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleConfirmResponse} className="space-y-4">
          <p className="text-xs text-charcoal-600">
            {decision === 'accepted'
              ? `You are accepting ${activeRequest?.student_name}'s proposal: "${activeRequest?.project_title}". This project will be added to your supervised portfolio.`
              : `You are declining ${activeRequest?.student_name}'s request.`}
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Response Note to Student
            </label>
            <textarea
              required
              rows={3}
              value={responseMsg}
              onChange={(e) => setResponseMsg(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 text-xs outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-charcoal-300 text-xs font-bold text-charcoal-700 hover:bg-charcoal-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-50 ${
                decision === 'accepted' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting ? 'Updating...' : decision === 'accepted' ? 'Confirm Acceptance' : 'Confirm Decline'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
