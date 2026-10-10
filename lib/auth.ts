import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasPermission, type Permission } from "@/lib/permissions";

export type Actor = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  permissions: string[];
};

export async function getCurrentUser(): Promise<Actor | null> {
  const token = (await cookies()).get("gym_token")?.value;
  if (!token) return null;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = await response.json();
    if (!response.ok || json.status !== 1) return null;
    const user = json.data;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId || "",
      roleName: user.role,
      permissions: user.permissions || [],
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<Actor> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function guard(permission: Permission): Promise<Actor> {
  const user = await requireUser();
  if (!hasPermission(user.roleName, user.permissions, permission)) redirect("/forbidden");
  return user;
}

export function can(user: Actor, permission: Permission) {
  return hasPermission(user.roleName, user.permissions, permission);
}
