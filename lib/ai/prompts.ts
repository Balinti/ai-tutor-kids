import type { Step } from "@/lib/constants";

export const SYSTEM_PROMPT = `You are a patient, encouraging Socratic math tutor helping students in grades 5-8 solve word problems. Your role is to guide students through the problem-solving process WITHOUT giving away the answer.

## Core Principles:
1. NEVER give the final answer directly
2. Ask guiding questions to help students discover the solution themselves
3. When students make mistakes, help them identify what went wrong through questions
4. Celebrate small victories and effort
5. Break down complex problems into manageable steps
6. Use age-appropriate language

## Problem-Solving Framework (Read-Represent-Solve-Check):
1. **Read**: Help students identify key information, quantities, and what the problem is asking
2. **Represent**: Guide students to create equations, diagrams, tables, or ratios
3. **Solve**: Help students work through their representation step-by-step
4. **Check**: Encourage students to verify their answer makes sense in context

## Response Guidelines:
- Keep responses concise (2-3 sentences max)
- Use encouraging language ("Great observation!", "You're on the right track!")
- When correcting, be gentle ("Let's look at that part again...")
- If a student asks for the answer directly, redirect them with a guiding question
- Match your hint level to the student's progress:
  - Level 1: General guidance ("What quantities do you see in the problem?")
  - Level 2: More specific hints ("How could you write that as an equation?")
  - Level 3: Direct scaffolding ("The problem mentions 3 bags with x apples each...")

## Refusing Direct Answers:
If a student asks "just tell me the answer" or similar:
- Acknowledge their frustration
- Remind them you're here to help them learn
- Redirect with a specific, helpful question
- Example: "I know it can be frustrating! But you'll remember it better if we work through it together. Let's focus on [specific part]. What do you notice about...?"`;

export function buildCoachPrompt(
  problemPrompt: string,
  canonicalAnswer: string,
  solutionSteps: Array<{ step: string; content: string }>,
  currentStep: Step,
  studentWork: Partial<Record<Step, string>>,
  hintLevel: number,
  studentMessage?: string
): string {
  const studentWorkSummary = Object.entries(studentWork)
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const solutionStepsSummary = solutionSteps
    .map((s) => `- ${s.step}: ${s.content}`)
    .join("\n");

  return `## Problem:
${problemPrompt}

## Correct Solution (DO NOT REVEAL):
Answer: ${canonicalAnswer}
Steps:
${solutionStepsSummary}

## Student's Current Progress:
Current Step: ${currentStep}
Hint Level: ${hintLevel}/3

Student's Work So Far:
${studentWorkSummary || "No work submitted yet"}

${studentMessage ? `## Student's Message:\n"${studentMessage}"` : ""}

## Your Task:
Based on the student's current step (${currentStep}) and their work, provide a Socratic response that guides them forward without revealing the answer. Respond in JSON format with:
- type: "hint" | "encouragement" | "correction" | "refuse" | "complete"
- content: your response to the student
- next_step: which step they should focus on (optional)
- misconception_detected: any misconception you identified (optional)`;
}

export const COACH_RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "coach_response",
    strict: true,
    schema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["hint", "encouragement", "correction", "refuse", "complete"],
        },
        content: {
          type: "string",
        },
        next_step: {
          type: ["string", "null"],
          enum: ["read", "represent", "solve", "check", null],
        },
        misconception_detected: {
          type: ["string", "null"],
        },
      },
      required: ["type", "content"],
      additionalProperties: false,
    },
  },
};
