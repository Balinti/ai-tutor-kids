"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SessionSummary {
  totalProblems: number;
  correctCount: number;
  totalTime: number;
}

export default function TrialSummaryPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      const supabase = createClient();

      const { data: attempts } = await supabase
        .from("attempts")
        .select("is_correct, time_spent_seconds")
        .eq("session_id", sessionId)
        .not("submitted_at", "is", null);

      if (attempts) {
        setSummary({
          totalProblems: attempts.length,
          correctCount: attempts.filter((a) => a.is_correct).length,
          totalTime: attempts.reduce(
            (sum, a) => sum + (a.time_spent_seconds || 0),
            0
          ),
        });
      }

      setLoading(false);
    };

    loadSummary();
  }, [sessionId]);

  // Get trial ID from cookie for signup link
  const getTrialId = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/trial_id=([^;]+)/);
    return match ? match[1] : null;
  };

  const trialId = getTrialId();
  const signupUrl = trialId
    ? `/login?trial=${trialId}&redirect=/parent`
    : "/login?redirect=/parent";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Great Work!</CardTitle>
            <CardDescription>
              You completed the trial session
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {summary && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="text-2xl font-bold">{summary.totalProblems}</div>
                  <div className="text-xs text-muted-foreground">Problems</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="text-2xl font-bold text-green-600">
                    {summary.correctCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Correct</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="text-2xl font-bold">
                    {formatTime(summary.totalTime)}
                  </div>
                  <div className="text-xs text-muted-foreground">Time</div>
                </div>
              </div>
            )}

            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold">Ready for more?</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Create a free account to save your progress and continue
                practicing with personalized problems.
              </p>
            </div>

            <div className="space-y-2">
              <Button asChild size="lg" className="w-full">
                <Link href={signupUrl}>
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
