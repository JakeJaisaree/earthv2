// app/api/stripe/checkout/route.ts
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // avoid prerendering

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const priceId: string =
      typeof body.priceId === "string" ? body.priceId : process.env.STRIPE_PRICE_ID_PRO!;
    const customerId: string | undefined =
      typeof body.customerId === "string" ? body.customerId : undefined;

    if (!process.env.STRIPE_SECRET_KEY) {
      return new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
    }
    if (!priceId || !priceId.startsWith("price_")) {
      return new Response("Invalid or missing priceId (needs a price_… ID)", { status: 400 });
    }

    // You can omit apiVersion to use your account's default, or pin a stable one:
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });

    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const successPath = typeof body.successPath === "string" ? body.successPath : "/pro/success";
    const cancelPath = typeof body.cancelPath === "string" ? body.cancelPath : "/pro/cancel";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      // Either explicitly list methods…
      payment_method_types: ["card"],
      // …or remove the line above to let Stripe choose from your Dashboard config.
      allow_promotion_codes: true,
      customer: customerId, // optional
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${cancelPath}`,
    });

    return Response.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return new Response(err?.message ?? "Checkout failed", { status: 500 });
  }
}

