"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TimerPillProps {
  startTime: Date;
  paused?: boolean;
  onTimeUpdate?: (seconds: number) => void;
  className?: string;
}

export function TimerPill({
  startTime,
  paused = false,
  onTimeUpdate,
  className,
}: TimerPillProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - startTime.getTime()) / 1000
      );
      setSeconds(elapsed);
      onTimeUpdate?.(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, paused, onTimeUpdate]);

  const isWarning = seconds > 300; // 5 minutes
  const isDanger = seconds > 600; // 10 minutes

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
        !isWarning && !isDanger && "bg-muted text-muted-foreground",
        isWarning && !isDanger && "bg-warning/20 text-warning",
        isDanger && "bg-destructive/20 text-destructive",
        className
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      <span>{formatTime(seconds)}</span>
    </div>
  );
}
