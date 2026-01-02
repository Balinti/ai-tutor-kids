"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SessionStartPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;

  useEffect(() => {
    const startSession = async () => {
      try {
        const response = await fetch("/api/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childId }),
        });

        const data = await response.json();

        if (data.sessionId) {
          router.replace(
            `/kid/${childId}/session/${data.sessionId}/problem/0`
          );
        } else {
          router.replace(`/kid/${childId}`);
        }
      } catch (error) {
        console.error("Failed to start session:", error);
        router.replace(`/kid/${childId}`);
      }
    };

    startSession();
  }, [childId, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg text-muted-foreground">
        Preparing your problems...
      </p>
    </div>
  );
}
