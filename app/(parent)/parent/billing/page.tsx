"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PricingTable } from "@/components/PricingTable";
import { PlanBadge } from "@/components/PlanBadge";
import { formatDate } from "@/lib/utils";
import type { PlanType } from "@/lib/constants";

interface Subscription {
  plan: PlanType;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const loadSubscription = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("subscriptions")
          .select("plan, status, current_period_end, cancel_at_period_end")
          .eq("parent_id", user.id)
          .in("status", ["active", "trialing", "past_due"])
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        setSubscription(data);
      }
      setLoading(false);
    };

    loadSubscription();
  }, []);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setPortalLoading(false);
    }
  };

  const handleUpgrade = async (plan: PlanType) => {
    if (plan === "free") return;

    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          successUrl: `${window.location.origin}/parent/billing?success=1`,
          cancelUrl: window.location.href,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentPlan = subscription?.plan || "free";
  const isPaid = currentPlan !== "free";

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/parent"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </div>
            <PlanBadge plan={currentPlan} className="text-lg px-4 py-1" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription?.current_period_end && (
            <p className="text-sm text-muted-foreground">
              {subscription.cancel_at_period_end
                ? `Your subscription ends on ${formatDate(subscription.current_period_end)}`
                : `Next billing date: ${formatDate(subscription.current_period_end)}`}
            </p>
          )}

          {subscription?.status === "past_due" && (
            <p className="text-sm text-destructive">
              Your payment is past due. Please update your payment method.
            </p>
          )}

          {isPaid && (
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Manage Billing
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {isPaid ? "Change Plan" : "Upgrade Your Plan"}
        </h2>
        <PricingTable
          currentPlan={currentPlan}
          onSelectPlan={handleUpgrade}
          loading={checkoutLoading}
        />
      </div>
    </div>
  );
}
