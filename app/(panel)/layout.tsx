import { requireUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { Shell } from "@/components/shell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const shell = await api("/api/desk/shell");
  return (
    <Shell
      user={{ name: user.name, email: user.email, roleName: user.roleName, permissions: user.permissions }}
      demo={shell.demo}
      notifications={shell.notifications}
    >
      {children}
    </Shell>
  );
}
