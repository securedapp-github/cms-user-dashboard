import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'active' | 'expired' | 'pending' | 'neutral' | 'info';
  dot?: boolean;
}

export function Badge({ className, variant = 'neutral', dot = false, children, ...props }: BadgeProps) {
  const variants = {
    active:  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    expired: "bg-red-50 text-red-700 ring-1 ring-red-200",
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    neutral: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    info:    "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  };

  const dotColors = {
    active:  "bg-emerald-500",
    expired: "bg-red-500",
    pending: "bg-amber-500",
    neutral: "bg-slate-400",
    info:    "bg-blue-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
