"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { PricingTable } from "@/components/PricingTable";
import type { PlanType } from "@/lib/constants";

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (plan: PlanType) => {
    if (plan === "free") {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          successUrl: `${window.location.origin}/parent?success=1`,
          cancelUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        // Not logged in, redirect to login first
        router.push(`/login?redirect=/pricing&plan=${plan}`);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <main className="flex-1">
        <section className="container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free, upgrade when you&apos;re ready. No hidden fees.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-5xl">
            <PricingTable onSelectPlan={handleSelectPlan} loading={loading} />
          </div>

          <div className="mx-auto mt-12 max-w-2xl text-center">
            <p className="text-sm text-muted-foreground">
              All plans include our core features: Socratic AI coaching,
              tool-verified answers, and progress tracking. Pro plans add
              unlimited sessions, weekly email reports, and multiple child
              profiles.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t bg-muted/50 py-20">
          <div className="container">
            <h2 className="text-center text-2xl font-bold">
              Frequently Asked Questions
            </h2>
            <div className="mx-auto mt-12 max-w-2xl space-y-8">
              {[
                {
                  q: "Can I try before I buy?",
                  a: "Yes! The free plan lets you try 3 problems per day with no credit card required. You can upgrade anytime.",
                },
                {
                  q: "What grades do you support?",
                  a: "We support Grades 5-8, covering Common Core math standards for middle school.",
                },
                {
                  q: "How does the AI coaching work?",
                  a: "Our AI coach uses the Socratic method - asking guiding questions to help your child discover the solution, never giving away answers.",
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes, you can cancel your subscription at any time. You'll keep access until the end of your billing period.",
                },
                {
                  q: "Do you support multiple children?",
                  a: "Pro plans support up to 3 children, and Pro+ supports up to 10. Each child gets their own profile and progress tracking.",
                },
              ].map((faq, i) => (
                <div key={i}>
                  <h3 className="font-semibold">{faq.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
