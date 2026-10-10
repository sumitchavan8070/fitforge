"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { postAction } from "@/lib/api";

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

export async function loginAction(_state: { error: string }, formData: FormData): Promise<{ error: string }> {
  const response = await fetch(`${apiUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") }),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.status !== 1 || !json.data?.token) {
    return { error: json.msg || "Could not sign in." };
  }
  const jar = await cookies();
  jar.set("gym_token", json.data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  const next = String(formData.get("next") || "/");
  redirect(next.startsWith("/") ? next : "/");
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete("gym_token");
  redirect("/login");
}

export async function forgotAction(_state: { error: string; message: string; devLink: string | null }, formData: FormData) {
  const result = await postAction("/api/actions/forgot-password", { email: String(formData.get("email") || "") });
  if ("error" in result && result.error) return { error: String(result.error), message: "", devLink: null };
  return {
    error: "",
    message: "If the account exists, the reset link was created.",
    devLink: typeof result.devLink === "string" ? result.devLink : null,
  };
}

export async function resetAction(_state: { error: string }, formData: FormData): Promise<{ error: string }> {
  const password = String(formData.get("password") || "");
  if (password !== String(formData.get("confirm") || "")) return { error: "Passwords do not match." };
  const result = await postAction("/api/actions/reset-password", { token: String(formData.get("token") || ""), password });
  if ("error" in result && result.error) return { error: String(result.error) };
  redirect("/login");
}
