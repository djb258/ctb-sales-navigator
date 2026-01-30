import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/ui/utils";

interface ProgressStep {
  id: number;
  label: string;
  color: string;
}

interface ProgressIndicatorProps {
  currentStep: number;
}

const steps: ProgressStep[] = [
  { id: 1, label: "Discovery", color: "text-meeting1-emerald" },
  { id: 2, label: "Presentation", color: "text-meeting2-royal" },
  { id: 3, label: "Operations", color: "text-meeting3-crimson" },
  { id: 4, label: "Finalization", color: "text-meeting4-gold" },
];

const ProgressIndicator = ({ currentStep }: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex items-center gap-2">
            {currentStep > step.id ? (
              <CheckCircle2 className={cn("h-6 w-6", step.color)} />
            ) : currentStep === step.id ? (
              <div className={cn("h-6 w-6 rounded-full border-2", step.color)}>
                <Circle className={cn("h-5 w-5", step.color)} fill="currentColor" />
              </div>
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground" />
            )}
            <span className={cn(
              "text-sm font-medium hidden md:block",
              currentStep >= step.id ? step.color : "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              "w-8 md:w-16 h-0.5 mx-2 md:mx-4",
              currentStep > step.id ? step.color.replace('text-', 'bg-') : "bg-border"
            )}></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressIndicator;
