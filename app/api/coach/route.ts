import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCoachResponse } from "@/lib/ai/coach";
import { STEPS } from "@/lib/constants";

const RequestSchema = z.object({
  problemId: z.string().uuid(),
  attemptId: z.string().uuid(),
  currentStep: z.enum(STEPS),
  studentWork: z.object({
    read: z.string().optional(),
    represent: z.string().optional(),
    solve: z.string().optional(),
    check: z.string().optional(),
  }),
  hintLevel: z.number().min(0).max(3).default(1),
  studentMessage: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      problemId,
      attemptId,
      currentStep,
      studentWork,
      hintLevel,
      studentMessage,
    } = RequestSchema.parse(body);

    const supabase = createAdminClient();

    // Get problem details
    const { data: problem, error } = await supabase
      .from("problems")
      .select("prompt, canonical_answer, solution_steps")
      .eq("id", problemId)
      .single();

    if (error || !problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    // Get coach response
    const response = await getCoachResponse(
      {
        prompt: problem.prompt,
        canonical_answer: problem.canonical_answer,
        solution_steps: problem.solution_steps as Array<{
          step: string;
          content: string;
        }>,
      },
      currentStep,
      studentWork,
      hintLevel,
      studentMessage
    );

    // If it was a hint request (not just a message), increment hints used
    if (response.type === "hint" && !studentMessage) {
      await supabase
        .from("attempts")
        .update({ hints_used: hintLevel })
        .eq("id", attemptId);
    }

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    console.error("Coach error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
