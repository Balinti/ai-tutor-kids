"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Clock, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrialExpiredModalProps {
  trialId: string | null;
}

export function TrialExpiredModal({ trialId }: TrialExpiredModalProps) {
  const signupUrl = trialId ? `/login?trial=${trialId}&redirect=/parent` : "/login?redirect=/parent";

  return (
    <DialogPrimitive.Root open={true}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:rounded-lg"
          )}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Clock className="h-8 w-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Trial Complete!</h2>
              <p className="text-muted-foreground">
                You&apos;ve seen how WordProblem Coach helps kids master math.
                Create a free account to continue learning.
              </p>
            </div>

            <div className="w-full rounded-lg border bg-muted/50 p-4 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold">What you get with a free account:</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  Your trial progress saved
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  1 child profile
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  3 problems per day
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  Progress tracking
                </li>
              </ul>
            </div>

            <Button asChild size="lg" className="w-full">
              <a href={signupUrl}>Create Free Account</a>
            </Button>

            <p className="text-xs text-muted-foreground">
              No credit card required. Upgrade anytime for unlimited practice.
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
