import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, authToken, safeEqual } from "@/lib/auth-token";

export async function middleware(req: NextRequest) {
  const isApi = req.nextUrl.pathname.startsWith("/api/");
  const password = process.env.APP_PASSWORD;

  // Sem senha configurada o app fica FECHADO (nunca aberto por engano), em qualquer ambiente.
  if (!password) {
    const message = "APP_PASSWORD não está configurada. Defina-a no .env.local (local) ou nas variáveis da Vercel.";
    return isApi
      ? NextResponse.json({ error: { code: "NOT_CONFIGURED", message } }, { status: 503 })
      : new NextResponse(message, { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } });
  }

  const cookie = req.cookies.get(AUTH_COOKIE)?.value ?? "";
  if (cookie && safeEqual(cookie, await authToken(password))) return NextResponse.next();

  if (isApi) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Faça login." } }, { status: 401 });
  }
  const login = new URL("/login", req.url);
  login.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!login|api/login|_next/static|_next/image|favicon.ico).*)"],
};
