import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PRICE_ID = "price_1Srdi4Rbk31AIXyOR3IBtz0X";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // OPTIONS (Preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

<<<<<<< HEAD
    if (!stripeKey) return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY não configurada" }), { status: 500, headers: corsHeaders });
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Variáveis Supabase não configuradas" }), { status: 500, headers: corsHeaders });
=======
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
    const { data: subs } = await admin
      .from("subscriptions")
      .select("id, stripe_customer_id")
      .eq("user_id", userId)
      .limit(1);

    const sub = subs?.[0];
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
          .eq("id", sub.id);
      } else {
        await admin.from("subscriptions").insert({
          user_id: userId,
          stripe_customer_id: customerId,
          status: "pending_payment",
        });
      }
>>>>>>> 1ac92c5f0a80a935515b537c67ed24e9ba387e6e
    }

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2024-06-20" 
    });

    // === Customer ===
    const { data: subscription } = await adminClient
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });

      customerId = customer.id;

      await adminClient.from("subscriptions").upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        status: "pending_payment",
      }, { onConflict: "user_id" });
    }

    // === Checkout Session ===
    const origin = req.headers.get("origin") || "https://jvs.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${origin}/assinar?success=true`,
      cancel_url: `${origin}/assinar?canceled=true`,
      allow_promotion_codes: true,
      metadata: { user_id: user.id },
    });

<<<<<<< HEAD
    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("create-checkout error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro interno no servidor",
        details: error.stack?.split("\n")[0] // ajuda no debug
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
=======
    return json({ url: session.url });
  } catch (e: unknown) {
    console.error("create-checkout error", e);
    return json({ error: e instanceof Error ? e.message : "Erro interno" }, 500);
>>>>>>> 1ac92c5f0a80a935515b537c67ed24e9ba387e6e
  }
});