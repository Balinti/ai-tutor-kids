export const APP_NAME = "WordProblem Coach";

export const GRADES = [5, 6, 7, 8] as const;
export type Grade = (typeof GRADES)[number];

export const PLANS = {
  free: {
    name: "Free",
    maxChildProfiles: 1,
    dailySessions: 1,
    problemsPerSession: 3,
    features: [
      "1 child profile",
      "3 problems per day",
      "Basic progress tracking",
      "Socratic coaching hints",
    ],
    price: 0,
  },
  pro: {
    name: "Pro",
    maxChildProfiles: 3,
    dailySessions: 999,
    problemsPerSession: 8,
    features: [
      "Up to 3 child profiles",
      "Unlimited sessions",
      "8 problems per session",
      "Weekly email reports",
      "Standards breakdown",
      "Priority support",
    ],
    price: 9.99,
  },
  pro_plus: {
    name: "Pro+",
    maxChildProfiles: 10,
    dailySessions: 999,
    problemsPerSession: 15,
    features: [
      "Up to 10 child profiles",
      "Unlimited sessions",
      "15 problems per session",
      "Weekly email reports",
      "Advanced analytics",
      "Custom goals & focus areas",
      "Early access to new features",
    ],
    price: 19.99,
  },
} as const;

export type PlanType = keyof typeof PLANS;

export const STEPS = ["read", "represent", "solve", "check"] as const;
export type Step = (typeof STEPS)[number];

export const STEP_LABELS: Record<Step, string> = {
  read: "Read & Understand",
  represent: "Represent",
  solve: "Solve",
  check: "Check",
};

export const STEP_DESCRIPTIONS: Record<Step, string> = {
  read: "Read the problem carefully and identify key information",
  represent: "Create an equation or diagram to represent the problem",
  solve: "Use your representation to find the answer",
  check: "Verify your answer makes sense",
};

export const ANSWER_TYPES = [
  "number",
  "integer",
  "decimal",
  "fraction",
  "percent",
  "mixed",
  "multi",
] as const;
export type AnswerType = (typeof ANSWER_TYPES)[number];

export const REPRESENTATION_TYPES = [
  "equation",
  "table",
  "diagram",
  "ratio",
  "words",
] as const;
export type RepresentationType = (typeof REPRESENTATION_TYPES)[number];

export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export const SESSION_DEFAULTS = {
  targetProblemCount: {
    free: 3,
    pro: 8,
    pro_plus: 15,
  },
  maxHintsPerProblem: 3,
  sessionTimeoutMinutes: 30,
} as const;

export const DOMAINS: Record<string, string> = {
  RP: "Ratios & Proportional Relationships",
  NS: "The Number System",
  EE: "Expressions & Equations",
  G: "Geometry",
  SP: "Statistics & Probability",
  F: "Functions",
};
