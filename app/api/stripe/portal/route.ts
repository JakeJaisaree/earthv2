import Stripe from "stripe";
export const runtime = "nodejs";

export async function POST() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const portal = await stripe.billingPortal.sessions.create({
    customer: "Jack Wild", 
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
  });

  return Response.json({ url: portal.url });
}


