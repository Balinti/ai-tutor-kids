"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SessionStartCard } from "@/components/Kid/SessionStartCard";
import type { PlanType } from "@/lib/constants";

interface ChildData {
  id: string;
  name: string;
  grade: number;
  parent_id: string;
}

export default function KidHomePage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;

  const [child, setChild] = useState<ChildData | null>(null);
  const [plan, setPlan] = useState<PlanType>("free");
  const [streak, setStreak] = useState(0);
  const [todaySessions, setTodaySessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [needsPin, setNeedsPin] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const supabase = createClient();

      // Check if parent is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Parent is logged in, verify child belongs to them
        const { data: childData } = await supabase
          .from("children")
          .select("*")
          .eq("id", childId)
          .eq("parent_id", user.id)
          .single();

        if (childData) {
          setChild(childData);
          await loadChildStats(childData.parent_id);
          setLoading(false);
          return;
        }
      }

      // Check for kid token cookie
      const response = await fetch(`/api/auth/kid-pin/verify?childId=${childId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          const { data: childData } = await supabase
            .from("children")
            .select("*")
            .eq("id", childId)
            .single();

          if (childData) {
            setChild(childData);
            await loadChildStats(childData.parent_id);
            setLoading(false);
            return;
          }
        }
      }

      // Need PIN
      const { data: childData } = await supabase
        .from("children")
        .select("id, name, grade, parent_id")
        .eq("id", childId)
        .single();

      if (childData) {
        setChild(childData);
        setNeedsPin(true);
      }
      setLoading(false);
    };

    const loadChildStats = async (parentId: string) => {
      const supabase = createClient();

      // Get subscription
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan")
        .eq("parent_id", parentId)
        .in("status", ["active", "trialing"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setPlan((subscription?.plan as PlanType) || "free");

      // Get today's sessions
      const today = new Date().toISOString().split("T")[0];
      const { count } = await supabase
        .from("sessions")
        .select("id", { count: "exact" })
        .eq("child_id", childId)
        .gte("started_at", today)
        .not("ended_at", "is", null);

      setTodaySessions(count || 0);

      // Get streak (simplified)
      setStreak(1); // TODO: Calculate actual streak
    };

    checkAccess();
  }, [childId]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinLoading(true);
    setPinError("");

    try {
      const response = await fetch("/api/auth/kid-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, pin }),
      });

      const data = await response.json();

      if (data.ok) {
        setNeedsPin(false);
        if (child) {
          const supabase = createClient();
          const { data: childData } = await supabase
            .from("children")
            .select("parent_id")
            .eq("id", childId)
            .single();

          if (childData) {
            const { data: subscription } = await supabase
              .from("subscriptions")
              .select("plan")
              .eq("parent_id", childData.parent_id)
              .in("status", ["active", "trialing"])
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            setPlan((subscription?.plan as PlanType) || "free");
          }
        }
      } else {
        setPinError(data.error || "Invalid PIN");
      }
    } catch {
      setPinError("Something went wrong. Please try again.");
    } finally {
      setPinLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold">Profile Not Found</h2>
            <p className="mt-2 text-muted-foreground">
              This profile doesn&apos;t exist or you don&apos;t have access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (needsPin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Hi, {child.name}!</CardTitle>
            <CardDescription>Enter your PIN to start practicing</CardDescription>
          </CardHeader>
          <form onSubmit={handlePinSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">Your PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  placeholder="****"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
              </div>
              {pinError && (
                <p className="text-sm text-destructive text-center">{pinError}</p>
              )}
              <Button type="submit" className="w-full" disabled={pinLoading}>
                {pinLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Start"
                )}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background p-4 pt-12">
      <SessionStartCard
        childId={child.id}
        childName={child.name}
        plan={plan}
        streak={streak}
        todaySessions={todaySessions}
      />
    </div>
  );
}
