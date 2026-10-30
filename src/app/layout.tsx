import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Literata } from "next/font/google";
import Link from "next/link";
import { PreferencesMenu } from "@/components/PreferencesMenu";
import { NavMenu, ReviewCount } from "@/components/NavMenus";
import { COURSE_GROUPS } from "@/lib/course-groups";
import { getCourses } from "@/lib/content";
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
const prefsScript = `(function(){try{var p=JSON.parse(localStorage.getItem("cf-prefs")||"{}");var d=document.documentElement;var t=p.theme&&p.theme!=="system"?p.theme:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");d.dataset.theme=t;d.dataset.readerSize=p.size||"m";d.dataset.readerWidth=p.width||"normal";d.dataset.readerFont=p.font||"serif";if(p.leading&&p.leading!=="normal")d.dataset.readerLeading=p.leading;if(localStorage.getItem("cf-sidebar")==="collapsed")d.dataset.sidebar="collapsed";}catch(e){document.documentElement.dataset.theme="light";}})();`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const courses = await getCourses();
  const courseSections = COURSE_GROUPS.map((g) => ({
    title: g.title,
    items: courses
      .filter((c) => c.group === g.id)
      .map((c) => ({ href: `/learn/${c.slug}`, label: c.title, hint: c.availableCount < c.chapterCount ? `${c.availableCount}/${c.chapterCount}` : undefined })),
  })).filter((s) => s.items.length);
  const practiceSections = [
    {
      title: "Listas",
      items: [
        { href: "/practice?lista=75", label: "CodeForge 75", hint: "até 1 mês" },
        { href: "/practice?lista=completa", label: "Lista completa", hint: "1 a 3 meses" },
        { href: "/practice", label: "Todos os problemas", hint: "com filtros" },
      ],
    },
    {
      title: "Treino",
      items: [
        { href: "/review", label: "Revisão espaçada", badge: <ReviewCount /> },
        { href: "/interview", label: "Mock interview" },
        { href: "/animations", label: "Animações" },
      ],
    },
  ];
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
            <NavMenu label="Cursos" sections={courseSections} columns={2} />
            <NavMenu label="Prática" sections={practiceSections} badge={<ReviewCount />} />
            <Link href="/roadmaps" className="hidden rounded-md px-2.5 py-1.5 hover:bg-surface-2 hover:text-fg md:inline">
              Roadmaps
            </Link>
            <Link href="/dashboard" className="hidden rounded-md px-2.5 py-1.5 hover:bg-surface-2 hover:text-fg sm:inline">
              Painel
            </Link>
            <Link href="/notebook/dsa" className="hidden rounded-md px-2.5 py-1.5 hover:bg-surface-2 hover:text-fg lg:inline">
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
