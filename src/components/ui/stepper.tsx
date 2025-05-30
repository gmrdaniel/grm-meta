
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  label: string;
};

type StepperProps = {
  steps: readonly Step[];
  currentStep: string;
  className?: string;
};

export const Stepper = ({ steps, currentStep, className }: StepperProps) => {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex md:justify-between gap-4 overflow-x-auto no-scrollbar px-1">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const stepNumber = index + 1;

          return (
            <div
              key={step.id}
              className="flex-shrink-0 flex-1 min-w-[90px] md:min-w-0 text-center"
            >
              <div
                className={cn(
                  "rounded-full w-9 h-9 mx-auto flex items-center justify-center text-sm font-bold transition",
                  isActive
                    ? "bg-[#ea384c] text-white shadow-lg"
                    : "bg-gray-300 text-white"
                )}
              >
                {stepNumber}
              </div>
              <p
                title={step.label}
                className={cn(
                  "text-xs mt-2 text-ellipsis whitespace-nowrap overflow-hidden",
                  isActive && "text-[#ea384c] font-medium"
                )}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
