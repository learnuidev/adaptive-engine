import { EventCallback, PaymentProvider } from "../../adaptive.types.ts";

export const createPaymentDetector = (
  trackPayment: (
    paymentProvider: PaymentProvider,
    sessionId: string,
    callback?: EventCallback
  ) => void
) => ({
  detectStripePayment: (): void => {
    const sessionId = new URL(window.location.href).searchParams.get(
      "session_id"
    );
    if (
      sessionId?.startsWith("cs_") &&
      !sessionStorage.getItem(`adaptive_stripe_payment_sent_${sessionId}`)
    ) {
      trackPayment("stripe", sessionId);
      sessionStorage.setItem(`adaptive_stripe_payment_sent_${sessionId}`, "1");
    }
  },

  detectPolarPayment: (): void => {
    const checkoutId = new URL(window.location.href).searchParams.get(
      "checkout_id"
    );
    if (
      checkoutId &&
      !sessionStorage.getItem(`adaptive_polar_payment_sent_${checkoutId}`)
    ) {
      trackPayment("polar", checkoutId);
      sessionStorage.setItem(`adaptive_polar_payment_sent_${checkoutId}`, "1");
    }
  },

  detectLemonSqueezyPayment: (): void => {
    const orderId = new URL(window.location.href).searchParams.get("order_id");
    if (
      orderId &&
      !sessionStorage.getItem(`adaptive_lemonsqueezy_payment_sent_${orderId}`)
    ) {
      trackPayment("lemonsqueezy", orderId);
      sessionStorage.setItem(
        `adaptive_lemonsqueezy_payment_sent_${orderId}`,
        "1"
      );
    }
  },
});
