import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

let _supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  return _supabase;
}

async function handleCheckoutCompleted(session: any) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("checkout.session.completed without userId metadata", session.id);
    return;
  }
  const supabase = getSupabase();
  await supabase
    .from("agent_access")
    .upsert(
      {
        user_id: userId,
        email: session.customer_details?.email ?? session.customer_email ?? null,
        idea: session.metadata?.idea ?? null,
        amount_cents: session.amount_total ?? 2900,
        currency: (session.currency ?? "eur").toLowerCase(),
        payment_status: "paid",
        stripe_session_id: session.id,
        accesso_agente_ai: true,
        paid_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
}

async function handlePaymentFailed(session: any) {
  const userId = session.metadata?.userId;
  if (!userId) return;
  await getSupabase()
    .from("agent_access")
    .update({ payment_status: "failed" })
    .eq("user_id", userId);
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await handleCheckoutCompleted(event.data.object);
      break;
    case "checkout.session.async_payment_failed":
      await handlePaymentFailed(event.data.object);
      break;
    default:
      console.log("Unhandled event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});