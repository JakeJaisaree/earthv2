import Stripe from "stripe";
import { cookies } from "next/headers";
export const runtime = "nodejs";

export async function POST() {
  const customerId = cookies().get("cus_Sxbk87a6sbCQyT")?.value;
  if (!customerId) return new Response("No customer", { status: 401 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
  });

  return Response.json({ url: portal.url });
}

