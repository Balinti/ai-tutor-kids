"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { TRIAL_DURATION_MS } from "@/lib/constants";
import { TrialExpiredModal } from "./TrialExpiredModal";

interface TrialContextValue {
  isTrialMode: boolean;
  trialId: string | null;
  trialTimeRemaining: number;
  isTrialExpired: boolean;
  grade: number | null;
  startTrial: (grade: number) => void;
}

const TrialContext = createContext<TrialContextValue | null>(null);

const TRIAL_STORAGE_KEY = "wordproblem_trial";

interface TrialData {
  trialId: string;
  startTime: number;
  grade: number;
}

function generateTrialId(): string {
  return `trial_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getTrialData(): TrialData | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(TRIAL_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as TrialData;
  } catch {
    return null;
  }
}

function setTrialData(data: TrialData): void {
  localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(data));
  document.cookie = `trial_id=${data.trialId}; path=/; max-age=86400; SameSite=Lax`;
}

export function TrialProvider({ children }: { children: ReactNode }) {
  const [trialData, setTrialDataState] = useState<TrialData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(TRIAL_DURATION_MS);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const data = getTrialData();
    if (data) {
      setTrialDataState(data);
      const elapsed = Date.now() - data.startTime;
      const remaining = Math.max(0, TRIAL_DURATION_MS - elapsed);
      setTimeRemaining(remaining);
      if (remaining === 0) {
        setIsExpired(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!trialData || isExpired) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - trialData.startTime;
      const remaining = Math.max(0, TRIAL_DURATION_MS - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setIsExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [trialData, isExpired]);

  const startTrial = useCallback((grade: number) => {
    const newTrialData: TrialData = {
      trialId: generateTrialId(),
      startTime: Date.now(),
      grade,
    };
    setTrialData(newTrialData);
    setTrialDataState(newTrialData);
    setTimeRemaining(TRIAL_DURATION_MS);
    setIsExpired(false);
  }, []);

  const value: TrialContextValue = {
    isTrialMode: trialData !== null,
    trialId: trialData?.trialId ?? null,
    trialTimeRemaining: timeRemaining,
    isTrialExpired: isExpired,
    grade: trialData?.grade ?? null,
    startTrial,
  };

  return (
    <TrialContext.Provider value={value}>
      {children}
      {isExpired && <TrialExpiredModal trialId={trialData?.trialId ?? null} />}
    </TrialContext.Provider>
  );
}

export function useTrial(): TrialContextValue {
  const context = useContext(TrialContext);
  if (!context) {
    throw new Error("useTrial must be used within a TrialProvider");
  }
  return context;
}

export function useTrialOptional(): TrialContextValue | null {
  return useContext(TrialContext);
}
