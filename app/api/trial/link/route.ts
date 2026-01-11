import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const RequestSchema = z.object({
  trialId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trialId } = RequestSchema.parse(body);

    // Require authenticated user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Find the trial child
    const { data: trialChild, error: childError } = await supabase
      .from("children")
      .select("id, name, grade")
      .eq("trial_id", trialId)
      .single();

    if (childError || !trialChild) {
      return NextResponse.json(
        { error: "Trial not found" },
        { status: 404 }
      );
    }

    // Check if user already has a child with this trial linked
    const { data: existingChild } = await supabase
      .from("children")
      .select("id")
      .eq("parent_id", user.id)
      .eq("trial_id", trialId)
      .single();

    if (existingChild) {
      // Already linked
      return NextResponse.json({ ok: true, childId: existingChild.id });
    }

    // Transfer the child to the new parent
    const { data: updatedChild, error: updateError } = await supabase
      .from("children")
      .update({
        parent_id: user.id,
        name: "My Child", // Reset to generic name, parent can customize
      })
      .eq("id", trialChild.id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to link trial child:", updateError);
      return NextResponse.json(
        { error: "Failed to link trial progress" },
        { status: 500 }
      );
    }

    // Update sessions to reflect new parent ownership
    await supabase
      .from("sessions")
      .update({ trial_id: null })
      .eq("trial_id", trialId);

    // Clear trial cookies
    const cookieStore = await cookies();
    cookieStore.delete("trial_id");
    cookieStore.delete("trial_child_id");
    cookieStore.delete("trial_session_id");
    cookieStore.delete("trial_start");

    // Log the event
    await supabase.from("audit_events").insert({
      actor_profile_id: user.id,
      event_type: "trial_linked",
      payload: { trialId, childId: updatedChild.id },
    });

    return NextResponse.json({
      ok: true,
      childId: updatedChild.id,
      message: "Trial progress linked to your account",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    console.error("Trial link error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
