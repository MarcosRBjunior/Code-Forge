/**
 * Proteção simples para uso pessoal: se APP_PASSWORD estiver definida, o app inteiro
 * exige login. O cookie guarda um SHA-256 da senha (nunca a senha em si).
 * Funciona no runtime Edge (middleware) e no Node (rotas), via Web Crypto.
 */
export const AUTH_COOKIE = "cf_auth";

export async function authToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`codeforge:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparação em tempo constante para strings de mesmo tamanho. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
