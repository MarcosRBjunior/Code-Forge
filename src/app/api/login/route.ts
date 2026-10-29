import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE, authToken, safeEqual } from "@/lib/auth-token";
import { apiError, parseBody } from "@/lib/api";

const Login = z.object({ password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return new NextResponse(null, { status: 204 });

  const body = await parseBody(req, Login);
  if (body instanceof NextResponse) return body;

  const [given, wanted] = await Promise.all([authToken(body.password), authToken(expected)]);
  if (!safeEqual(given, wanted)) {
    await new Promise((r) => setTimeout(r, 600)); // freia tentativas de força bruta
    return apiError(401, "UNAUTHENTICATED", "Senha incorreta.");
  }
  const res = new NextResponse(null, { status: 204 });
  res.cookies.set(AUTH_COOKIE, wanted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return res;
}
