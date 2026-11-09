import React from 'react';
import { Sparkles } from 'lucide-react';

export function EmptyState({ icon: Icon = Sparkles, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-dashed border-charcoal-300">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-charcoal-900 mb-1">{title}</h3>
      <p className="text-sm text-charcoal-500 max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
