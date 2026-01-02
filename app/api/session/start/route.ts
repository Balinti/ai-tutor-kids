import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyKidToken } from "@/lib/auth/requireKidAccess";
import { buildSession } from "@/lib/session/builder";
import type { PlanType } from "@/lib/constants";

const RequestSchema = z.object({
  childId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { childId } = RequestSchema.parse(body);

    // Check authentication (parent or kid token)
    let parentId: string | null = null;

    const user = await getUser();
    if (user) {
      parentId = user.id;
    } else {
      const cookieStore = await cookies();
      const kidToken = cookieStore.get("kid_token")?.value;
      if (kidToken) {
        const payload = verifyKidToken(kidToken);
        if (payload && payload.childId === childId) {
          parentId = payload.parentId;
        }
      }
    }

    if (!parentId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Verify child belongs to parent and get info
    const { data: child, error: childError } = await supabase
      .from("children")
      .select("id, grade, parent_id")
      .eq("id", childId)
      .eq("parent_id", parentId)
      .single();

    if (childError || !child) {
      return NextResponse.json(
        { error: "Child not found" },
        { status: 404 }
      );
    }

    // Get parent's subscription plan
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("parent_id", parentId)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const plan = (subscription?.plan || "free") as PlanType;

    // Build the session
    const { sessionId, problems } = await buildSession(
      childId,
      child.grade,
      plan
    );

    // Log the event
    await supabase.from("audit_events").insert({
      actor_profile_id: parentId,
      event_type: "session_started",
      payload: { childId, sessionId, plan, problemCount: problems.length },
    });

    return NextResponse.json({
      sessionId,
      problems,
      targetProblemCount: problems.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    console.error("Session start error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
