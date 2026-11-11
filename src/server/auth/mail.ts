import type { Logger } from "./deps";

export interface PasswordResetMail {
  to: string;
  name: string;
  resetUrl: string;
  expiresAt: Date;
}

/** Contrato de envio. Implementações: AcsMailService (produção), ConsoleMailService (dev), DisabledMailService. */
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

const escapeHtml = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Texto do e-mail de redefinição (puro e HTML). Exportado para os testes. */
export function passwordResetMessage({ name, resetUrl, expiresAt }: PasswordResetMail) {
  const hora = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(expiresAt);
  const subject = "Redefinição de senha do CodeForge";
  const plainText = [
    `Olá, ${name}.`,
    "",
    "Recebemos um pedido para redefinir a senha da sua conta no CodeForge. Para criar uma nova senha, abra o link:",
    resetUrl,
    "",
    `O link vale até ${hora} (horário de Brasília) e só pode ser usado uma vez.`,
    "Se você não pediu isso, ignore este e-mail: sua senha continua a mesma.",
  ].join("\n");
  const html = `<p>Olá, ${escapeHtml(name)}.</p>
<p>Recebemos um pedido para redefinir a senha da sua conta no CodeForge.</p>
<p><a href="${escapeHtml(resetUrl)}">Criar uma nova senha</a></p>
<p>O link vale até ${hora} (horário de Brasília) e só pode ser usado uma vez.</p>
<p>Se você não pediu isso, ignore este e-mail: sua senha continua a mesma.</p>`;
  return { subject, plainText, html };
}

/**
 * Azure Communication Services (Email). Remetente do domínio gerenciado pela Azure (DoNotReply@<guid>.azurecomm.net).
 * Roda depois da resposta (defer); falhas sobem para o PasswordResetService, que só registra o nome e a mensagem do erro.
 */
export class AcsMailService implements MailService {
  constructor(
    private readonly connectionString: string,
    private readonly senderAddress: string,
  ) {}

  async sendPasswordReset(mail: PasswordResetMail): Promise<void> {
    const { EmailClient } = await import("@azure/communication-email");
    const client = new EmailClient(this.connectionString);
    const poller = await client.beginSend({
      senderAddress: this.senderAddress,
      content: passwordResetMessage(mail),
      recipients: { to: [{ address: mail.to, displayName: mail.name }] },
    });
    const result = await poller.pollUntilDone();
    if (result.status !== "Succeeded") throw new Error(`ACS: envio terminou com status ${result.status}`);
  }
}

export interface MailConfig {
  /** ACS_CONNECTION_STRING e MAIL_FROM: com os dois, envia de verdade (em qualquer ambiente). */
  acsConnectionString?: string;
  mailFrom?: string;
}

/** ACS configurado → envia; senão produção não envia (só registra) e desenvolvimento escreve o link no console. */
export function createMailService(production: boolean, logger: Logger, config: MailConfig = {}): MailService {
  if (config.acsConnectionString && config.mailFrom) return new AcsMailService(config.acsConnectionString, config.mailFrom);
  return production ? new DisabledMailService(logger) : new ConsoleMailService(false);
}
