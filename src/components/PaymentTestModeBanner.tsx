const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full bg-red-100 border-b border-red-300 px-4 py-2 text-center text-sm text-red-800">
        Il pagamento in produzione non è ancora configurato. Completa il go-live di Stripe nel pannello Lovable per accettare pagamenti reali.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full bg-orange-100 border-b border-orange-300 px-4 py-2 text-center text-xs text-orange-900">
        Modalità test attiva — usa la carta <strong>4242 4242 4242 4242</strong>, qualsiasi data futura e CVC.
      </div>
    );
  }
  return null;
}