import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createAgentCheckout } from "@/lib/payments.functions";
import { useServerFn } from "@tanstack/react-start";

export function StripeAgentCheckout({ idea, returnUrl }: { idea: string; returnUrl: string }) {
  const create = useServerFn(createAgentCheckout);

  const fetchClientSecret = async (): Promise<string> => {
    const result = await create({
      data: { idea, returnUrl, environment: getStripeEnvironment() },
    });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("No client secret returned");
    return result.clientSecret;
  };

  return (
    <div id="checkout" className="rounded-2xl overflow-hidden bg-white">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}