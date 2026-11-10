import type { NextConfig } from "next";

const production = process.env.NODE_ENV === "production";

// API same-origin: nenhum header de CORS é emitido (navegadores bloqueiam leitura entre origens por padrão).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HSTS só em produção: em http://localhost o navegador passaria a exigir HTTPS.
  ...(production ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Pacotes nativos/WASM ficam fora do bundle (o @node-rs/argon2 carrega um binário .node).
  serverExternalPackages: ["@electric-sql/pglite", "pg", "@node-rs/argon2"],
  // Servidor Node autocontido em .next/standalone (imagem Docker para o Azure Container Apps).
  output: "standalone",
  // ~1.200 páginas estáticas: em máquinas mais lentas (Docker, GitHub Actions) uma página pode passar de 60 s.
  staticPageGenerationTimeout: 300,
  // No Docker (pouca RAM) limite os processos do build com NEXT_BUILD_CPUS; fora dele, o padrão do Next.
  ...(process.env.NEXT_BUILD_CPUS && { experimental: { cpus: Number(process.env.NEXT_BUILD_CPUS) } }),
  // As aulas, soluções e migrações (drizzle/) são lidas do disco em tempo de execução: leve-as junto no standalone.
  outputFileTracingIncludes: { "/**": ["./content/**/*", "./drizzle/**/*"] },
};

export default nextConfig;
