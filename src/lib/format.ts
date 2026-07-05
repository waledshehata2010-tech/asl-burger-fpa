/** Shared number/currency/percentage formatting helpers. */

export function fmtNum(value: number | null | undefined, opts?: { compact?: boolean; decimals?: number }): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const decimals = opts?.decimals ?? 0;
  if (opts?.compact) {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtSar(value: number | null | undefined, compact = true): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${fmtNum(value, { compact })} ر.س`;
}

export function fmtPct(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function fmtX(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${value.toFixed(decimals)}x`;
}

export function fmtMetric(value: number | null | undefined, fmt: "pct" | "x"): string {
  return fmt === "pct" ? fmtPct(value) : fmtX(value);
}
