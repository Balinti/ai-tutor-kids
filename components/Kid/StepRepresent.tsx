"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STEP_DESCRIPTIONS } from "@/lib/constants";

interface StepRepresentProps {
  onComplete: (content: string) => void;
  initialValue?: string;
}

export function StepRepresent({
  onComplete,
  initialValue = "",
}: StepRepresentProps) {
  const [representation, setRepresentation] = useState(initialValue);

  const handleSubmit = () => {
    if (representation.trim()) {
      onComplete(representation);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Step 2: Represent</CardTitle>
        <p className="text-sm text-muted-foreground">
          {STEP_DESCRIPTIONS.represent}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="representation">
            Write an equation, draw a diagram, or create a table to represent
            the problem
          </Label>
          <textarea
            id="representation"
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
            placeholder="Example: Let x = number of apples&#10;3x + 5 = 20"
            value={representation}
            onChange={(e) => setRepresentation(e.target.value)}
          />
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">Ways to represent:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Equation: Use variables like x for unknown values</li>
            <li>Table: Organize the information in rows and columns</li>
            <li>Diagram: Draw a picture to visualize the problem</li>
            <li>Ratio: Set up a proportion if comparing quantities</li>
          </ul>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!representation.trim()}
          className="w-full"
        >
          Continue to Solve
        </Button>
      </CardContent>
    </Card>
  );
}
