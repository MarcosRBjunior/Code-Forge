import { createHash, randomBytes } from "node:crypto";

/** Token opaco: 32 bytes aleatórios em base64url (43 caracteres). Vai para o cliente; o banco só vê o hash. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** SHA-256 em hex. Basta (sem salt nem argon2): o token já tem 256 bits de entropia. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

/** Descarta cedo valores que não podem ser um token nosso (evita consulta ao banco com lixo). */
export function isWellFormedToken(value: string | undefined | null): value is string {
  return typeof value === "string" && TOKEN_RE.test(value);
}
