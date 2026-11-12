import type { Logger } from "./deps";

export interface PasswordResetMail {
  to: string;
  name: string;
  resetUrl: string;
  expiresAt: Date;
}

export interface EmailVerificationMail {
  to: string;
  name: string;
  verifyUrl: string;
  expiresAt: Date;
}

/** Alguém tentou cadastrar um e-mail que já tem conta: avisa o dono (em vez de revelar isso na resposta da API). */
export interface AccountExistsMail {
  to: string;
  name: string;
  loginUrl: string;
  forgotUrl: string;
}

/** Aviso ao dono de que a senha da conta mudou (troca na página de conta ou pelo link de redefinição). */
export interface PasswordChangedMail {
  to: string;
  name: string;
  changedAt: Date;
  /** Link de "esqueci minha senha", para quem não reconhecer a troca. */
  forgotUrl: string;
}

/** Contrato de envio. Implementações: AcsMailService (produção), ConsoleMailService (dev), DisabledMailService. */
export interface MailService {
  sendPasswordReset(mail: PasswordResetMail): Promise<void>;
  sendEmailVerification(mail: EmailVerificationMail): Promise<void>;
  sendAccountExists(mail: AccountExistsMail): Promise<void>;
  sendPasswordChanged(mail: PasswordChangedMail): Promise<void>;
}

/**
 * Só para desenvolvimento: "envia" escrevendo o link no console.
 * É a única exceção à regra de nunca logar tokens, e por isso se recusa a existir em produção.
 */
export class ConsoleMailService implements MailService {
  constructor(production: boolean) {
    if (production) throw new Error("ConsoleMailService não pode ser usado em produção.");
  }

  async sendPasswordReset({ to, resetUrl, expiresAt }: PasswordResetMail): Promise<void> {
    console.info(`[mail:dev] redefinição de senha para ${to} (expira ${expiresAt.toISOString()}): ${resetUrl}`);
  }

  async sendEmailVerification({ to, verifyUrl, expiresAt }: EmailVerificationMail): Promise<void> {
    console.info(`[mail:dev] confirmação de e-mail para ${to} (expira ${expiresAt.toISOString()}): ${verifyUrl}`);
  }

  async sendAccountExists({ to }: AccountExistsMail): Promise<void> {
    console.info(`[mail:dev] aviso de conta existente para ${to}`);
  }

  async sendPasswordChanged({ to }: PasswordChangedMail): Promise<void> {
    console.info(`[mail:dev] aviso de senha alterada para ${to}`);
  }
}

/** Produção sem provedor de e-mail configurado: não envia e registra o fato, sem o link. */
export class DisabledMailService implements MailService {
  constructor(private readonly logger: Logger) {}

  async sendPasswordReset(): Promise<void> {
    this.logger.warn("mail: provedor não configurado; e-mail de redefinição não enviado");
  }

  async sendEmailVerification(): Promise<void> {
    this.logger.warn("mail: provedor não configurado; e-mail de confirmação não enviado");
  }

  async sendAccountExists(): Promise<void> {
    this.logger.warn("mail: provedor não configurado; aviso de conta existente não enviado");
  }

  async sendPasswordChanged(): Promise<void> {
    this.logger.warn("mail: provedor não configurado; aviso de senha alterada não enviado");
  }
}

const escapeHtml = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const brasilia = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", ...opts }).format(d);

export interface MailContent {
  subject: string;
  plainText: string;
  html: string;
}

