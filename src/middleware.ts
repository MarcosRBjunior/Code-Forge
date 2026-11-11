import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName } from "@/server/auth/cookie";

/*
 * Checagem OTIMISTA (Edge, sem banco): só verifica se o cookie de sessão existe, para mandar quem não entrou
 * para /login sem renderizar a página. Um cookie qualquer passa daqui; quem decide de verdade é
 * requireAuth()/authorize() (src/server/auth/current-user.ts) em cada rota da API.
 */
const COOKIE = sessionCookieName(process.env.NODE_ENV === "production");

export function middleware(req: NextRequest) {
  if (req.cookies.get(COOKIE)?.value) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Faça login para continuar." } }, { status: 401 });
  }
  const login = new URL("/login", req.url);
  login.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  // Públicas: login, cadastro e confirmação de e-mail, esqueci/redefinir senha, as rotas de auth e os arquivos estáticos.
  matcher: ["/((?!login|register|verify-email|forgot-password|reset-password|api/auth/|_next/static|_next/image|favicon.ico).*)"],
};
