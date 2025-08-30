import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-08-16",
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      { price: process.env.STRIPE_PRICE_ID_PRO!, quantity: 1 },
    ],
    allow_promotion_codes: true,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
