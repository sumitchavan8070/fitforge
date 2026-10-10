import Link from "next/link";
import { cn } from "@/lib/utils";
import { titleCaseStatus } from "@/lib/format";

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-accent text-accent-foreground hover:brightness-95",
    secondary: "border border-border bg-card hover:bg-background",
    ghost: "hover:bg-background",
    danger: "bg-danger text-white hover:brightness-95",
  }[variant];
  return (
    <button className={cn("inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition disabled:opacity-50", styles, className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({ href, children, variant = "primary", className }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; className?: string }) {
  const styles = {
    primary: "bg-accent text-accent-foreground",
    secondary: "border border-border bg-card",
    ghost: "hover:bg-background",
    danger: "bg-danger text-white",
  }[variant];
  return <Link href={href} className={cn("inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3.5 text-sm font-semibold", styles, className)}>{children}</Link>;
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export const inputClass = "h-10 w-full rounded-xl border border-border bg-card px-3 outline-none ring-accent focus:ring-2";
export const selectClass = inputClass;

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "bad" | "info" }) {
  const tones = {
    neutral: "bg-background text-foreground",
    good: "bg-emerald-50 text-success",
    warn: "bg-amber-50 text-warning",
    bad: "bg-red-50 text-danger",
    info: "bg-lime-100 text-accent-foreground",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold", tones[tone])}>{children}</span>;
}

export function StatusBadge({ value }: { value: string }) {
  const tone = /PAID|ACTIVE|COMPLETED|RECEIVED|DELIVERED|OPEN/.test(value)
    ? "good"
    : /LOW|PARTIAL|PENDING|HELD|DRAFT|SOON|ISSUED/.test(value)
      ? "warn"
      : /CANCEL|EXPIRED|OUT|FAIL|REFUND|DISABLED|CREDITED|OVERDUE/.test(value)
        ? "bad"
        : "neutral";
  return <Badge tone={tone}>{titleCaseStatus(value)}</Badge>;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-2xl border border-border bg-card p-4 shadow-sm", className)}>{children}</section>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </Card>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function PageHeader({ title, description, actions, meta }: { title: string; description?: string; actions?: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {meta}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function ErrorText({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">{children}</p>;
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-2xl border border-border bg-card">{children}</div>;
}

export function DataTable({ columns, rows }: { columns: string[]; rows: React.ReactNode[][] }) {
  return (
    <TableWrap>
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
          <tr>{columns.map((column) => <th key={column} className="px-3 py-3 font-medium">{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-border last:border-0">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-3 align-middle">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

export function Pagination({ page, pageSize, total, path, query }: { page: number; pageSize: number; total: number; path: string; query: Record<string, string | undefined> }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const href = (next: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => { if (value) params.set(key, value); });
    params.set("page", String(next));
    return `${path}?${params.toString()}`;
  };
  return (
    <div className="mt-3 flex items-center justify-between text-sm text-muted">
      <span>{total} records</span>
      <div className="flex gap-2">
        <Link className={cn("rounded-lg border border-border px-3 py-1.5", page <= 1 && "pointer-events-none opacity-40")} href={href(page - 1)}>Previous</Link>
        <span className="px-2 py-1.5">Page {page} of {pages}</span>
        <Link className={cn("rounded-lg border border-border px-3 py-1.5", page >= pages && "pointer-events-none opacity-40")} href={href(page + 1)}>Next</Link>
      </div>
    </div>
  );
}
