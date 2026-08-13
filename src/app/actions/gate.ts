"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  GATE_COOKIE,
  GATE_MAX_AGE,
  issueToken,
  safeReturnPath,
} from "@/lib/site-gate";

/**
 * Check the shared site password and, if it's right, drop the gate cookie that
 * src/proxy.ts looks for. A wrong password bounces back to /enter?error=1 —
 * nothing distinguishes "wrong password" from "gate disabled", so there's no
 * signal to probe.
 */
export async function enterSite(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  const from = safeReturnPath(String(formData.get("from") ?? "/"));

  const token = issueToken(password);
  if (!token) {
    const params = new URLSearchParams({ error: "1" });
    if (from !== "/") params.set("from", from);
    redirect(`/enter?${params.toString()}`);
  }

  const store = await cookies();
  store.set({
    name: GATE_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: GATE_MAX_AGE,
  });

  redirect(from);
}
