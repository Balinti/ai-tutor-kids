"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STEP_DESCRIPTIONS } from "@/lib/constants";

interface StepReadProps {
  onComplete: (content: string) => void;
  initialValue?: string;
}

export function StepRead({ onComplete, initialValue = "" }: StepReadProps) {
  const [understanding, setUnderstanding] = useState(initialValue);

  const handleSubmit = () => {
    if (understanding.trim()) {
      onComplete(understanding);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Step 1: Read & Understand</CardTitle>
        <p className="text-sm text-muted-foreground">
          {STEP_DESCRIPTIONS.read}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="understanding">
            In your own words, what is this problem asking you to find?
          </Label>
          <textarea
            id="understanding"
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="The problem is asking me to find..."
            value={understanding}
            onChange={(e) => setUnderstanding(e.target.value)}
          />
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">Tips:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>What numbers or quantities are given?</li>
            <li>What is the question asking you to find?</li>
            <li>Are there any keywords like &quot;total&quot;, &quot;each&quot;, or &quot;per&quot;?</li>
          </ul>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!understanding.trim()}
          className="w-full"
        >
          Continue to Represent
        </Button>
      </CardContent>
    </Card>
  );
}
