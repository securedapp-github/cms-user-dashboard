import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    
    const baseClass = [
      "inline-flex items-center justify-center font-semibold",
      "transition-all duration-200 ease-in-out",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
      "cursor-pointer select-none",
    ].join(' ');
    
    const variants = {
      primary: [
        "bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white",
        "shadow-[0_4px_12px_rgba(79,70,229,0.25)]",
        "hover:shadow-[0_6px_20px_rgba(79,70,229,0.35)] hover:-translate-y-0.5",
        "active:translate-y-0 active:shadow-[0_2px_8px_rgba(79,70,229,0.2)]",
        "focus-visible:ring-[#4f46e5]",
      ].join(' '),
      secondary: [
        "bg-[#eef2ff] text-[#4f46e5]",
        "hover:bg-[#e0e7ff] hover:-translate-y-0.5",
        "focus-visible:ring-[#4f46e5]",
      ].join(' '),
      outline: [
        "bg-transparent text-[#4f46e5] border border-[#4f46e5]",
        "hover:bg-[#eef2ff] hover:-translate-y-0.5",
        "focus-visible:ring-[#4f46e5]",
      ].join(' '),
      ghost: [
        "bg-transparent text-[#64748b]",
        "hover:bg-[#f1f5f9] hover:text-[#0f172a]",
        "focus-visible:ring-[#64748b]",
      ].join(' '),
      danger: [
        "bg-[#ef4444] text-white",
        "shadow-[0_4px_12px_rgba(239,68,68,0.2)]",
        "hover:bg-[#dc2626] hover:shadow-[0_6px_20px_rgba(239,68,68,0.3)] hover:-translate-y-0.5",
        "focus-visible:ring-[#ef4444]",
      ].join(' '),
    };

    const sizes = {
      sm: "h-8 px-3.5 text-xs rounded-[8px] gap-1.5",
      md: "h-10 px-5 text-sm rounded-[10px] gap-2",
      lg: "h-12 px-7 text-base rounded-[12px] gap-2",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(baseClass, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isLoading && children}
      </button>
    );
  }
);

Button.displayName = "Button";
