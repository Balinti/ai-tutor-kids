import { createAdminClient } from "@/lib/supabase/admin";

interface WeeklyReportData {
  parentId: string;
  childId: string;
  childName: string;
  grade: number;
  weekStart: string;
  weekEnd: string;
  accuracy: number;
  avgTimeSeconds: number;
  problemsCompleted: number;
  practiceDays: number;
  missedDays: number;
  improvedStandards: Array<{ code: string; improvement: number }>;
  stuckStandards: Array<{ code: string; accuracy: number }>;
  nextWeekFocus: Array<{ code: string; reason: string }>;
}

export async function generateWeeklyReport(
  childId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<WeeklyReportData | null> {
  const supabase = createAdminClient();

  // Get child info
  const { data: child } = await supabase
    .from("children")
    .select("*, profiles!inner(*)")
    .eq("id", childId)
    .single();

  if (!child) return null;

  // Get attempts for the week
  const { data: attempts } = await supabase
    .from("attempts")
    .select(`
      *,
      standards (code, domain, description)
    `)
    .eq("child_id", childId)
    .gte("submitted_at", weekStart.toISOString())
    .lte("submitted_at", weekEnd.toISOString())
    .not("submitted_at", "is", null);

  if (!attempts || attempts.length === 0) {
    return null;
  }

  // Calculate stats
  const correctAttempts = attempts.filter((a) => a.is_correct).length;
  const totalTime = attempts.reduce((sum, a) => sum + a.time_spent_seconds, 0);

  // Calculate practice days
  const practiceDays = new Set(
    attempts.map((a) => new Date(a.submitted_at!).toISOString().split("T")[0])
  ).size;

  // Calculate standard-level stats
  const standardStats = new Map<
    string,
    { code: string; correct: number; total: number; previousAccuracy: number }
  >();

  for (const attempt of attempts) {
    const code = attempt.standards.code;
    const existing = standardStats.get(code) || {
      code,
      correct: 0,
      total: 0,
      previousAccuracy: 0,
    };
    existing.total++;
    if (attempt.is_correct) existing.correct++;
    standardStats.set(code, existing);
  }

  // Get previous week mastery for comparison
  const previousWeekEnd = new Date(weekStart);
  previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);

  // Calculate improvements and struggles
  const improvedStandards: Array<{ code: string; improvement: number }> = [];
  const stuckStandards: Array<{ code: string; accuracy: number }> = [];
  const nextWeekFocus: Array<{ code: string; reason: string }> = [];

  for (const [code, stats] of standardStats) {
    const accuracy = (stats.correct / stats.total) * 100;

    if (accuracy >= 80 && stats.total >= 3) {
      improvedStandards.push({ code, improvement: accuracy });
    } else if (accuracy < 50 && stats.total >= 2) {
      stuckStandards.push({ code, accuracy });
      nextWeekFocus.push({ code, reason: "Needs more practice" });
    }
  }

  // Limit focus areas
  const focusAreas = nextWeekFocus.slice(0, 3);

  return {
    parentId: child.parent_id,
    childId: child.id,
    childName: child.name,
    grade: child.grade,
    weekStart: weekStart.toISOString().split("T")[0],
    weekEnd: weekEnd.toISOString().split("T")[0],
    accuracy: Math.round((correctAttempts / attempts.length) * 100),
    avgTimeSeconds: Math.round(totalTime / attempts.length),
    problemsCompleted: attempts.length,
    practiceDays,
    missedDays: 7 - practiceDays,
    improvedStandards,
    stuckStandards,
    nextWeekFocus: focusAreas,
  };
}

export async function saveWeeklyReport(report: WeeklyReportData) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("weekly_reports")
    .upsert(
      {
        parent_id: report.parentId,
        child_id: report.childId,
        week_start: report.weekStart,
        week_end: report.weekEnd,
        accuracy: report.accuracy,
        avg_time_seconds: report.avgTimeSeconds,
        problems_completed: report.problemsCompleted,
        practice_days: report.practiceDays,
        missed_days: report.missedDays,
        improved_standards: report.improvedStandards,
        stuck_standards: report.stuckStandards,
        next_week_focus: report.nextWeekFocus,
      },
      {
        onConflict: "child_id,week_start,week_end",
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getWeeklyReports(parentId: string, limit: number = 10) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("weekly_reports")
    .select(`
      *,
      children (name, grade)
    `)
    .eq("parent_id", parentId)
    .order("week_end", { ascending: false })
    .limit(limit);

  return data || [];
}

export async function getAllChildrenForReports(): Promise<
  Array<{ id: string; parent_id: string; name: string; grade: number }>
> {
  const supabase = createAdminClient();

  // Get children whose parents have active/trialing subscriptions
  const { data } = await supabase
    .from("children")
    .select(`
      id,
      parent_id,
      name,
      grade,
      profiles!inner (
        subscriptions!inner (plan, status)
      )
    `)
    .in("profiles.subscriptions.status", ["active", "trialing"])
    .in("profiles.subscriptions.plan", ["pro", "pro_plus"]);

  return (
    data?.map((c) => ({
      id: c.id,
      parent_id: c.parent_id,
      name: c.name,
      grade: c.grade,
    })) || []
  );
}
