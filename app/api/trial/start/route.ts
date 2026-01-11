import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { TRIAL_PROBLEMS_COUNT } from "@/lib/constants";

const RequestSchema = z.object({
  grade: z.number().int().min(5).max(8),
});

function generateTrialId(): string {
  return `trial_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { grade } = RequestSchema.parse(body);

    const supabase = createAdminClient();
    const trialId = generateTrialId();

    // Get or create demo parent profile
    const demoEmail = "demo@wordproblemcoach.app";
    const demoParentId = "00000000-0000-0000-0000-000000000000";

    const { data: existingParent } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", demoEmail)
      .single();

    if (!existingParent) {
      // Create demo parent profile using admin client
      const { error: parentError } = await supabase
        .from("profiles")
        .insert({
          id: demoParentId,
          email: demoEmail,
          full_name: "Demo Parent",
          role: "parent",
        });

      if (parentError && !parentError.message.includes("duplicate")) {
        console.error("Failed to create demo parent:", parentError);
        return NextResponse.json(
          { error: "Failed to initialize trial" },
          { status: 500 }
        );
      }
    }

    // Create a temporary demo child for this trial
    const { data: child, error: childError } = await supabase
      .from("children")
      .insert({
        parent_id: demoParentId,
        name: "Trial User",
        grade,
        trial_id: trialId,
      })
      .select()
      .single();

    if (childError || !child) {
      console.error("Failed to create trial child:", childError);
      return NextResponse.json(
        { error: "Failed to create trial session" },
        { status: 500 }
      );
    }

    // Get problems for the grade
    const { data: problems } = await supabase
      .from("problems")
      .select("id, grade, standard_id, difficulty")
      .eq("grade", grade)
      .eq("active", true)
      .order("difficulty")
      .limit(50);

    if (!problems || problems.length === 0) {
      return NextResponse.json(
        { error: "No problems available for this grade" },
        { status: 400 }
      );
    }

    // Select problems (simple random selection for trial)
    const shuffled = problems.sort(() => Math.random() - 0.5);
    const selectedProblems = shuffled.slice(0, TRIAL_PROBLEMS_COUNT);

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        child_id: child.id,
        trial_id: trialId,
        plan_at_time: "free",
        target_problem_count: TRIAL_PROBLEMS_COUNT,
      })
      .select()
      .single();

    if (sessionError || !session) {
      console.error("Failed to create trial session:", sessionError);
      return NextResponse.json(
        { error: "Failed to create trial session" },
        { status: 500 }
      );
    }

    // Create session_problems entries
    const sessionProblems = selectedProblems.map((p, index) => ({
      session_id: session.id,
      problem_id: p.id,
      position: index,
    }));

    await supabase.from("session_problems").insert(sessionProblems);

    // Store trial info in cookie
    const cookieStore = await cookies();
    cookieStore.set("trial_id", trialId, {
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
      httpOnly: false,
    });

    cookieStore.set("trial_child_id", child.id, {
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
      httpOnly: false,
    });

    cookieStore.set("trial_session_id", session.id, {
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
      httpOnly: false,
    });

    cookieStore.set("trial_start", Date.now().toString(), {
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
      httpOnly: false,
    });

    return NextResponse.json({
      ok: true,
      trialId,
      childId: child.id,
      sessionId: session.id,
      sessionUrl: `/try/session/${session.id}/problem/0`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid grade. Must be 5-8." },
        { status: 400 }
      );
    }

    console.error("Trial start error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
