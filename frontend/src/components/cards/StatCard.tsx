import React from 'react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  meta?: string;
  metaIcon?: React.ReactNode;
  metaType?: 'success' | 'warning' | 'danger' | 'neutral';
  icon?: React.ReactNode;
  accentColor?: string;   // tailwind bg class e.g. "bg-indigo-500"
  className?: string;
}

export function StatCard({
  title,
  value,
  meta,
  metaIcon,
  metaType = 'neutral',
  icon,
  accentColor = 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1]',
  className
}: StatCardProps) {
  
  const metaColors = {
    success: 'text-emerald-600 bg-emerald-50',
    warning: 'text-amber-600 bg-amber-50',
    danger:  'text-red-600 bg-red-50',
    neutral: 'text-[#64748b] bg-[#f8fafc]',
  };

  return (
    <div
      className={cn(
        "relative bg-white rounded-[16px] overflow-hidden",
        "border border-[#e2e8f0]",
        "shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]",
        "transition-all duration-300",
        "hover:-translate-y-1.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.10)]",
        "group cursor-default",
        className
      )}
    >
      {/* Top accent bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-[3px]", accentColor)} />

      <div className="p-5 pt-6">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">{title}</p>
          {icon && (
            <div className="w-9 h-9 rounded-[10px] bg-[#eef2ff] flex items-center justify-center text-[#4f46e5] shrink-0 group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          )}
        </div>

        <p className="text-3xl font-bold text-[#0f172a] tracking-tight mb-3">{value}</p>

        {meta && (
          <div className={cn(
            "inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1",
            metaColors[metaType]
          )}>
            {metaIcon}
            <span>{meta}</span>
          </div>
        )}
      </div>

      {/* Subtle bottom glow on hover */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#4f46e5]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
