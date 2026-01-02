"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS, STEP_LABELS, type Step } from "@/lib/constants";

interface StepperProps {
  currentStep: Step;
  completedSteps: Step[];
  onStepClick?: (step: Step) => void;
}

export function Stepper({
  currentStep,
  completedSteps,
  onStepClick,
}: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step);
          const isCurrent = currentStep === step;
          const isClickable = isCompleted || isCurrent;

          return (
            <div key={step} className="flex items-center flex-1">
              <button
                onClick={() => isClickable && onStepClick?.(step)}
                disabled={!isClickable}
                className={cn(
                  "relative flex flex-col items-center",
                  isClickable && "cursor-pointer"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      !isCompleted &&
                      "border-primary bg-primary/10 text-primary",
                    !isCompleted &&
                      !isCurrent &&
                      "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    isCurrent || isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {STEP_LABELS[step]}
                </span>
              </button>

              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2",
                    completedSteps.includes(STEPS[index + 1]) ||
                      (isCompleted && isCurrent)
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
