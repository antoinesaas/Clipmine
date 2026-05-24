/** Redirection Stripe fiable sur mobile (Safari iOS). */
export function redirectToCheckout(url: string) {
  if (typeof window === "undefined") return;
  window.location.assign(url);
}
