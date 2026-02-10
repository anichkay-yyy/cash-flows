"use server";

import { cookies } from "next/headers";
import { createHash } from "crypto";

function generateToken(login: string, password: string): string {
  return createHash("sha256").update(`${login}:${password}`).digest("hex");
}

export async function loginAction(login: string, password: string) {
  const expectedLogin = process.env.AUTH_LOGIN;
  const expectedPassword = process.env.AUTH_PASSWORD;

  if (!expectedLogin || !expectedPassword) {
    return { success: false, error: "Auth not configured on server" };
  }

  if (login !== expectedLogin || password !== expectedPassword) {
    return { success: false, error: "Invalid credentials" };
  }

  const token = generateToken(expectedLogin, expectedPassword);
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return { success: true };
}
