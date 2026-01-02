"use client";

import { useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STEP_DESCRIPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StepCheckProps {
  problemId: string;
  answer: string;
  onComplete: (content: string, isCorrect: boolean) => void;
  initialValue?: string;
}

export function StepCheck({
  problemId,
  answer,
  onComplete,
  initialValue = "",
}: StepCheckProps) {
  const [reasoning, setReasoning] = useState(initialValue);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    message?: string;
  } | null>(null);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          finalAnswer: answer,
        }),
      });

      const data = await response.json();
      setResult({
        isCorrect: data.isCorrect,
        message: data.details?.message,
      });
    } catch (error) {
      console.error("Verification failed:", error);
      setResult({
        isCorrect: false,
        message: "Could not verify answer. Please try again.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = () => {
    if (result) {
      onComplete(reasoning, result.isCorrect);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Step 4: Check Your Answer</CardTitle>
        <p className="text-sm text-muted-foreground">
          {STEP_DESCRIPTIONS.check}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Your answer:</p>
          <p className="text-2xl font-bold">{answer}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reasoning">
            Does your answer make sense? Explain why:
          </Label>
          <textarea
            id="reasoning"
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="My answer makes sense because..."
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
          />
        </div>

        {!result ? (
          <Button
            onClick={handleVerify}
            disabled={verifying || !reasoning.trim()}
            className="w-full"
          >
            {verifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Check My Answer"
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg p-4",
                result.isCorrect
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {result.isCorrect ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <XCircle className="h-6 w-6" />
              )}
              <div>
                <p className="font-semibold">
                  {result.isCorrect ? "Correct!" : "Not quite right"}
                </p>
                {result.message && (
                  <p className="text-sm opacity-80">{result.message}</p>
                )}
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full">
              {result.isCorrect ? "Continue" : "Next Problem"}
            </Button>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">Check your work:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Is your answer reasonable for the problem?</li>
            <li>Did you answer what the problem asked?</li>
            <li>Can you plug your answer back in to verify?</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
