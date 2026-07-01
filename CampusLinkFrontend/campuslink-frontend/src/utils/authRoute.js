/** Apply dark auth background before route paint to avoid white flash */
export function primeAuthRouteBackground() {
  document.documentElement.classList.add('auth-route-active');
  document.body.classList.add('auth-route-active');
}
