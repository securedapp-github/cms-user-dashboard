import { cn } from '../../utils/cn';

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Switch({ checked, onCheckedChange, disabled, className, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
        "transition-all duration-300 ease-in-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2",
        checked
          ? "bg-gradient-to-r from-[#4f46e5] to-[#6366f1] shadow-[0_2px_8px_rgba(79,70,229,0.25)]"
          : "bg-[#e2e8f0]",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {/* Track glow when active */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inline-block h-5 w-5 transform rounded-full bg-white shadow-md",
          "ring-0 transition-transform duration-300 ease-in-out",
          "left-0.5",
          checked ? "translate-x-5" : "translate-x-0"
        )}
        style={{
          boxShadow: checked
            ? '0 1px 4px rgba(79,70,229,0.20), 0 0 0 1px rgba(79,70,229,0.08)'
            : '0 1px 3px rgba(0,0,0,0.12)',
        }}
      />
    </button>
  );
}
