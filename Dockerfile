# Imagem de produção do CodeForge (Azure Container Apps). Usa o build "standalone" do Next.
# docker build -t codeforge . && docker run -p 3000:3000 -e APP_PASSWORD=... -e DATABASE_URL=... codeforge

FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_BUILD_CPUS=2
ENV NEXT_BUILD_CPUS=$NEXT_BUILD_CPUS
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-slim AS run
# Liga o pacote do ghcr.io ao repositório (o GITHUB_TOKEN do Actions pode publicar nele).
LABEL org.opencontainers.image.source=https://github.com/MarcosRBjunior/Code-Forge
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN useradd --system --uid 1001 nextjs
COPY --from=build --chown=nextjs /app/.next/standalone ./
COPY --from=build --chown=nextjs /app/.next/static ./.next/static
# As aulas são lidas do disco em tempo de execução (o tracing já as inclui; isto garante).
COPY --from=build --chown=nextjs /app/content ./content
# Migrações do drizzle-kit, aplicadas na primeira conexão com o banco.
COPY --from=build --chown=nextjs /app/drizzle ./drizzle
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
