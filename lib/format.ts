const DEFAULT_TZ = "Asia/Kolkata";

export function appTimeZone(): string {
  return process.env.APP_TIMEZONE || DEFAULT_TZ;
}

export function formatDate(value: Date | string | null | undefined, tz = appTimeZone()): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: tz,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: Date | string | null | undefined, tz = appTimeZone()): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: tz,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function zonedYmd(value: Date, tz = appTimeZone()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

/** Start of a civil day in the shop timezone, as a UTC Date. India has no DST. */
export function zonedDayStart(ymd: string, tz = appTimeZone()): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const asZoned = zonedYmd(utcGuess, tz);
  const [zy, zm, zd] = asZoned.split("-").map(Number);
  const deltaDays = Date.UTC(year, month - 1, day) - Date.UTC(zy, zm - 1, zd);
  const probe = new Date(utcGuess.getTime() + deltaDays);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(probe);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const second = Number(parts.find((part) => part.type === "second")?.value ?? 0);
  return new Date(probe.getTime() - ((hour * 60 + minute) * 60 + second) * 1000);
}

export function addDays(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export type DateRangeKey =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "month"
  | "last_month"
  | "custom";

export function resolveRange(
  key: string | undefined,
  from?: string,
  to?: string,
  tz = appTimeZone(),
): { key: DateRangeKey; from: Date; to: Date; label: string; fromYmd: string; toYmd: string } {
  const today = zonedYmd(new Date(), tz);
  const selected = (key || "today") as DateRangeKey;
  let fromYmd = today;
  let toYmd = today;
  let label = "Today";

  if (selected === "yesterday") {
    fromYmd = addDays(today, -1);
    toYmd = fromYmd;
    label = "Yesterday";
  } else if (selected === "7d") {
    fromYmd = addDays(today, -6);
    label = "Last 7 days";
  } else if (selected === "30d") {
    fromYmd = addDays(today, -29);
    label = "Last 30 days";
  } else if (selected === "month") {
    fromYmd = `${today.slice(0, 7)}-01`;
    label = "This month";
  } else if (selected === "last_month") {
    const [year, month] = today.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 2, 1));
    const end = new Date(Date.UTC(year, month - 1, 0));
    fromYmd = start.toISOString().slice(0, 10);
    toYmd = end.toISOString().slice(0, 10);
    label = "Last month";
  } else if (selected === "custom" && from && to) {
    fromYmd = from;
    toYmd = to;
    label = "Custom range";
  }

  const start = zonedDayStart(fromYmd, tz);
  const end = new Date(zonedDayStart(addDays(toYmd, 1), tz).getTime() - 1);
  return { key: selected === "custom" ? "custom" : selected, from: start, to: end, label, fromYmd, toYmd };
}

export function previousRange(range: { from: Date; to: Date }): { from: Date; to: Date } {
  const length = range.to.getTime() - range.from.getTime() + 1;
  const to = new Date(range.from.getTime() - 1);
  const from = new Date(to.getTime() - length + 1);
  return { from, to };
}

export function financialYear(date = new Date(), tz = appTimeZone()): string {
  const ymd = zonedYmd(date, tz);
  const [year, month] = ymd.split("-").map(Number);
  const startYear = month >= 4 ? year : year - 1;
  const endYear = (startYear + 1) % 100;
  return `${String(startYear).slice(2)}${String(endYear).padStart(2, "0")}`;
}

export function formatDocumentNumber(prefix: string, fy: string, sequence: number): string {
  return `${prefix}-${fy}-${String(sequence).padStart(5, "0")}`;
}

export function slugify(value: string): string {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  return base || "item";
}

export function titleCaseStatus(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function daysUntil(date: Date | null | undefined, tz = appTimeZone()): number | null {
  if (!date) return null;
  const today = zonedDayStart(zonedYmd(new Date(), tz), tz).getTime();
  const target = zonedDayStart(zonedYmd(date, tz), tz).getTime();
  return Math.round((target - today) / 86_400_000);
}
