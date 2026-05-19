// Edge Function: create-checkout
// Cria uma Stripe Checkout Session em modo subscription para o plano JVS R$ 99/mês.

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PRICE_ID = "price_1Srdi4Rbk31AIXyOR3IBtz0X";

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "STRIPE_SECRET_KEY não configurado" }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabaseAuth.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claimsData.claims.sub as string;
    const email = (claimsData.claims.email as string) || undefined;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

    // Recupera ou cria customer
    const { data: sub } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    let customerId = sub?.stripe_customer_id || null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { user_id: userId },
      });
      customerId = customer.id;
      if (sub) {
        await admin
          .from("subscriptions")
          .update({ stripe_customer_id: customerId, status: "pending_payment" })
          .eq("user_id", userId);
      } else {
        await admin.from("subscriptions").insert({
          user_id: userId,
          stripe_customer_id: customerId,
          status: "pending_payment",
        });
      }
    }

    const origin = req.headers.get("origin") || "https://jvs.app";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${origin}/assinar?success=true`,
      cancel_url: `${origin}/assinar?canceled=true`,
      allow_promotion_codes: true,
      metadata: { user_id: userId },
    });

    return json({ url: session.url });
  } catch (e: any) {
    console.error("create-checkout error", e);
    return json({ error: e.message || "Erro interno" }, 500);
  }
});
