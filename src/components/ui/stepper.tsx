import { cn } from "@/lib/utils";

type Step = {
  id: string;
  label: string;
};

type StepperProps = {
  steps: readonly Step[];
  currentStep: string;
};

export const Stepper = ({ steps, currentStep }: StepperProps) => {
  return (
    <div className="mb-8">
      <div className="flex md:justify-between gap-4 overflow-x-auto no-scrollbar ">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const stepNumber = index + 1;

          return (
            <div
              key={step.id}
              className="flex-shrink-0 flex-grow text-center"
              style={{ flexBasis: "0", minWidth: "70px" }} // Ajuste para evitar scroll
            >
              <div
                className={cn(
                  "rounded-full w-9 h-9 mx-auto flex items-center justify-center text-sm font-bold transition",
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-gray-300 text-white"
                )}
              >
                {stepNumber}
              </div>
              <p
                title={step.label}
                className={cn(
                  "text-xs mt-2",
                  isActive ? "text-indigo-600 font-medium" : "text-gray-600"
                )}
                style={{
                  display: "-webkit-box", // Habilitar el comportamiento de caja flexible
                  WebkitLineClamp: 2, // Limitar a 2 líneas
                  WebkitBoxOrient: "vertical", // Orientación vertical para el texto
                  overflow: "hidden", // Ocultar el texto que exceda las 2 líneas
                  textOverflow: "ellipsis", // Mostrar puntos suspensivos si es necesario
                  wordBreak: "break-word", // Romper palabras largas para evitar desbordamientos
                  whiteSpace: "normal", // Permitir que el texto se ajuste automáticamente
                }}
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