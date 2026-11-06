/**
 * Proteção simples para uso pessoal: o app inteiro exige login com APP_PASSWORD.
 * O cookie guarda um HMAC-SHA256 (chave = senha) de um rótulo com versão, nunca a senha em si.
 * Trocar TOKEN_VERSION invalida todos os cookies já emitidos (todo mundo precisa entrar de novo).
 * Funciona no runtime Edge (middleware) e no Node (rotas), via Web Crypto.
 */
export const AUTH_COOKIE = "cf_auth";
const TOKEN_VERSION = "v2";

export async function authToken(password: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`codeforge-session:${TOKEN_VERSION}`));
  return Array.from(new Uint8Array(mac), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparação em tempo constante para strings de mesmo tamanho. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
