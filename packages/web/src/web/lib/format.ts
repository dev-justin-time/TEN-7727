/** Money is stored in cents everywhere. */
export function money(cents: number | null | undefined, opts: { precise?: boolean } = {}) {
  const v = (cents ?? 0) / 100;
  const precise = opts.precise ?? Math.abs(v) < 1000;
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: precise ? 2 : 0,
    maximumFractionDigits: precise ? 2 : 0,
  });
}

/** Basis points to a percent string. 10000 bp = 100%. */
export function pct(bp: number | null | undefined, digits = 2) {
  return `${((bp ?? 0) / 100).toFixed(digits)}%`;
}

export function ratio(r: number = 0, digits = 1) {
  return `${(r * 100).toFixed(digits)}%`;
}

export function num(n: number | null | undefined) {
  return (n ?? 0).toLocaleString("en-US");
}

export function ago(d: Date | string | number | null | undefined) {
  if (!d) return "—";
  const ms = Date.now() - new Date(d).getTime();
  const future = ms < 0;
  const abs = Math.abs(ms);
  const m = Math.round(abs / 60000);
  let s: string;
  if (m < 1) s = "just now";
  else if (m < 60) s = `${m}m`;
  else if (m < 1440) s = `${Math.round(m / 60)}h`;
  else s = `${Math.round(m / 1440)}d`;
  if (s === "just now") return s;
  return future ? `in ${s}` : `${s} ago`;
}

export function date(d: Date | string | number | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function errMsg(e: unknown) {
  if (!e) return "";
  if (typeof e === "object" && e && "message" in e) return String((e as { message: unknown }).message);
  return String(e);
}

export const BRAND_LABEL: Record<string, string> = {
  hub: "Kinship Hub",
  forge: "Forge Club",
  orbital: "Orbital Works",
  sole: "Sole Society",
};

export const STATUS_LABEL: Record<string, string> = {
  live: "Live",
  funded: "Funded",
  default_notice: "Default notice",
  foreclosed: "Foreclosed",
  redistributed: "Redistributed",
  cancelled: "Cancelled",
  closed: "Closed",
};

export function currentPeriod(offsetMonths = 0) {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + offsetMonths);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
