import React from 'react';

export function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-charcoal-200/80 shadow-sm p-5 sm:p-6 transition-all duration-200 ${
        hover ? 'hover:shadow-md hover:border-brand-300 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-charcoal-100 ${className}`}>
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-charcoal-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
