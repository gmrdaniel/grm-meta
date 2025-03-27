import { cn } from "@/lib/utils";

type StepperProps = {
  readonly steps: string[];
  currentStep: string;
};

export const Stepper = ({ steps, currentStep }: StepperProps) => (
  <div className="flex justify-between mb-6">
    {steps.map((step) => (
      <div key={step} className="flex-1 text-center">
        <div
          className={cn(
            "rounded-full w-8 h-8 mx-auto flex items-center justify-center text-white",
            currentStep === step ? "bg-indigo-600" : "bg-gray-300"
          )}
        >
          {steps.indexOf(step) + 1}
        </div>
        <p className="text-xs mt-2 capitalize">{step}</p>
      </div>
    ))}
  </div>
);
