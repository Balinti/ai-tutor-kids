import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser, getProfile } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  stripe,
  createOrGetCustomer,
  createCheckoutSession,
} from "@/lib/stripe/stripe";
import { getPriceId } from "@/lib/stripe/plans";
import type { PlanType } from "@/lib/constants";

const RequestSchema = z.object({
  plan: z.enum(["pro", "pro_plus"]),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { plan, successUrl, cancelUrl } = RequestSchema.parse(body);

    const priceId = getPriceId(plan as PlanType);
    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid plan or price not configured" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const customerId = await createOrGetCustomer(
      profile.email,
      profile.full_name,
      profile.stripe_customer_id
    );

    // Update profile with customer ID if new
    if (customerId !== profile.stripe_customer_id) {
      const supabase = createAdminClient();
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Create checkout session
    const checkoutUrl = await createCheckoutSession(
      customerId,
      priceId,
      successUrl,
      cancelUrl
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
