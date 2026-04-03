import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Step {
  label: string;
  date?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed — steps before this index are "completed"
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex flex-col md:flex-row relative justify-between w-full gap-0">
      {/* Desktop connecting line */}
      <div className="absolute top-5 left-8 right-8 hidden md:block -z-10">
        {/* Full track */}
        <div className="h-0.5 w-full bg-[#e2e8f0]" />
        {/* Filled portion */}
        <div
          className="h-0.5 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] absolute top-0 left-0 transition-all duration-700"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive    = index === currentStep;
        const isPending   = index > currentStep;

        return (
          <div
            key={index}
            className="flex flex-row md:flex-col items-start md:items-center relative z-10 mb-6 md:mb-0 flex-1"
          >
            {/* Mobile vertical track line */}
            {index !== steps.length - 1 && (
              <div className="absolute top-10 left-5 md:hidden -z-10">
                <div className="w-0.5 h-[calc(100%-16px)] bg-[#e2e8f0]" />
                {isCompleted && (
                  <div className="w-0.5 h-full bg-gradient-to-b from-[#4f46e5] to-[#6366f1] absolute top-0 left-0" />
                )}
              </div>
            )}

            {/* Step circle */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300",
                isCompleted && "border-[#4f46e5] bg-gradient-to-br from-[#4f46e5] to-[#6366f1] shadow-[0_4px_12px_rgba(79,70,229,0.25)]",
                isActive    && "border-[#4f46e5] bg-white shadow-[0_0_0_4px_rgba(79,70,229,0.12)]",
                isPending   && "border-[#e2e8f0] bg-white",
              )}
            >
              {isCompleted ? (
                <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
              ) : (
                <span className={cn(
                  "text-sm font-bold",
                  isActive  && "text-[#4f46e5]",
                  isPending && "text-[#94a3b8]",
                )}>
                  {index + 1}
                </span>
              )}
            </div>

            {/* Label */}
            <div className="ml-4 md:ml-0 md:mt-3 md:text-center max-w-[120px]">
              <p className={cn(
                "text-sm font-semibold leading-snug",
                isCompleted && "text-[#4f46e5]",
                isActive    && "text-[#0f172a]",
                isPending   && "text-[#94a3b8]",
              )}>
                {step.label}
              </p>
              {step.date && (
                <p className={cn(
                  "text-xs mt-0.5",
                  step.date === 'Pending' ? "text-[#94a3b8] italic" : "text-[#64748b]"
                )}>
                  {step.date}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
