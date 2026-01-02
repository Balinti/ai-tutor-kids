import OpenAI from "openai";
import type { Step } from "@/lib/constants";
import type { CoachResponse, StudentWork } from "./schemas";
import { SYSTEM_PROMPT, buildCoachPrompt, COACH_RESPONSE_FORMAT } from "./prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Problem {
  prompt: string;
  canonical_answer: string;
  solution_steps: Array<{ step: string; content: string }>;
}

export async function getCoachResponse(
  problem: Problem,
  currentStep: Step,
  studentWork: StudentWork,
  hintLevel: number,
  studentMessage?: string
): Promise<CoachResponse> {
  const userPrompt = buildCoachPrompt(
    problem.prompt,
    problem.canonical_answer,
    problem.solution_steps,
    currentStep,
    studentWork,
    hintLevel,
    studentMessage
  );

  const model = process.env.OPENAI_MODEL_COACH || "gpt-4o-mini";

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: COACH_RESPONSE_FORMAT as OpenAI.ChatCompletionCreateParams["response_format"],
    temperature: 0.7,
    max_tokens: 300,
  });

  const responseText = completion.choices[0]?.message?.content;

  if (!responseText) {
    return {
      type: "hint",
      content: "Let me help you think about this problem. What information do you see in the problem?",
      next_step: currentStep,
    };
  }

  try {
    const parsed = JSON.parse(responseText) as CoachResponse;
    return parsed;
  } catch {
    return {
      type: "hint",
      content: responseText,
      next_step: currentStep,
    };
  }
}

export async function checkStudentUnderstanding(
  problem: Problem,
  studentExplanation: string
): Promise<{ understood: boolean; feedback: string }> {
  const model = process.env.OPENAI_MODEL_EDGE || "gpt-4o";

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `You are evaluating whether a student understands a math word problem.
Respond with JSON: { "understood": boolean, "feedback": "brief encouragement or clarification" }`,
      },
      {
        role: "user",
        content: `Problem: ${problem.prompt}

Student's explanation of what they need to find: "${studentExplanation}"

Does the student correctly understand what the problem is asking? Evaluate their understanding.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 150,
  });

  const responseText = completion.choices[0]?.message?.content;

  if (!responseText) {
    return { understood: true, feedback: "Let's continue with the next step." };
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return { understood: true, feedback: "Let's continue with the next step." };
  }
}
