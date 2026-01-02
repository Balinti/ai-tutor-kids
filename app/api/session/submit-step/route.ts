import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyKidToken } from "@/lib/auth/requireKidAccess";
import { STEPS } from "@/lib/constants";

const RequestSchema = z.object({
  sessionId: z.string().uuid(),
  problemId: z.string().uuid(),
  attemptId: z.string().uuid().optional(),
  step: z.enum(STEPS),
  content: z.string().min(1),
  finalAnswer: z.string().optional(),
  finalEquation: z.string().optional(),
  timeSpent: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      problemId,
      attemptId,
      step,
      content,
      finalAnswer,
      finalEquation,
      timeSpent,
    } = RequestSchema.parse(body);

    // Check authentication
    let parentId: string | null = null;

    const user = await getUser();
    if (user) {
      parentId = user.id;
    } else {
      const cookieStore = await cookies();
      const kidToken = cookieStore.get("kid_token")?.value;
      if (kidToken) {
        const payload = verifyKidToken(kidToken);
        if (payload) {
          parentId = payload.parentId;
        }
      }
    }

    if (!parentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Get session and verify ownership
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, child_id, children!inner(parent_id)")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const childId = session.child_id;

    // Get or create attempt
    let currentAttemptId = attemptId;

    if (!currentAttemptId) {
      // Get problem standard
      const { data: problem } = await supabase
        .from("problems")
        .select("standard_id")
        .eq("id", problemId)
        .single();

      if (!problem) {
        return NextResponse.json(
          { error: "Problem not found" },
          { status: 404 }
        );
      }

      // Create new attempt
      const { data: newAttempt, error: attemptError } = await supabase
        .from("attempts")
        .insert({
          child_id: childId,
          session_id: sessionId,
          problem_id: problemId,
          standard_id: problem.standard_id,
        })
        .select()
        .single();

      if (attemptError || !newAttempt) {
        return NextResponse.json(
          { error: "Failed to create attempt" },
          { status: 500 }
        );
      }

      currentAttemptId = newAttempt.id;
    }

    // Insert step content
    await supabase.from("attempt_steps").insert({
      attempt_id: currentAttemptId,
      step,
      content,
    });

    // If this is the solve step with final answer, update attempt
    if (step === "solve" && finalAnswer) {
      await supabase
        .from("attempts")
        .update({
          final_answer: finalAnswer,
          final_equation: finalEquation || null,
        })
        .eq("id", currentAttemptId);
    }

    // If this is the check step, mark as submitted
    if (step === "check") {
      const updateData: Record<string, unknown> = {
        submitted_at: new Date().toISOString(),
      };

      if (timeSpent) {
        updateData.time_spent_seconds = timeSpent;
      }

      await supabase
        .from("attempts")
        .update(updateData)
        .eq("id", currentAttemptId);
    }

    return NextResponse.json({
      ok: true,
      attemptId: currentAttemptId,
      needsVerification: step === "solve" && !!finalAnswer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    console.error("Submit step error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
