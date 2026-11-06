import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth-token";

/** Apaga o cookie de sessão. Passa pelo middleware como qualquer rota da API. */
export async function POST() {
  const res = new NextResponse(null, { status: 204 });
  res.cookies.set(AUTH_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
