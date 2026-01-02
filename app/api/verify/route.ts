import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAnswer, verifyEquation } from "@/lib/verify/mathVerify";
import type { AnswerType } from "@/lib/constants";

const RequestSchema = z.object({
  problemId: z.string().uuid(),
  finalAnswer: z.string().min(1),
  finalEquation: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problemId, finalAnswer, finalEquation } = RequestSchema.parse(body);

    const supabase = createAdminClient();

    // Get problem details
    const { data: problem, error } = await supabase
      .from("problems")
      .select("canonical_answer, canonical_equation, answer_type")
      .eq("id", problemId)
      .single();

    if (error || !problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    // Verify the answer
    const result = verifyAnswer(
      finalAnswer,
      problem.canonical_answer,
      problem.answer_type as AnswerType
    );

    // Optionally verify equation if provided
    let equationCorrect = true;
    if (finalEquation && problem.canonical_equation) {
      equationCorrect = verifyEquation(
        finalEquation,
        problem.canonical_equation
      );
    }

    return NextResponse.json({
      isCorrect: result.isCorrect,
      details: {
        ...result.details,
        equationCorrect,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
