import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanFromPriceId } from "@/lib/stripe/plans";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const customerId = session.customer as string;
          const priceId = subscription.items.data[0]?.price.id;
          const plan = getPlanFromPriceId(priceId || "");

          // Find parent by customer ID
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (profile) {
            // Update or create subscription
            await supabase.from("subscriptions").upsert(
              {
                parent_id: profile.id,
                stripe_subscription_id: subscription.id,
                plan,
                status: subscription.status,
                current_period_end: new Date(
                  subscription.current_period_end * 1000
                ).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
              },
              {
                onConflict: "stripe_subscription_id",
              }
            );

            // Log event
            await supabase.from("audit_events").insert({
              actor_profile_id: profile.id,
              event_type: "subscription_created",
              payload: { plan, subscriptionId: subscription.id },
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId || "");

        await supabase
          .from("subscriptions")
          .update({
            plan,
            status: subscription.status,
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", subscription.id);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Update subscription status to canceled
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
          })
          .eq("stripe_subscription_id", subscription.id);

        // Find parent and create free subscription
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("parent_id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (existingSub) {
          // Create a free plan subscription
          await supabase.from("subscriptions").insert({
            parent_id: existingSub.parent_id,
            plan: "free",
            status: "active",
          });

          // Log event
          await supabase.from("audit_events").insert({
            actor_profile_id: existingSub.parent_id,
            event_type: "subscription_canceled",
            payload: { subscriptionId: subscription.id },
          });
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription as string);
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
