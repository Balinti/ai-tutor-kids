import type { PlanType } from "@/lib/constants";

export const STRIPE_PRICE_IDS: Record<Exclude<PlanType, "free">, string> = {
  pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
  pro_plus: process.env.NEXT_PUBLIC_STRIPE_PRO_PLUS_PRICE_ID || "",
};

export function getPriceId(plan: PlanType): string | null {
  if (plan === "free") return null;
  return STRIPE_PRICE_IDS[plan] || null;
}

export function getPlanFromPriceId(priceId: string): PlanType {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
    return "pro";
  }
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PLUS_PRICE_ID) {
    return "pro_plus";
  }
  return "free";
}
