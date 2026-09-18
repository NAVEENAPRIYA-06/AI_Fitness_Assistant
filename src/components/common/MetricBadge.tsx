import React from 'react';

interface MetricBadgeProps {
  label: string;
  variant?: 'emerald' | 'teal' | 'amber' | 'rose' | 'slate' | 'indigo' | 'purple';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const MetricBadge: React.FC<MetricBadgeProps> = ({
  label,
  variant = 'teal',
  size = 'md',
  icon
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/25',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    slate: 'bg-slate-800/60 text-slate-300 border-slate-700/80',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/25'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border tracking-tight whitespace-nowrap shadow-2xs ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </span>
  );
};
