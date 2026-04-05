import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#0f172a] mb-0.5 block text-start">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 text-sm rounded-[10px]",
            "border border-[#e2e8f0] bg-[#f9fafb] text-[#0f172a]",
            "placeholder:text-[#94a3b8]",
            "transition-all duration-200",
            "focus:outline-none focus:border-[#4f46e5] focus:bg-white",
            "focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]",
            "hover:border-[#cbd5e1]",
            error && "border-[#ef4444] bg-[#fef2f2] focus:border-[#ef4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#f8fafc]",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <span className="text-xs text-[#64748b] mt-0.5">{hint}</span>
        )}
        {error && (
          <span className="text-xs text-[#ef4444] font-medium mt-0.5 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-[#ef4444] inline-block" />
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
