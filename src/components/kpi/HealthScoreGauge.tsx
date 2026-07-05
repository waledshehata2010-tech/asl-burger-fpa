"use client";

import { motion } from "framer-motion";
import type { HealthScoreResult } from "@/lib/insightEngine";
import { useT } from "@/lib/i18n";

const bandColor: Record<HealthScoreResult["band"], string> = {
  excellent: "#34c77b",
  good: "#4f8ff7",
  fair: "#e8b64c",
  weak: "#f0554c",
};

/** Semi-circular gauge (pure SVG, no charting lib) for the 0-100 Financial
 *  Health Score. Sized to sit comfortably inside a Card. */
export function HealthScoreGauge({ health }: { health: HealthScoreResult }) {
  const { t } = useT();
  const size = 180;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 180;
  const endAngle = 0;
  const pct = health.score / 100;
  const sweep = 180 * pct;
  const color = bandColor[health.band];

  const polarToCartesian = (angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(angleRad), y: cy - r * Math.sin(angleRad) };
  };

  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(startAngle - sweep);
  const largeArc = sweep > 180 ? 1 : 0;
  const trackEnd = polarToCartesian(endAngle);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + stroke} viewBox={`0 0 ${size} ${size / 2 + stroke}`}>
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${trackEnd.x} ${trackEnd.y}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <motion.path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="-mt-10 flex flex-col items-center">
        <span className="text-4xl font-semibold tabular" style={{ color }}>
          {health.score}
        </span>
        <span className="text-[11px] text-muted-foreground">{t("healthScoreOutOf")}</span>
        <span className="mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `${color}22`, color }}>
          {health.bandLabel}
        </span>
      </div>
    </div>
  );
}
