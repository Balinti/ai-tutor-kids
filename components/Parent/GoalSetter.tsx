"use client";

import { useState } from "react";
import { Target, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface GoalSetterProps {
  childName: string;
  currentGoal?: {
    practiceMinutes: number;
    targetAccuracy: number;
  };
  onSave?: (goal: { practiceMinutes: number; targetAccuracy: number }) => void;
}

export function GoalSetter({ childName, currentGoal, onSave }: GoalSetterProps) {
  const [practiceMinutes, setPracticeMinutes] = useState(
    currentGoal?.practiceMinutes?.toString() || "10"
  );
  const [targetAccuracy, setTargetAccuracy] = useState(
    currentGoal?.targetAccuracy?.toString() || "80"
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave?.({
      practiceMinutes: parseInt(practiceMinutes),
      targetAccuracy: parseInt(targetAccuracy),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Weekly Goals</CardTitle>
        </div>
        <CardDescription>
          Set practice goals for {childName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="practice-minutes">Daily Practice Time</Label>
          <Select value={practiceMinutes} onValueChange={setPracticeMinutes}>
            <SelectTrigger id="practice-minutes">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="10">10 minutes</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="20">20 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-accuracy">Target Accuracy</Label>
          <Select value={targetAccuracy} onValueChange={setTargetAccuracy}>
            <SelectTrigger id="target-accuracy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="60">60% accuracy</SelectItem>
              <SelectItem value="70">70% accuracy</SelectItem>
              <SelectItem value="80">80% accuracy</SelectItem>
              <SelectItem value="90">90% accuracy</SelectItem>
              <SelectItem value="95">95% accuracy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button onClick={handleSave} className="flex-1">
            {saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved!
              </>
            ) : (
              "Save Goals"
            )}
          </Button>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-2">Current Goals:</p>
          <div className="flex gap-2">
            <Badge variant="outline">{practiceMinutes} min/day</Badge>
            <Badge variant="outline">{targetAccuracy}% accuracy</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
