"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { PLANS } from "@/lib/constants";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
  onUpgrade?: () => void;
}

export function PaywallModal({
  open,
  onOpenChange,
  feature = "this feature",
  onUpgrade,
}: PaywallModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "pro",
          successUrl: `${window.location.origin}/parent?success=1`,
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
      setLoading(false);
    }
    onUpgrade?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            Unlock {feature} and more with a Pro subscription.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold">{PLANS.pro.name}</span>
              <span className="text-2xl font-bold">
                ${PLANS.pro.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /mo
                </span>
              </span>
            </div>
            <ul className="space-y-2">
              {PLANS.pro.features.slice(0, 4).map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleUpgrade} disabled={loading}>
            {loading ? "Loading..." : "Upgrade Now"}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
