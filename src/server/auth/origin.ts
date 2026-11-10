/**
 * Proteção CSRF das rotas mutantes: o header Origin tem de ser exatamente a origem de APP_URL.
 * Origin ausente também é rejeitado (navegadores modernos sempre o enviam em POST).
 * `appOrigin` já vem normalizado por getEnv() (protocolo + host + porta, sem barra).
 */
export function isAllowedOrigin(originHeader: string | null, appOrigin: string): boolean {
  if (!originHeader || originHeader === "null") return false;
  try {
    return new URL(originHeader).origin === appOrigin;
  } catch {
    return false;
  }
}
