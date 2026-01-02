"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Clock, Target, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLANS, type PlanType } from "@/lib/constants";

interface SessionStartCardProps {
  childId: string;
  childName: string;
  plan: PlanType;
  streak: number;
  todaySessions: number;
}

export function SessionStartCard({
  childId,
  childName,
  plan,
  streak,
  todaySessions,
}: SessionStartCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const maxSessions = PLANS[plan].dailySessions;
  const problemCount = PLANS[plan].problemsPerSession;
  const canStartSession = todaySessions < maxSessions;

  const handleStartSession = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });

      const data = await response.json();
      if (data.sessionId) {
        router.push(`/kid/${childId}/session/${data.sessionId}/problem/0`);
      }
    } catch (error) {
      console.error("Failed to start session:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Hey, {childName}!</CardTitle>
        <CardDescription>Ready to practice some math?</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{problemCount}</p>
            <p className="text-xs text-muted-foreground">Problems</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">~10</p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </div>
        </div>

        {canStartSession ? (
          <Button
            size="xl"
            className="w-full"
            onClick={handleStartSession}
            disabled={loading}
          >
            <Play className="mr-2 h-5 w-5" />
            {loading ? "Starting..." : "Start Practice"}
          </Button>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Great job today! You&apos;ve completed all your sessions.
            </p>
            <p className="text-xs text-muted-foreground">
              Come back tomorrow to continue your streak!
            </p>
          </div>
        )}

        {plan === "free" && todaySessions > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Want more practice?{" "}
            <a href="/parent/billing" className="text-primary hover:underline">
              Upgrade to Pro
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
