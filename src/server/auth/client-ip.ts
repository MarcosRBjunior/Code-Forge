import { isIP } from "node:net";

/**
 * IP do cliente para o rate limit. ÚNICO lugar que interpreta cabeçalhos de proxy.
 *
 * Em produção o app fica atrás do ingress do Azure Container Apps, que preenche `x-forwarded-for`.
 * Regra atual: o PRIMEIRO IP da lista.
 *
 * ATENÇÃO: se o ingress ACRESCENTA ao `x-forwarded-for` que o cliente mandou (comportamento padrão do Envoy),
 * o primeiro item é controlado pelo cliente e o limite por IP pode ser contornado; o confiável seria o último
 * item adicionado pelo proxy. Os limites por e-mail continuam valendo nos dois casos. Confirmar na Azure.
 *
 * Valor ausente ou inválido vira "unknown": todos esses clientes dividem o mesmo balde (fail-closed).
 */
export function getClientIp(headers: Headers): string {
  const first = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return first && isIP(first) ? first : "unknown";
}
