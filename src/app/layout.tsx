import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Literata } from "next/font/google";
import Link from "next/link";
import { PreferencesMenu } from "@/components/PreferencesMenu";
import { ReviewBadge } from "@/components/review/ReviewBadge";
import { SearchDialog } from "@/components/SearchDialog";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const literata = Literata({ subsets: ["latin", "latin-ext"], variable: "--font-literata", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: { default: "CodeForge", template: "%s | CodeForge" },
  description: "Estudo para entrevistas de engenharia: algoritmos, system design e prática de código.",
};

/** Aplica tema e preferências de leitura antes do primeiro paint (sem flash). */
const prefsScript = `(function(){try{var p=JSON.parse(localStorage.getItem("cf-prefs")||"{}");var d=document.documentElement;var t=p.theme&&p.theme!=="system"?p.theme:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");d.dataset.theme=t;d.dataset.readerSize=p.size||"m";d.dataset.readerWidth=p.width||"normal";d.dataset.readerFont=p.font||"serif";if(p.leading&&p.leading!=="normal")d.dataset.readerLeading=p.leading;}catch(e){document.documentElement.dataset.theme="light";}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${literata.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsScript }} />
      </head>
      <body className="font-ui antialiased">
        <header className="sticky top-0 z-40 flex h-header items-center gap-4 border-b border-line bg-bg/90 px-4 backdrop-blur">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span aria-hidden className="grid size-7 place-items-center rounded-md bg-accent text-sm text-fg-on-accent">
              CF
            </span>
            CodeForge
          </Link>
          <nav className="ml-2 flex items-center gap-1 text-sm text-fg-muted">
            <Link href="/" className="rounded-md px-2.5 py-1.5 hover:bg-surface-2 hover:text-fg">
              Cursos
            </Link>
            <Link href="/practice" className="rounded-md px-2.5 py-1.5 hover:bg-surface-2 hover:text-fg">
              Prática
            </Link>
            <ReviewBadge />
            <Link href="/interview" className="rounded-md px-2.5 py-1.5 hover:bg-surface-2 hover:text-fg">
              Entrevista
            </Link>
            <Link href="/animations" className="hidden rounded-md px-2.5 py-1.5 hover:bg-surface-2 hover:text-fg md:inline">
              Animações
            </Link>
            <Link href="/roadmaps" className="hidden rounded-md px-2.5 py-1.5 hover:bg-surface-2 hover:text-fg md:inline">
              Roadmaps
            </Link>
            <Link href="/dashboard" className="hidden rounded-md px-2.5 py-1.5 hover:bg-surface-2 hover:text-fg sm:inline">
              Painel
            </Link>
            <Link href="/notebook/dsa" className="hidden rounded-md px-2.5 py-1.5 hover:bg-surface-2 hover:text-fg sm:inline">
              Caderno
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <SearchDialog />
            <PreferencesMenu />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
