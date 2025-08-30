import Stripe from "stripe";
export const runtime = "nodejs";

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    return new Response("Missing NEXT_PUBLIC_APP_URL", { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // ⚠️ IMPORTANT:
    // For now, we're faking the customer. You *must* replace "cus_123" with a real
    // Stripe customer ID (cus_xxx) once you store or retrieve it.
    const portal = await stripe.billingPortal.sessions.create({
      customer: "Jack Wild", // <- replace with real Stripe customer id later
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
    });

    return Response.json({ url: portal.url });
  } catch (err: any) {
    console.error("Stripe portal error:", err);
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}

