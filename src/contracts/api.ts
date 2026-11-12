/**
 * Contratos públicos da API do CodeForge (Zod v4). Usados pelos route handlers (entrada), pelos services
 * (tipos) e pelo cliente (tipos inferidos). Por enquanto só o módulo de autenticação.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Primitivos de auth
// ---------------------------------------------------------------------------

/** Normaliza (trim + lowercase) ANTES de validar; o valor que chega ao service já está normalizado. */
export const Email = z.string().trim().toLowerCase().max(254, "Máximo de 254 caracteres.").pipe(z.email("E-mail inválido."));

/** Política de senha para cadastro e redefinição. */
export const NewPassword = z
  .string()
  .min(8, "Mínimo de 8 caracteres.")
  .max(128, "Máximo de 128 caracteres.")
  .regex(/\p{L}/u, "Inclua ao menos uma letra.")
  .regex(/\p{N}/u, "Inclua ao menos um número.");

export const Name = z.string().trim().min(1, "Informe o nome.").max(80, "Máximo de 80 caracteres.");

export const UserRole = z.enum(["student", "admin"]);

// ---------------------------------------------------------------------------
// Entradas
// ---------------------------------------------------------------------------

export const RegisterInput = z.object({ email: Email, password: NewPassword, name: Name });
export type RegisterInput = z.infer<typeof RegisterInput>;

/** No login a senha não passa pela política (só limites de tamanho): regras novas não trancam contas antigas. */
export const LoginInput = z.object({ email: Email, password: z.string().min(1).max(128) });
export type LoginInput = z.infer<typeof LoginInput>;

export const ForgotPasswordInput = z.object({ email: Email });
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInput>;

export const ResetPasswordInput = z.object({ token: z.string().min(1).max(200), password: NewPassword });
export type ResetPasswordInput = z.infer<typeof ResetPasswordInput>;

export const VerifyEmailInput = z.object({ token: z.string().min(1).max(200) });
export type VerifyEmailInput = z.infer<typeof VerifyEmailInput>;

/** Senha atual (conta logada): como no login, só limites de tamanho. */
const CurrentPassword = z.string().min(1, "Informe a senha atual.").max(128);

/** Troca de senha com a sessão aberta. A nova segue a mesma política do cadastro. */
export const ChangePasswordInput = z.object({ currentPassword: CurrentPassword, newPassword: NewPassword });
export type ChangePasswordInput = z.infer<typeof ChangePasswordInput>;

/** Exclusão da conta: exige a senha atual. */
export const DeleteAccountInput = z.object({ password: CurrentPassword });
export type DeleteAccountInput = z.infer<typeof DeleteAccountInput>;

// ---------------------------------------------------------------------------
// Saídas
// ---------------------------------------------------------------------------

/** Usuário como sai da API: nunca inclui password_hash. */
export const PublicUser = z.object({
  id: z.uuid(),
  email: z.string(),
  name: z.string(),
  role: UserRole,
  createdAt: z.iso.datetime({ offset: true }),
});
export type PublicUser = z.infer<typeof PublicUser>;

export const UserResponse = z.object({ user: PublicUser });
export type UserResponse = z.infer<typeof UserResponse>;

export const MessageResponse = z.object({ message: z.string() });

export const ApiErrorBody = z.object({
  error: z.object({ code: z.string(), message: z.string(), details: z.unknown().optional() }),
});
export type ApiErrorBody = z.infer<typeof ApiErrorBody>;