/** Texto do e-mail de redefinição (puro e HTML). Exportado para os testes. */
export function passwordResetMessage({ name, resetUrl, expiresAt }: PasswordResetMail): MailContent {
  const hora = brasilia(expiresAt, { hour: "2-digit", minute: "2-digit" });
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

/** Texto do e-mail de confirmação de cadastro. */
export function emailVerificationMessage({ name, verifyUrl, expiresAt }: EmailVerificationMail): MailContent {
  const quando = brasilia(expiresAt, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const subject = "Confirme seu e-mail no CodeForge";
  const plainText = [
    `Olá, ${name}.`,
    "",
    "Para ativar sua conta no CodeForge, confirme seu e-mail abrindo o link:",
    verifyUrl,
    "",
    `O link vale até ${quando} (horário de Brasília) e só pode ser usado uma vez.`,
    "Se você não criou uma conta, ignore este e-mail: nenhuma conta será criada.",
  ].join("\n");
  const html = `<p>Olá, ${escapeHtml(name)}.</p>
<p>Para ativar sua conta no CodeForge, confirme seu e-mail.</p>
<p><a href="${escapeHtml(verifyUrl)}">Confirmar e-mail</a></p>
<p>O link vale até ${quando} (horário de Brasília) e só pode ser usado uma vez.</p>
<p>Se você não criou uma conta, ignore este e-mail: nenhuma conta será criada.</p>`;
  return { subject, plainText, html };
}

/** Texto do aviso enviado ao dono de uma conta quando alguém tenta cadastrar o mesmo e-mail. */
export function accountExistsMessage({ name, loginUrl, forgotUrl }: AccountExistsMail): MailContent {
  const subject = "Você já tem conta no CodeForge";
  const plainText = [
    `Olá, ${name}.`,
    "",
    "Alguém (talvez você) tentou criar uma conta no CodeForge com este e-mail, mas ele já tem uma conta.",
    `Para entrar: ${loginUrl}`,
    `Esqueceu a senha? ${forgotUrl}`,
    "",
    "Se não foi você, ignore este e-mail: nada mudou na sua conta.",
  ].join("\n");
  const html = `<p>Olá, ${escapeHtml(name)}.</p>
<p>Alguém (talvez você) tentou criar uma conta no CodeForge com este e-mail, mas ele já tem uma conta.</p>
<p><a href="${escapeHtml(loginUrl)}">Entrar</a> · <a href="${escapeHtml(forgotUrl)}">Esqueci minha senha</a></p>
<p>Se não foi você, ignore este e-mail: nada mudou na sua conta.</p>`;
  return { subject, plainText, html };
}

/** Texto do aviso de senha alterada. */
export function passwordChangedMessage({ name, changedAt, forgotUrl }: PasswordChangedMail): MailContent {
  const quando = brasilia(changedAt, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const subject = "Sua senha do CodeForge foi alterada";
  const plainText = [
    `Olá, ${name}.`,
    "",
    `A senha da sua conta no CodeForge foi alterada em ${quando} (horário de Brasília).`,
    "Se foi você, não precisa fazer nada.",
    `Se não foi você, redefina a senha agora: ${forgotUrl}`,
  ].join("\n");
  const html = `<p>Olá, ${escapeHtml(name)}.</p>
<p>A senha da sua conta no CodeForge foi alterada em ${quando} (horário de Brasília).</p>
<p>Se foi você, não precisa fazer nada.</p>
<p>Se não foi você, <a href="${escapeHtml(forgotUrl)}">redefina a senha agora</a>.</p>`;
  return { subject, plainText, html };
}

/**
 * Azure Communication Services (Email). Remetente do domínio gerenciado pela Azure (DoNotReply@<guid>.azurecomm.net).
 * Roda depois da resposta (defer); falhas sobem para o service, que só registra o nome e a mensagem do erro.
 */
export class AcsMailService implements MailService {
  constructor(
    private readonly connectionString: string,
    private readonly senderAddress: string,
  ) {}

  sendPasswordReset(mail: PasswordResetMail): Promise<void> {
    return this.send(mail.to, mail.name, passwordResetMessage(mail));
  }

  sendEmailVerification(mail: EmailVerificationMail): Promise<void> {
    return this.send(mail.to, mail.name, emailVerificationMessage(mail));
  }

  sendAccountExists(mail: AccountExistsMail): Promise<void> {
    return this.send(mail.to, mail.name, accountExistsMessage(mail));
  }

  sendPasswordChanged(mail: PasswordChangedMail): Promise<void> {
    return this.send(mail.to, mail.name, passwordChangedMessage(mail));
  }

  private async send(to: string, name: string, content: MailContent): Promise<void> {
    const { EmailClient } = await import("@azure/communication-email");
    const client = new EmailClient(this.connectionString);
    const poller = await client.beginSend({
      senderAddress: this.senderAddress,
      content,
      recipients: { to: [{ address: to, displayName: name }] },
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
