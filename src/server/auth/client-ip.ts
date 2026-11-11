import { isIP } from "node:net";

/**
 * IP do cliente para o rate limit. ÚNICO lugar que interpreta cabeçalhos de proxy.
 *
 * Em produção o app fica atrás do ingress do Azure Container Apps, que preenche `x-forwarded-for`.
 * Regra: o PRIMEIRO IP da lista.
 *
 * Verificado em produção em 11/11/2026: o ingress DESCARTA o `x-forwarded-for` (e o `x-real-ip`) que o cliente
 * manda e escreve o IP real. Logins com `X-Forwarded-For: 203.0.113.77` e com uma lista forjada caíram todos na
 * chave `login:ip:<IP real>`. Se um dia houver outro proxy na frente (CDN, Front Door), refaça esse teste:
 * o primeiro item pode passar a ser controlado pelo cliente.
 *
 * Valor ausente ou inválido vira "unknown": todos esses clientes dividem o mesmo balde (fail-closed).
 */
export function getClientIp(headers: Headers): string {
  const first = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return first && isIP(first) ? first : "unknown";
}
