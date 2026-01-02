import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser, getProfile } from "@/lib/supabase/server";
import { createBillingPortalSession } from "@/lib/stripe/stripe";

const RequestSchema = z.object({
  returnUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfile();
    if (!profile || !profile.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { returnUrl } = RequestSchema.parse(body);

    const portalUrl = await createBillingPortalSession(
      profile.stripe_customer_id,
      returnUrl
    );

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
