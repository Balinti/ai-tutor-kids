import { createAdminClient } from "@/lib/supabase/admin";

export interface MasteryStats {
  standardId: string;
  standardCode: string;
  domain: string;
  description: string;
  attemptsCount: number;
  correctCount: number;
  accuracy: number;
  avgTimeSeconds: number;
  trend: "improving" | "stable" | "struggling";
}

export async function getChildMastery(childId: string): Promise<MasteryStats[]> {
  const supabase = createAdminClient();

  const { data: masteryData } = await supabase
    .from("mastery")
    .select(`
      *,
      standards (
        code,
        domain,
        description
      )
    `)
    .eq("child_id", childId)
    .order("updated_at", { ascending: false });

  if (!masteryData) return [];

  return masteryData.map((m) => ({
    standardId: m.standard_id,
    standardCode: m.standards.code,
    domain: m.standards.domain,
    description: m.standards.description,
    attemptsCount: m.attempts_count,
    correctCount: m.correct_count,
    accuracy: Number(m.accuracy_rolling),
    avgTimeSeconds: Number(m.avg_time_seconds),
    trend: getTrend(m.accuracy_rolling, m.attempts_count),
  }));
}

function getTrend(
  accuracy: number,
  attempts: number
): "improving" | "stable" | "struggling" {
  if (attempts < 3) return "stable";
  if (accuracy >= 80) return "improving";
  if (accuracy <= 40) return "struggling";
  return "stable";
}

export async function getStandardsBreakdown(
  childId: string,
  grade: number
): Promise<{
  mastered: MasteryStats[];
  progressing: MasteryStats[];
  needsWork: MasteryStats[];
  notStarted: Array<{ standardId: string; code: string; domain: string; description: string }>;
}> {
  const supabase = createAdminClient();

  // Get all standards for grade
  const { data: allStandards } = await supabase
    .from("standards")
    .select("*")
    .eq("grade", grade);

  // Get child's mastery
  const mastery = await getChildMastery(childId);
  const masteryMap = new Map(mastery.map((m) => [m.standardId, m]));

  const mastered: MasteryStats[] = [];
  const progressing: MasteryStats[] = [];
  const needsWork: MasteryStats[] = [];
  const notStarted: Array<{
    standardId: string;
    code: string;
    domain: string;
    description: string;
  }> = [];

  for (const standard of allStandards || []) {
    const m = masteryMap.get(standard.id);

    if (!m) {
      notStarted.push({
        standardId: standard.id,
        code: standard.code,
        domain: standard.domain,
        description: standard.description,
      });
    } else if (m.accuracy >= 80 && m.attemptsCount >= 5) {
      mastered.push(m);
    } else if (m.accuracy >= 50 || m.attemptsCount < 5) {
      progressing.push(m);
    } else {
      needsWork.push(m);
    }
  }

  return { mastered, progressing, needsWork, notStarted };
}

export async function getRecentActivity(
  childId: string,
  days: number = 7
): Promise<{
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  avgTimeSeconds: number;
  practiceDays: number;
  streak: number;
}> {
  const supabase = createAdminClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: attempts } = await supabase
    .from("attempts")
    .select("*")
    .eq("child_id", childId)
    .gte("submitted_at", startDate.toISOString())
    .not("submitted_at", "is", null);

  if (!attempts || attempts.length === 0) {
    return {
      totalAttempts: 0,
      correctAttempts: 0,
      accuracy: 0,
      avgTimeSeconds: 0,
      practiceDays: 0,
      streak: 0,
    };
  }

  const correctAttempts = attempts.filter((a) => a.is_correct).length;
  const totalTime = attempts.reduce((sum, a) => sum + a.time_spent_seconds, 0);

  // Calculate practice days
  const uniqueDays = new Set(
    attempts.map((a) =>
      new Date(a.submitted_at!).toISOString().split("T")[0]
    )
  );

  // Calculate streak
  const streak = await calculateStreak(childId);

  return {
    totalAttempts: attempts.length,
    correctAttempts,
    accuracy: Math.round((correctAttempts / attempts.length) * 100),
    avgTimeSeconds: Math.round(totalTime / attempts.length),
    practiceDays: uniqueDays.size,
    streak,
  };
}

async function calculateStreak(childId: string): Promise<number> {
  const supabase = createAdminClient();

  // Get sessions ordered by date
  const { data: sessions } = await supabase
    .from("sessions")
    .select("started_at")
    .eq("child_id", childId)
    .not("ended_at", "is", null)
    .order("started_at", { ascending: false });

  if (!sessions || sessions.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const sessionDates = new Set(
    sessions.map((s) => new Date(s.started_at).toISOString().split("T")[0])
  );

  // Check consecutive days going backwards
  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toISOString().split("T")[0];
    if (sessionDates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      // Allow skipping today if no session yet
      break;
    }
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}
