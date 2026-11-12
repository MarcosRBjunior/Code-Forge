import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { DeleteAccountForm } from "./DeleteAccountForm";

export const metadata: Metadata = { title: "Conta" };
export const dynamic = "force-dynamic";

/** Página da conta: e-mail, troca de senha e exclusão da conta. */
export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Conta</h1>

      <section className="mt-6 rounded-xl border border-line bg-surface-1 p-6 shadow-sm" aria-labelledby="dados">
        <h2 id="dados" className="text-lg font-semibold">
          Seus dados
        </h2>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-fg-muted">E-mail</dt>
          <dd className="break-all font-medium">{user.email}</dd>
          <dt className="text-fg-muted">Nome</dt>
          <dd>{user.name}</dd>
        </dl>
        <p className="mt-3 text-xs text-fg-muted">
          Veja quais dados guardamos e por quê na{" "}
          <Link href="/privacidade" className="text-accent hover:underline">
            política de privacidade
          </Link>
          .
        </p>
      </section>

      <ChangePasswordForm />
      <DeleteAccountForm />
    </main>
  );
}
