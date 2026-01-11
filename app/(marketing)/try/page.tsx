"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { GRADES } from "@/lib/constants";

export default function TryPage() {
  const router = useRouter();
  const [grade, setGrade] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleStartTrial = async () => {
    if (!grade) return;

    setLoading(true);
    try {
      const response = await fetch("/api/trial/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: parseInt(grade) }),
      });

      const data = await response.json();
      if (data.ok && data.sessionUrl) {
        router.push(data.sessionUrl);
      }
    } catch (error) {
      console.error("Failed to start trial:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader user={null} />

      <main className="flex-1">
        <section className="container py-20">
          <div className="mx-auto max-w-md">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Try WordProblem Coach</CardTitle>
                <CardDescription>
                  Experience our Socratic tutoring approach. No signup required.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>3-minute free trial</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">Select your child&apos;s grade</Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger id="grade">
                      <SelectValue placeholder="Choose a grade..." />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map((g) => (
                        <SelectItem key={g} value={g.toString()}>
                          Grade {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleStartTrial}
                  disabled={!grade || loading}
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    "Starting..."
                  ) : (
                    <>
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Your progress will be saved if you create an account after.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
