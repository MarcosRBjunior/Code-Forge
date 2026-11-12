import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Política de privacidade" };

/*
 * Identificação (LGPD, art. 9º). RESPONSAVEL ainda não preenchido (opcional):
 *   RESPONSAVEL: nome da pessoa ou empresa que mantém o CodeForge.
 *   CONTATO: e-mail para pedidos sobre dados pessoais.
 * Enquanto estiverem null, a página não mostra esses itens e indica a página Conta para excluir os dados.
 */
const RESPONSAVEL: string | null = null;
const CONTATO: string | null = "marcosprogjunior@gmail.com";

const ATUALIZADA_EM = "12 de novembro de 2026";

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

/** Política de privacidade. Pública (fora do middleware): precisa abrir antes do cadastro. */
export default function PrivacidadePage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Política de privacidade</h1>
      <p className="mt-1 text-sm text-fg-muted">Última atualização: {ATUALIZADA_EM}.</p>
      <p className="mt-4 text-sm leading-relaxed">
        O CodeForge é uma plataforma de estudo para entrevistas de engenharia. Esta página explica, de forma direta, quais
        dados pessoais guardamos, para quê, onde ficam e como você apaga tudo.
        {RESPONSAVEL && <> O responsável pelo tratamento dos dados é {RESPONSAVEL}.</>}
      </p>

      <Secao titulo="Quais dados guardamos">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Conta:</strong> e-mail, nome e a senha em forma de hash (argon2id). A senha em si nunca é guardada.
          </li>
          <li>
            <strong>Sessão:</strong> um cookie de sessão (o único cookie do site), necessário para manter você conectado.
            No servidor guardamos só um hash dele e as datas de criação, último uso e validade (7 dias).
          </li>
          <li>
            <strong>Confirmação de e-mail e troca de senha:</strong> enquanto o cadastro não é confirmado, guardamos o
            e-mail, o nome e o hash da senha por até 24 horas. Os links enviados por e-mail ficam guardados só como hash
            e vencem (24 horas para confirmar o cadastro, 30 minutos para redefinir a senha).
          </li>
          <li>
            <strong>Dados de estudo:</strong> progresso de leitura, capítulos marcados, destaques (com o trecho
            destacado), notas, rascunhos de código, cartões de revisão, mock interviews e os dias em que você estudou.
          </li>
          <li>
            <strong>Limite de tentativas:</strong> para conter abuso (login, cadastro, recuperação de senha e outros), contamos
            as tentativas por endereço IP, por e-mail (guardado como hash) e por conta. Esses registros servem só para
            esse limite.
          </li>
          <li>
            <strong>No seu navegador:</strong> preferências de leitura e tema ficam no armazenamento local do navegador e
            não são enviadas ao servidor.
          </li>
        </ul>
        <p>Não usamos anúncios nem ferramentas de rastreamento ou de análise de terceiros.</p>
      </Secao>

      <Secao titulo="Onde os dados ficam">
        <p>
          O site e o banco de dados ficam na nuvem da Microsoft Azure. Os e-mails da conta (confirmação de cadastro e
          redefinição de senha) são enviados pelo Azure Communication Services. Como em qualquer serviço on-line, a
          infraestrutura pode registrar dados técnicos das requisições, como o endereço IP, para operação e segurança.
        </p>
      </Secao>

      <Secao titulo="Com quem compartilhamos">
        <p>
          Não vendemos seus dados nem os compartilhamos para publicidade. Dois recursos opcionais enviam conteúdo a
          serviços externos, só quando você os usa:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Tutor de IA:</strong> sua mensagem, o trecho selecionado, o seu código e o texto do capítulo vão para
            a API da Anthropic para gerar a resposta. A conversa não fica guardada no CodeForge.
          </li>
          <li>
            <strong>Execução de código em Java, C++, C# e Go:</strong> o código é enviado ao Judge0, um serviço externo
            de execução. As demais linguagens rodam no seu próprio navegador.
          </li>
        </ul>
        <p>Não envie dados pessoais nesses campos.</p>
      </Secao>

      <Secao titulo="Seus direitos e como excluir a conta">
        <p>
          Você vê o e-mail da conta e troca a senha na página{" "}
          <Link href="/account" className="text-accent hover:underline">
            Conta
          </Link>
          . Lá também dá para <strong>excluir a conta</strong>: isso apaga na hora a conta e todos os dados ligados a
          ela (dados de estudo, sessões, links pendentes e registros de tentativas associados à conta ou ao e-mail).
          Não dá para desfazer.
        </p>
        {CONTATO && (
          <p>
            Para outros pedidos sobre seus dados (como acesso, correção ou dúvidas), escreva para{" "}
            <a href={`mailto:${CONTATO}`} className="text-accent hover:underline">
              {CONTATO}
            </a>
            .
          </p>
        )}
      </Secao>

      <p className="mt-10 text-sm">
        <Link href="/register" className="text-accent hover:underline">
          Criar conta
        </Link>{" "}
        ·{" "}
        <Link href="/login" className="text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </main>
  );
}
