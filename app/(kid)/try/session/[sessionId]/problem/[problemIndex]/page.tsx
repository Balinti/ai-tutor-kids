"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProblemCard } from "@/components/Kid/ProblemCard";
import { Stepper } from "@/components/Kid/Stepper";
import { TimerPill } from "@/components/Kid/TimerPill";
import { HintPanel } from "@/components/Kid/HintPanel";
import { StepRead } from "@/components/Kid/StepRead";
import { StepRepresent } from "@/components/Kid/StepRepresent";
import { StepSolve } from "@/components/Kid/StepSolve";
import { StepCheck } from "@/components/Kid/StepCheck";
import { SESSION_DEFAULTS, TRIAL_DURATION_MS, type Step } from "@/lib/constants";
import { useTrial } from "@/components/Trial/TrialProvider";

interface Problem {
  id: string;
  prompt: string;
  difficulty: number;
  standard: {
    code: string;
    domain: string;
  };
}

export default function TrialProblemPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const problemIndex = parseInt(params.problemIndex as string);
  const { trialTimeRemaining, isTrialExpired } = useTrial();

  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [totalProblems, setTotalProblems] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("read");
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const [studentWork, setStudentWork] = useState<Partial<Record<Step, string>>>(
    {}
  );
  const [finalAnswer, setFinalAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime] = useState(new Date());
  const [timeSpent, setTimeSpent] = useState(0);

  // Format trial time remaining
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const loadProblem = async () => {
      const supabase = createClient();

      const { data: sessionProblems } = await supabase
        .from("session_problems")
        .select(
          `
          problem_id,
          position,
          problems (
            id,
            prompt,
            difficulty,
            standards (
              code,
              domain
            )
          )
        `
        )
        .eq("session_id", sessionId)
        .order("position");

      if (!sessionProblems || sessionProblems.length === 0) {
        router.replace("/try");
        return;
      }

      setTotalProblems(sessionProblems.length);

      const currentProblem = sessionProblems[problemIndex];
      if (!currentProblem) {
        router.replace(`/try/session/${sessionId}/summary`);
        return;
      }

      const problemData = currentProblem.problems as unknown as {
        id: string;
        prompt: string;
        difficulty: number;
        standards: { code: string; domain: string };
      };

      setProblem({
        id: problemData.id,
        prompt: problemData.prompt,
        difficulty: problemData.difficulty,
        standard: {
          code: problemData.standards.code,
          domain: problemData.standards.domain,
        },
      });

      setLoading(false);
    };

    loadProblem();
  }, [sessionId, problemIndex, router]);

  const submitStep = useCallback(
    async (step: Step, content: string, answer?: string) => {
      const response = await fetch("/api/session/submit-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          problemId: problem?.id,
          attemptId,
          step,
          content,
          finalAnswer: answer,
          timeSpent,
        }),
      });

      const data = await response.json();
      if (data.attemptId) {
        setAttemptId(data.attemptId);
      }
    },
    [sessionId, problem?.id, attemptId, timeSpent]
  );

  const handleStepComplete = async (step: Step, content: string) => {
    setStudentWork((prev) => ({ ...prev, [step]: content }));
    setCompletedSteps((prev) => [...prev, step]);
    await submitStep(step, content);

    const steps: Step[] = ["read", "represent", "solve", "check"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleSolveComplete = async (
    content: string,
    answer: string,
    equation?: string
  ) => {
    setStudentWork((prev) => ({ ...prev, solve: content }));
    setFinalAnswer(answer);
    setCompletedSteps((prev) => [...prev, "solve"]);
    await submitStep("solve", content, answer);
    setCurrentStep("check");
  };

  const handleCheckComplete = async (content: string, isCorrect: boolean) => {
    await submitStep("check", content);

    const supabase = createClient();
    if (attemptId) {
      await supabase
        .from("attempts")
        .update({
          is_correct: isCorrect,
          time_spent_seconds: timeSpent,
        })
        .eq("id", attemptId);
    }

    router.push(`/try/session/${sessionId}/problem/${problemIndex + 1}`);
  };

  if (loading || !problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <TimerPill startTime={startTime} onTimeUpdate={setTimeSpent} />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
              <Clock className="h-4 w-4" />
              Trial: {formatTime(trialTimeRemaining)}
            </div>
            <span className="text-sm text-muted-foreground">
              {problemIndex + 1} / {totalProblems}
            </span>
          </div>
        </div>

        <Stepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={(step) => {
            if (completedSteps.includes(step)) {
              setCurrentStep(step);
            }
          }}
        />

        <ProblemCard
          problem={problem}
          position={problemIndex}
          totalProblems={totalProblems}
        />

        {currentStep === "read" && (
          <StepRead
            onComplete={(content) => handleStepComplete("read", content)}
            initialValue={studentWork.read}
          />
        )}

        {currentStep === "represent" && (
          <StepRepresent
            onComplete={(content) => handleStepComplete("represent", content)}
            initialValue={studentWork.represent}
          />
        )}

        {currentStep === "solve" && (
          <StepSolve
            onComplete={handleSolveComplete}
            initialValue={studentWork.solve}
            initialAnswer={finalAnswer}
          />
        )}

        {currentStep === "check" && (
          <StepCheck
            problemId={problem.id}
            answer={finalAnswer}
            onComplete={handleCheckComplete}
            initialValue={studentWork.check}
          />
        )}

        <HintPanel
          problemId={problem.id}
          attemptId={attemptId || ""}
          currentStep={currentStep}
          studentWork={studentWork}
          hintsUsed={hintsUsed}
          maxHints={SESSION_DEFAULTS.maxHintsPerProblem}
          onHintUsed={() => setHintsUsed((prev) => prev + 1)}
        />
      </div>
    </div>
  );
}
