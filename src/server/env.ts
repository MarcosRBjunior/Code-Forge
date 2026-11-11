import { z } from "zod";

/**
 * Variáveis de ambiente do servidor, validadas com Zod.
 * A leitura é preguiçosa (o `next build` importa as rotas sem as variáveis de produção), mas
 * `src/instrumentation.ts` chama getEnv() na subida do servidor: configuração inválida derruba o processo cedo.
 */
const Bool = z
  .enum(["true", "false"])
  .optional()
  .transform((v) => v === "true");

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  /** Origem pública do app (CSRF e links de reset). Normalizada para a origem, sem barra no final. */
  APP_URL: z.url({ protocol: /^https?$/ }).transform((u) => new URL(u).origin),
  /** Vazia conta como ausente (PGlite): `DATABASE_URL= npm run dev` testa local mesmo com o .env.local apontando para produção. */
  DATABASE_URL: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  /**
   * Cadastro fechado por padrão (abrir para o público é uma decisão de produto, não técnica).
   * REGISTRATION_OPEN=true abre para qualquer e-mail; REGISTRATION_ALLOWLIST libera só os e-mails listados.
   */
  REGISTRATION_OPEN: Bool,
  REGISTRATION_ALLOWLIST: z
    .string()
    .optional()
    .transform((v) =>
      (v ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    ),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // Só nomes e mensagens; nunca os valores (DATABASE_URL tem senha).
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Variáveis de ambiente inválidas: ${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export const isProduction = () => getEnv().NODE_ENV === "production";
