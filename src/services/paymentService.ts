import Stripe from "stripe";
import { env } from "../config/env";

// Lazily constructed so the app can still boot (and other resolvers work)
// even before STRIPE_SECRET_KEY is set in .env during early development.
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    if (!env.STRIPE_SECRET_KEY) {
      console.warn("[payments] STRIPE_SECRET_KEY not set — Stripe calls will fail until it is.");
    }
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2026-06-24.dahlia" });
  }
  return stripeClient;
}

export interface InitializePaymentInput {
  email: string;
  amount: number; // in the wallet's major currency unit, e.g. USD or NGN
  currency?: string; // ISO currency code, lowercase, e.g. "usd", "ngn"
  reference: string; // our internal Transaction.reference, stored as metadata
}

export interface InitializePaymentResult {
  authorizationUrl: string; // Stripe Checkout URL to redirect the customer to
  reference: string;
  providerSessionId: string; // Stripe Checkout Session ID — store this on the Transaction
}

// Creates a Stripe Checkout Session for a wallet deposit. Stripe Checkout
// is used instead of raw PaymentIntents because it handles 3DS, card
// wallets (Apple/Google Pay), and receipt emails without extra work.
export async function initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult> {
  const stripe = getStripe();
  const currency = (input.currency ?? "usd").toLowerCase();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email,
    client_reference_id: input.reference,
    metadata: { reference: input.reference },
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: Math.round(input.amount * 100), // Stripe expects the smallest currency unit
          product_data: { name: "Wallet top-up" },
        },
        quantity: 1,
      },
    ],
    success_url: `${env.CLIENT_URL}/wallet?deposit=success&reference=${input.reference}`,
    cancel_url: `${env.CLIENT_URL}/wallet?deposit=cancelled&reference=${input.reference}`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  return { authorizationUrl: session.url, reference: input.reference, providerSessionId: session.id };
}

export interface VerifyPaymentResult {
  success: boolean;
  amount: number;
  currency: string;
  reference: string;
}

// Polling-based verification, used as a fallback right after checkout
// redirect. The webhook handler below is the source of truth in
// production since customers can close the tab before returning.
export async function verifyPayment(providerSessionId: string): Promise<VerifyPaymentResult> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(providerSessionId);

  return {
    success: session.payment_status === "paid",
    amount: (session.amount_total ?? 0) / 100,
    currency: session.currency ?? "usd",
    reference: session.client_reference_id ?? session.metadata?.reference ?? "",
  };
}

// Verifies the raw request body against Stripe's signature header. Must
// be called with the UNPARSED request body (see server.ts, which mounts
// express.raw() only on the /webhooks/stripe route for this reason).
export function constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
}