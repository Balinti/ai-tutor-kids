import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/parent";
  const trialId = searchParams.get("trial");

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // If there's a trial to link, do it now
      if (trialId) {
        await linkTrialToUser(trialId, data.user.id);
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

async function linkTrialToUser(trialId: string, userId: string) {
  try {
    const supabase = createAdminClient();

    // Find the trial child
    const { data: trialChild } = await supabase
      .from("children")
      .select("id, grade")
      .eq("trial_id", trialId)
      .single();

    if (!trialChild) {
      return;
    }

    // Check if user already has this child linked
    const { data: existingChild } = await supabase
      .from("children")
      .select("id")
      .eq("parent_id", userId)
      .eq("trial_id", trialId)
      .single();

    if (existingChild) {
      return;
    }

    // Transfer the child to the new parent
    await supabase
      .from("children")
      .update({
        parent_id: userId,
        name: "My Child",
      })
      .eq("id", trialChild.id);

    // Clear trial markers from sessions
    await supabase
      .from("sessions")
      .update({ trial_id: null })
      .eq("trial_id", trialId);

    // Log the event
    await supabase.from("audit_events").insert({
      actor_profile_id: userId,
      event_type: "trial_linked",
      payload: { trialId, childId: trialChild.id },
    });

    // Clear trial cookies
    const cookieStore = await cookies();
    cookieStore.delete("trial_id");
    cookieStore.delete("trial_child_id");
    cookieStore.delete("trial_session_id");
    cookieStore.delete("trial_start");
  } catch (error) {
    console.error("Failed to link trial:", error);
  }
}
