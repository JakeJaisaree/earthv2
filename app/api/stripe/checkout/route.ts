// app/api/stripe/checkout/route.ts
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // prevent build-time prerendering

export async function POST(req: Request) {
  try {
    const {
      priceId = process.env.STRIPE_PRICE_ID_PRO, // must be a price_...
      // optional passthrough fields:
      customerId, // if you already have a Stripe customer id
      successPath = "/pro/success",
      cancelPath = "/pro/cancel",
    } = await req.json().catch(() => ({}));

    if (!process.env.STRIPE_SECRET_KEY) {
      return new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
    }
    if (!priceId || !priceId.startsWith("price_")) {
      return new Response("Invalid or missing priceId (needs a price_… ID)", { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      // Let Stripe choose compatible methods automatically
      automatic_payment_methods: { enabled: true },
      allow_promotion_codes: true,
      customer: customerId, // optional
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${url}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url}${cancelPath}`,
    });

    return Response.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return new Response(err?.message ?? "Checkout failed", { status: 500 });
  }
}

