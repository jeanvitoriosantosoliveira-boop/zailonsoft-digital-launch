// Edge Function: stripe-webhook
// Atualiza subscriptions.status a partir dos eventos do Stripe.

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function upsertFromSubscription(s: Stripe.Subscription) {
  const customerId = typeof s.customer === "string" ? s.customer : s.customer.id;
  // Encontra user_id pelo customer
  const { data: existing } = await admin
    .from("subscriptions")
    .select("id, user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  let userId = existing?.user_id;
  if (!userId) {
    // tenta pegar pelo metadata
    const cust = await stripe.customers.retrieve(customerId);
    // @ts-ignore
    userId = cust?.metadata?.user_id;
  }
  if (!userId) {
    console.warn("Sem user_id para customer", customerId);
    return;
  }

  const status = s.status; // active, past_due, canceled, unpaid, incomplete, trialing
  const nextBilling = s.current_period_end ? new Date(s.current_period_end * 1000).toISOString() : null;

  const payload = {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: s.id,
    status,
    next_billing_date: nextBilling,
  };

  if (existing?.id) {
    await admin.from("subscriptions").update(payload).eq("id", existing.id);
  } else {
    const { data: byUser } = await admin
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (byUser?.id) {
      await admin.from("subscriptions").update(payload).eq("id", byUser.id);
    } else {
      await admin.from("subscriptions").insert(payload);
    }
  }
}

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature failure", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertFromSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await upsertFromSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await upsertFromSubscription(sub);
        }
        break;
      }
    }
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (e: any) {
    console.error("Handler error", e);
    return new Response(`Handler error: ${e.message}`, { status: 500 });
  }
});
