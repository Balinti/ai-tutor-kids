import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-09-30.acacia",
  typescript: true,
});

export async function createOrGetCustomer(
  email: string,
  name: string | null,
  stripeCustomerId: string | null
): Promise<string> {
  if (stripeCustomerId) {
    // Verify the customer still exists
    try {
      await stripe.customers.retrieve(stripeCustomerId);
      return stripeCustomerId;
    } catch {
      // Customer was deleted, create a new one
    }
  }

  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
  });

  return customer.id;
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });

  return session.url!;
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

export async function getSubscriptionDetails(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId);
}
