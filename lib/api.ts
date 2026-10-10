import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const base = () => process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

// Desk payloads are JSON from the API. Pages read the fields they render.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DeskData = any;

export async function api<T = DeskData>(path: string, init?: RequestInit): Promise<T> {
  const token = (await cookies()).get("gym_token")?.value;
  const response = await fetch(`${base()}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.status === 0) {
    throw new Error(json.msg || "Request failed");
  }
  return json.data as T;
}

export async function load(path: string) {
  try {
    return await api(path);
  } catch (error) {
    if (error instanceof Error && /not found/i.test(error.message)) {
      const { notFound } = await import("next/navigation");
      notFound();
    }
    throw error;
  }
}

export function qs(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

function isNextRedirect(error: unknown) {
  return typeof error === "object" && error !== null && "digest" in error && String((error as { digest?: string }).digest || "").startsWith("NEXT_REDIRECT");
}

type ActionResult = {
  error?: string;
  redirect?: string;
  id?: string;
  orderId?: string;
  invoiceId?: string;
  status?: string;
  url?: string | null;
  ok?: boolean;
  devLink?: string | null;
};

export async function postAction(path: string, body: unknown): Promise<ActionResult> {
  try {
    const data = await api<ActionResult>(path, { method: "POST", body: JSON.stringify(body) });
    if (data && typeof data.redirect === "string") redirect(data.redirect);
    return data || {};
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return { error: error instanceof Error ? error.message : "Something went wrong." };
  }
}

export function formBody(formData: FormData) {
  return Object.fromEntries([...formData.entries()].map(([key, value]) => [key, String(value)]));
}
