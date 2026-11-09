import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  Users, 
  CheckCircle, 
  FlaskConical, 
  Download,
  Check
} from 'lucide-react';

export function WorkflowProgress({ currentStage, projectId }) {
  const stages = [
    { key: 'submission', label: 'Idea Submission', path: `/projects/${projectId}`, icon: FileText },
    { key: 'research', label: 'Research Analysis', path: `/projects/${projectId}/research`, icon: Search },
    { key: 'validation', label: 'Evidence Validation', path: `/projects/${projectId}/validation`, icon: ShieldCheck },
    { key: 'mentor_matching', label: 'Mentor Matching', path: `/projects/${projectId}/mentors`, icon: Users },
    { key: 'mentor_review', label: 'Mentor Review', path: `/projects/${projectId}`, icon: CheckCircle },
    { key: 'hypothesis_testing', label: 'Hypothesis Lab', path: `/projects/${projectId}/hypotheses`, icon: FlaskConical },
    { key: 'completed', label: 'Final Report', path: `/projects/${projectId}/report`, icon: Download },
  ];

  const stageKeys = stages.map(s => s.key);
  const currentIndex = stageKeys.indexOf(currentStage) !== -1 ? stageKeys.indexOf(currentStage) : 0;

  return (
    <div className="bg-white rounded-2xl border border-charcoal-200/80 shadow-sm p-4 sm:p-5 mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
          Research Workflow Progression
        </span>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
          Stage {currentIndex + 1} of {stages.length}
        </span>
      </div>

      <div className="relative">
        {/* Step circles and links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const Icon = stage.icon;

            return (
              <Link
                key={stage.key}
                to={stage.path}
                className={`flex flex-col items-center text-center p-2 rounded-xl transition-all duration-200 group ${
                  isCurrent
                    ? 'bg-brand-50/80 border border-brand-300 ring-2 ring-brand-500/20 shadow-sm'
                    : isCompleted
                    ? 'hover:bg-charcoal-50 text-charcoal-700'
                    : 'opacity-60 hover:opacity-100 hover:bg-charcoal-50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 scale-105'
                      : 'bg-charcoal-100 text-charcoal-500 group-hover:bg-charcoal-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-xs font-medium leading-tight ${
                    isCurrent ? 'text-brand-900 font-bold' : isCompleted ? 'text-charcoal-800' : 'text-charcoal-500'
                  }`}
                >
                  {stage.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
