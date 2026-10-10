import Link from "next/link";
import { cn } from "@/lib/utils";

const OPTIONS = [
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["7d", "Last 7 days"],
  ["30d", "Last 30 days"],
  ["month", "This month"],
  ["last_month", "Last month"],
] as const;

export function DateFilter({ path, current, from, to }: { path: string; current: string; from?: string; to?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {OPTIONS.map(([key, label]) => (
        <Link key={key} href={`${path}?range=${key}`} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium", current === key ? "border-sidebar bg-sidebar text-accent" : "border-border bg-card")}>{label}</Link>
      ))}
      <form className="flex items-center gap-2" action={path}>
        <input type="hidden" name="range" value="custom" />
        <input aria-label="From date" type="date" name="from" defaultValue={from} className="h-8 rounded-lg border border-border bg-card px-2 text-xs" />
        <input aria-label="To date" type="date" name="to" defaultValue={to} className="h-8 rounded-lg border border-border bg-card px-2 text-xs" />
        <button className="h-8 rounded-lg bg-sidebar px-3 text-xs text-white">Apply</button>
      </form>
    </div>
  );
}
