import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = String(id || label?.toLowerCase().replace(/\s+/g, '-') || 'select-input');
    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[#0f172a] mb-0.5 block">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "appearance-none w-full px-4 py-2.5 text-sm rounded-[10px] pr-10",
              "border border-[#e2e8f0] bg-[#f9fafb] text-[#0f172a]",
              "transition-all duration-200",
              "focus:outline-none focus:border-[#4f46e5] focus:bg-white",
              "focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]",
              "hover:border-[#cbd5e1]",
              "cursor-pointer",
              error && "border-[#ef4444] bg-[#fef2f2] focus:border-[#ef4444]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          >
            <option value="" disabled className="text-[#94a3b8]">
              Select an option
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#64748b]">
            <ChevronDown size={15} />
          </div>
        </div>
        {error && (
          <span className="text-xs text-[#ef4444] font-medium mt-0.5">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
