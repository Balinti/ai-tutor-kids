import { Badge } from "@/components/ui/badge";
import { PLANS, type PlanType } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  plan: PlanType;
  className?: string;
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const planConfig = PLANS[plan];

  return (
    <Badge
      variant={plan === "free" ? "secondary" : "default"}
      className={cn(
        plan === "pro_plus" && "bg-gradient-to-r from-primary to-purple-600",
        className
      )}
    >
      {planConfig.name}
    </Badge>
  );
}
