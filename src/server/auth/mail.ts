import type { Logger } from "./deps";

export interface PasswordResetMail {
  to: string;
  name: string;
  resetUrl: string;
  expiresAt: Date;
}

/** Contrato de envio. A integração real (SMTP, Azure Communication Services etc.) entra depois atrás dele. */
export interface MailService {
  sendPasswordReset(mail: PasswordResetMail): Promise<void>;
}

/**
 * Só para desenvolvimento: "envia" escrevendo o link no console.
 * É a única exceção à regra de nunca logar token de reset, e por isso se recusa a existir em produção.
 */
export class ConsoleMailService implements MailService {
  constructor(production: boolean) {
    if (production) throw new Error("ConsoleMailService não pode ser usado em produção.");
  }

  async sendPasswordReset({ to, resetUrl, expiresAt }: PasswordResetMail): Promise<void> {
    console.info(`[mail:dev] redefinição de senha para ${to} (expira ${expiresAt.toISOString()}): ${resetUrl}`);
  }
}

/** Produção sem provedor de e-mail configurado: não envia e registra o fato, sem o link. */
export class DisabledMailService implements MailService {
  constructor(private readonly logger: Logger) {}

  async sendPasswordReset(): Promise<void> {
    this.logger.warn("mail: provedor não configurado; e-mail de redefinição não enviado");
  }
}

export function createMailService(production: boolean, logger: Logger): MailService {
  return production ? new DisabledMailService(logger) : new ConsoleMailService(false);
}
