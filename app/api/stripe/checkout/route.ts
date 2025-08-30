import Stripe from "stripe";
export const runtime = "nodejs";

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
  }
  if (!process.env.STRIPE_PRICE_ID_PRO) {
    return new Response("Missing STRIPE_PRICE_ID_PRO", { status: 500 });
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    return new Response("Missing NEXT_PUBLIC_APP_URL", { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID_PRO, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?canceled=1`,
  });

  return Response.json({ url: session.url });
}

