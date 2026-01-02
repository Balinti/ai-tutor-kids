"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS, type PlanType } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PricingTableProps {
  currentPlan?: PlanType;
  onSelectPlan?: (plan: PlanType) => void;
  loading?: boolean;
}

export function PricingTable({
  currentPlan,
  onSelectPlan,
  loading,
}: PricingTableProps) {
  const plans = Object.entries(PLANS) as [PlanType, (typeof PLANS)[PlanType]][];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map(([planKey, plan]) => {
        const isCurrentPlan = currentPlan === planKey;
        const isPopular = planKey === "pro";

        return (
          <Card
            key={planKey}
            className={cn(
              "relative flex flex-col",
              isPopular && "border-primary shadow-lg"
            )}
          >
            {isPopular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}

            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {isCurrentPlan && (
                  <Badge variant="secondary">Current Plan</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {planKey === "free" && "Get started for free"}
                {planKey === "pro" && "Best for most families"}
                {planKey === "pro_plus" && "For multiple children"}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ${plan.price.toFixed(2)}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={isPopular ? "default" : "outline"}
                disabled={isCurrentPlan || loading}
                onClick={() => onSelectPlan?.(planKey)}
              >
                {isCurrentPlan
                  ? "Current Plan"
                  : planKey === "free"
                    ? "Get Started"
                    : "Upgrade"}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
