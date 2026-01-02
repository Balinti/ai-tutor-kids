"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SessionSummary } from "@/components/Kid/SessionSummary";

interface SessionStats {
  totalProblems: number;
  correctProblems: number;
  totalTimeSeconds: number;
  hintsUsed: number;
}

export default function SessionSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;
  const sessionId = params.sessionId as string;

  const [loading, setLoading] = useState(true);
  const [childName, setChildName] = useState("");
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const loadSummary = async () => {
      const supabase = createClient();

      // Get child name
      const { data: child } = await supabase
        .from("children")
        .select("name")
        .eq("id", childId)
        .single();

      if (child) {
        setChildName(child.name);
      }

      // Get session with attempts
      const { data: session } = await supabase
        .from("sessions")
        .select(`
          id,
          total_time_seconds,
          attempts (
            is_correct,
            time_spent_seconds,
            hints_used
          )
        `)
        .eq("id", sessionId)
        .single();

      if (session) {
        const attempts = session.attempts || [];
        const correctCount = attempts.filter((a: { is_correct: boolean }) => a.is_correct).length;
        const totalTime = attempts.reduce(
          (sum: number, a: { time_spent_seconds: number }) => sum + (a.time_spent_seconds || 0),
          0
        );
        const totalHints = attempts.reduce(
          (sum: number, a: { hints_used: number }) => sum + (a.hints_used || 0),
          0
        );

        setStats({
          totalProblems: attempts.length,
          correctProblems: correctCount,
          totalTimeSeconds: totalTime || session.total_time_seconds,
          hintsUsed: totalHints,
        });

        // Mark session as ended
        await supabase
          .from("sessions")
          .update({
            ended_at: new Date().toISOString(),
            completed_problem_count: attempts.length,
            total_time_seconds: totalTime,
          })
          .eq("id", sessionId);
      }

      // Get streak (simplified)
      setStreak(1);

      setLoading(false);
    };

    loadSummary();
  }, [childId, sessionId]);

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background p-4 pt-12">
      <SessionSummary
        childId={childId}
        childName={childName}
        sessionStats={stats}
        streak={streak}
      />
    </div>
  );
}
