"use client";

import { useState } from "react";
import { Lightbulb, Loader2, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Step } from "@/lib/constants";

interface Message {
  role: "coach" | "student";
  content: string;
  type?: "hint" | "encouragement" | "correction" | "refuse" | "complete";
}

interface HintPanelProps {
  problemId: string;
  attemptId: string;
  currentStep: Step;
  studentWork: Partial<Record<Step, string>>;
  hintsUsed: number;
  maxHints: number;
  onHintUsed: () => void;
}

export function HintPanel({
  problemId,
  attemptId,
  currentStep,
  studentWork,
  hintsUsed,
  maxHints,
  onHintUsed,
}: HintPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const canRequestHint = hintsUsed < maxHints;

  const requestHelp = async (studentMessage?: string) => {
    if (!canRequestHint && !studentMessage) return;

    setLoading(true);
    if (studentMessage) {
      setMessages((prev) => [
        ...prev,
        { role: "student", content: studentMessage },
      ]);
    }

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          attemptId,
          currentStep,
          studentWork,
          hintLevel: hintsUsed + 1,
          studentMessage,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "coach",
          content: data.content,
          type: data.type,
        },
      ]);

      if (data.type === "hint" && !studentMessage) {
        onHintUsed();
      }
    } catch (error) {
      console.error("Failed to get hint:", error);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    requestHelp(input.trim());
  };

  return (
    <Card className={cn("transition-all", expanded && "shadow-lg")}>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Need Help?</CardTitle>
          </div>
          <CardDescription>
            {maxHints - hintsUsed} hints remaining
          </CardDescription>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Click &quot;Get a Hint&quot; or ask a question to get help from your coach!
            </p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2",
                    message.role === "student" && "justify-end"
                  )}
                >
                  {message.role === "coach" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm max-w-[80%]",
                      message.role === "coach"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => requestHelp()}
              disabled={!canRequestHint || loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Get a Hint
                </>
              )}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
