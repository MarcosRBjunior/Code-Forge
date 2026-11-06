import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  // Servidor Node autocontido em .next/standalone (imagem Docker para a Azure). Na Vercel não muda nada.
  output: "standalone",
  // ~1.200 páginas estáticas: em máquinas mais lentas (Docker, GitHub Actions) uma página pode passar de 60 s.
  staticPageGenerationTimeout: 300,
  // No Docker (pouca RAM) limite os processos do build com NEXT_BUILD_CPUS; fora dele, o padrão do Next.
  ...(process.env.NEXT_BUILD_CPUS && { experimental: { cpus: Number(process.env.NEXT_BUILD_CPUS) } }),
  // As aulas e soluções são lidas do disco em tempo de execução: leve-as junto no standalone.
  outputFileTracingIncludes: { "/**": ["./content/**/*"] },
};

export default nextConfig;
