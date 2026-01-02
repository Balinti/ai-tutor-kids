"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STEP_DESCRIPTIONS } from "@/lib/constants";

interface StepSolveProps {
  onComplete: (content: string, answer: string, equation?: string) => void;
  initialValue?: string;
  initialAnswer?: string;
}

export function StepSolve({
  onComplete,
  initialValue = "",
  initialAnswer = "",
}: StepSolveProps) {
  const [work, setWork] = useState(initialValue);
  const [answer, setAnswer] = useState(initialAnswer);

  const handleSubmit = () => {
    if (work.trim() && answer.trim()) {
      onComplete(work, answer);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Step 3: Solve</CardTitle>
        <p className="text-sm text-muted-foreground">
          {STEP_DESCRIPTIONS.solve}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="work">Show your work</Label>
          <textarea
            id="work"
            className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
            placeholder="Step 1: ...&#10;Step 2: ...&#10;Step 3: ..."
            value={work}
            onChange={(e) => setWork(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="answer">Your final answer</Label>
          <Input
            id="answer"
            placeholder="Enter your answer (e.g., 42, 3/4, 15%)"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="text-lg font-semibold"
          />
          <p className="text-xs text-muted-foreground">
            Enter numbers, fractions (1/2), decimals (0.5), or percentages (50%)
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">Remember:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Show each step clearly</li>
            <li>Double-check your arithmetic</li>
            <li>Include units if the problem asks for them</li>
          </ul>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!work.trim() || !answer.trim()}
          className="w-full"
        >
          Continue to Check
        </Button>
      </CardContent>
    </Card>
  );
}
