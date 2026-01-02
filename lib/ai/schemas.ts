import { z } from "zod";

export const CoachResponseSchema = z.object({
  type: z.enum(["hint", "encouragement", "correction", "refuse", "complete"]),
  content: z.string().describe("The coach's response to the student"),
  next_step: z
    .enum(["read", "represent", "solve", "check"])
    .optional()
    .describe("The step the student should focus on next"),
  misconception_detected: z
    .string()
    .optional()
    .describe("Any misconception identified in the student's work"),
});

export type CoachResponse = z.infer<typeof CoachResponseSchema>;

export const StudentWorkSchema = z.object({
  read: z.string().optional(),
  represent: z.string().optional(),
  solve: z.string().optional(),
  check: z.string().optional(),
});

export type StudentWork = z.infer<typeof StudentWorkSchema>;

export const CoachRequestSchema = z.object({
  problemId: z.string().uuid(),
  attemptId: z.string().uuid(),
  currentStep: z.enum(["read", "represent", "solve", "check"]),
  studentWork: StudentWorkSchema,
  hintLevel: z.number().min(0).max(3).default(1),
  studentMessage: z.string().optional(),
});

export type CoachRequest = z.infer<typeof CoachRequestSchema>;

export const VerifyRequestSchema = z.object({
  problemId: z.string().uuid(),
  finalAnswer: z.string(),
  finalEquation: z.string().optional(),
});

export type VerifyRequest = z.infer<typeof VerifyRequestSchema>;

export const VerifyResponseSchema = z.object({
  isCorrect: z.boolean(),
  details: z.object({
    method: z.string(),
    canonicalAnswer: z.string(),
    parsedStudentAnswer: z.union([z.number(), z.string(), z.null()]),
    message: z.string().optional(),
  }),
});

export type VerifyResponse = z.infer<typeof VerifyResponseSchema>;
