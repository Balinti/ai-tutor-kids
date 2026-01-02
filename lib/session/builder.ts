import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS, type PlanType } from "@/lib/constants";

interface Problem {
  id: string;
  grade: number;
  standard_id: string;
  difficulty: number;
}

interface Mastery {
  standard_id: string;
  accuracy_rolling: number;
  attempts_count: number;
}

export async function buildSession(
  childId: string,
  grade: number,
  plan: PlanType
): Promise<{ sessionId: string; problems: Array<{ problemId: string; position: number }> }> {
  const supabase = createAdminClient();
  const targetCount = PLANS[plan].problemsPerSession;

  // Get child's mastery data
  const { data: masteryData } = await supabase
    .from("mastery")
    .select("standard_id, accuracy_rolling, attempts_count")
    .eq("child_id", childId);

  const mastery: Mastery[] = masteryData || [];

  // Get available problems for the child's grade
  const { data: problems } = await supabase
    .from("problems")
    .select("id, grade, standard_id, difficulty")
    .eq("grade", grade)
    .eq("active", true);

  if (!problems || problems.length === 0) {
    throw new Error("No problems available for this grade");
  }

  // Select problems using adaptive algorithm
  const selectedProblems = selectProblems(problems, mastery, targetCount);

  // Create session
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      child_id: childId,
      plan_at_time: plan,
      target_problem_count: targetCount,
    })
    .select()
    .single();

  if (sessionError || !session) {
    throw new Error("Failed to create session");
  }

  // Create session_problems entries
  const sessionProblems = selectedProblems.map((p, index) => ({
    session_id: session.id,
    problem_id: p.id,
    position: index,
  }));

  const { error: spError } = await supabase
    .from("session_problems")
    .insert(sessionProblems);

  if (spError) {
    throw new Error("Failed to create session problems");
  }

  return {
    sessionId: session.id,
    problems: sessionProblems.map((sp) => ({
      problemId: sp.problem_id,
      position: sp.position,
    })),
  };
}

function selectProblems(
  problems: Problem[],
  mastery: Mastery[],
  targetCount: number
): Problem[] {
  const masteryMap = new Map(mastery.map((m) => [m.standard_id, m]));

  // Score each problem based on:
  // 1. Standards the child struggles with (low accuracy)
  // 2. Standards with few attempts (need more practice)
  // 3. Appropriate difficulty progression
  const scoredProblems = problems.map((problem) => {
    const m = masteryMap.get(problem.standard_id);
    let score = 0;

    if (!m) {
      // New standard - prioritize for exposure
      score = 100;
    } else {
      // Lower accuracy = higher priority
      score += (100 - m.accuracy_rolling) * 0.5;
      // Fewer attempts = higher priority
      score += Math.max(0, 20 - m.attempts_count) * 2;
    }

    // Add some randomness to avoid repetitive sessions
    score += Math.random() * 20;

    return { problem, score };
  });

  // Sort by score descending
  scoredProblems.sort((a, b) => b.score - a.score);

  // Select problems ensuring variety in standards
  const selected: Problem[] = [];
  const usedStandards = new Set<string>();

  // First pass: get variety of standards
  for (const { problem } of scoredProblems) {
    if (selected.length >= targetCount) break;
    if (!usedStandards.has(problem.standard_id)) {
      selected.push(problem);
      usedStandards.add(problem.standard_id);
    }
  }

  // Second pass: fill remaining slots
  for (const { problem } of scoredProblems) {
    if (selected.length >= targetCount) break;
    if (!selected.includes(problem)) {
      selected.push(problem);
    }
  }

  // Sort by difficulty for better progression
  selected.sort((a, b) => a.difficulty - b.difficulty);

  return selected;
}

export async function getSessionProgress(sessionId: string) {
  const supabase = createAdminClient();

  const { data: session } = await supabase
    .from("sessions")
    .select(`
      *,
      session_problems (
        problem_id,
        position,
        problems (*)
      ),
      attempts (*)
    `)
    .eq("id", sessionId)
    .single();

  if (!session) {
    return null;
  }

  const completedAttempts = session.attempts?.filter(
    (a: { submitted_at: string | null }) => a.submitted_at !== null
  ) || [];

  return {
    session,
    totalProblems: session.session_problems?.length || 0,
    completedProblems: completedAttempts.length,
    currentPosition: completedAttempts.length,
  };
}

export async function completeSession(sessionId: string) {
  const supabase = createAdminClient();

  const { data: attempts } = await supabase
    .from("attempts")
    .select("time_spent_seconds")
    .eq("session_id", sessionId)
    .not("submitted_at", "is", null);

  const totalTime = attempts?.reduce(
    (sum: number, a: { time_spent_seconds: number }) => sum + a.time_spent_seconds,
    0
  ) || 0;

  const { error } = await supabase
    .from("sessions")
    .update({
      ended_at: new Date().toISOString(),
      completed_problem_count: attempts?.length || 0,
      total_time_seconds: totalTime,
    })
    .eq("id", sessionId);

  if (error) {
    throw new Error("Failed to complete session");
  }
}
