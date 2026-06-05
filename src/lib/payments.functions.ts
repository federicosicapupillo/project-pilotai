import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type StripeEnv = "sandbox" | "live";

type CheckoutResult = { clientSecret: string } | { error: string };

export const createAgentCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { returnUrl: string; environment: StripeEnv; idea?: string; projectId?: string }) => {
    if (data.environment !== "sandbox" && data.environment !== "live") {
      throw new Error("Invalid environment");
    }
    if (!data.returnUrl || !/^https?:\/\//.test(data.returnUrl)) {
      throw new Error("Invalid returnUrl");
    }
    const projectId =
      typeof data.projectId === "string" &&
      /^[0-9a-fA-F-]{36}$/.test(data.projectId)
        ? data.projectId
        : undefined;
    return {
      returnUrl: data.returnUrl,
      environment: data.environment,
      idea: typeof data.idea === "string" ? data.idea.slice(0, 2000) : "",
      projectId,
    };
  })
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    const { createStripeClient, getStripeErrorMessage } = await import("@/lib/stripe.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const userId = context.userId;
    const email = (context.claims as { email?: string } | undefined)?.email;

    try {
      const stripe = createStripeClient(data.environment);

      const prices = await stripe.prices.list({ lookup_keys: ["agente_ai_29"] });
      if (!prices.data.length) return { error: "Price 'agente_ai_29' not found" };
      const stripePrice = prices.data[0];

      // Resolve or create Customer with userId metadata
      let customerId: string | undefined;
      if (/^[a-zA-Z0-9_-]+$/.test(userId)) {
        const found = await stripe.customers.search({
          query: `metadata['userId']:'${userId}'`,
          limit: 1,
        });
        if (found.data.length) customerId = found.data[0].id;
      }
      if (!customerId && email) {
        const existing = await stripe.customers.list({ email, limit: 1 });
        if (existing.data.length) {
          const c = existing.data[0];
          if (c.metadata?.userId !== userId) {
            await stripe.customers.update(c.id, { metadata: { ...c.metadata, userId } });
          }
          customerId = c.id;
        }
      }
      if (!customerId) {
        const created = await stripe.customers.create({
          ...(email && { email }),
          metadata: { userId },
        });
        customerId = created.id;
      }

      const productId = typeof stripePrice.product === "string"
        ? stripePrice.product
        : stripePrice.product.id;
      const product = await stripe.products.retrieve(productId);

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        payment_intent_data: { description: product.name },
        metadata: {
          userId,
          idea: data.idea.slice(0, 500),
          product: "team_ai",
          ...(email ? { email } : {}),
          ...(data.projectId ? { project_id: data.projectId } : {}),
        },
      });

      // Pre-record pending row so we have idea+session linked even before webhook
      await supabaseAdmin
        .from("agent_access")
        .upsert(
          {
            user_id: userId,
            email: email ?? null,
            idea: data.idea || null,
            project_id: data.projectId ?? null,
            amount_cents: 2900,
            currency: "eur",
            payment_status: "pending",
            stripe_session_id: session.id,
            accesso_agente_ai: false,
          },
          { onConflict: "user_id" },
        );

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      console.error("createAgentCheckout error:", error);
      return { error: getStripeErrorMessage(error) };
    }
  });

export const getAgentAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data } = await supabase
      .from("agent_access")
      .select("accesso_agente_ai, payment_status, idea, paid_at, project_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    return {
      hasAccess: !!data?.accesso_agente_ai,
      status: data?.payment_status ?? null,
      idea: data?.idea ?? null,
      paidAt: data?.paid_at ?? null,
      projectId: data?.project_id ?? null,
    };
  });