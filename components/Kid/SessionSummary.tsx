"use client";

import Link from "next/link";
import { CheckCircle, XCircle, Clock, Target, Flame, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatTime, formatPercentage } from "@/lib/utils";

interface SessionSummaryProps {
  childId: string;
  childName: string;
  sessionStats: {
    totalProblems: number;
    correctProblems: number;
    totalTimeSeconds: number;
    hintsUsed: number;
  };
  streak: number;
}

export function SessionSummary({
  childId,
  childName,
  sessionStats,
  streak,
}: SessionSummaryProps) {
  const accuracy = Math.round(
    (sessionStats.correctProblems / sessionStats.totalProblems) * 100
  );
  const avgTimePerProblem = Math.round(
    sessionStats.totalTimeSeconds / sessionStats.totalProblems
  );

  const getMessage = () => {
    if (accuracy === 100) return "Perfect score! Amazing work!";
    if (accuracy >= 80) return "Great job! Keep it up!";
    if (accuracy >= 60) return "Good effort! Practice makes perfect!";
    return "Keep practicing! You're getting better!";
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Session Complete!</CardTitle>
          <CardDescription>Great work today, {childName}!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-4xl font-bold text-primary">
            {formatPercentage(accuracy)}
          </div>
          <Progress value={accuracy} className="h-3" />
          <p className="text-muted-foreground">{getMessage()}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sessionStats.correctProblems}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {sessionStats.totalProblems - sessionStats.correctProblems}
                </p>
                <p className="text-xs text-muted-foreground">Incorrect</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatTime(sessionStats.totalTimeSeconds)}
                </p>
                <p className="text-xs text-muted-foreground">Total Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Hints Used</p>
                <p className="text-sm text-muted-foreground">
                  {sessionStats.hintsUsed} hints
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">Avg Time/Problem</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(avgTimePerProblem)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href={`/kid/${childId}`} className="flex-1">
          <Button variant="outline" className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </Link>
        <Link href={`/kid/${childId}/session`} className="flex-1">
          <Button className="w-full">Practice Again</Button>
        </Link>
      </div>
    </div>
  );
}
