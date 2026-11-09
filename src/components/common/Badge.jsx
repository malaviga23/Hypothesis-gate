import React from 'react';

export function Badge({ children, variant = 'slate', size = 'md', className = '' }) {
  const variantStyles = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    violet: 'bg-accent-50 text-accent-700 border-accent-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    slate: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-medium'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant] || variantStyles.slate} ${sizeStyles[size] || sizeStyles.md} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    draft: { label: 'Draft Proposal', variant: 'slate' },
    submitted: { label: 'Submitted', variant: 'brand' },
    under_review: { label: 'Under Review', variant: 'violet' },
    approved: { label: 'Approved', variant: 'success' },
    revision_requested: { label: 'Revision Requested', variant: 'warning' },
    rejected: { label: 'Rejected', variant: 'danger' },
    completed: { label: 'Completed', variant: 'success' },
    supported: { label: 'Supported', variant: 'success' },
    not_supported: { label: 'Not Supported', variant: 'danger' },
    inconclusive: { label: 'Inconclusive', variant: 'warning' },
    pending: { label: 'Pending', variant: 'warning' },
    accepted: { label: 'Accepted', variant: 'success' }
  };

  const item = map[status] || { label: status, variant: 'slate' };

  return <Badge variant={item.variant}>{item.label}</Badge>;
}
