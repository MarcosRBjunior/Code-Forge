import type { User } from "@/server/db/schema/auth";
import type { PublicUser } from "@/contracts/api";

/** Normalização única de e-mail, aplicada antes de gravar ou consultar (o Zod já faz; aqui é a defesa do service). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Única forma de um usuário sair do servidor: lista explícita de campos, nunca o password_hash. */
export function toPublicUser(user: Pick<User, "id" | "email" | "name" | "role" | "createdAt">): PublicUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt.toISOString() };
}

/** Código do Postgres para violação de UNIQUE (vale para pg e PGlite). */
export function isUniqueViolation(err: unknown): boolean {
  for (let e: unknown = err; e && typeof e === "object"; e = (e as { cause?: unknown }).cause) {
    if ((e as { code?: unknown }).code === "23505") return true;
  }
  return false;
}
