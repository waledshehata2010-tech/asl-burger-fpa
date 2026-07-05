"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { KpiIntel } from "@/lib/insightEngine";

interface KpiIntelCardProps {
  label: string;
  value: string;
  intel: KpiIntel;
  onDrilldown?: () => void;
}

const statusStyles: Record<KpiIntel["status"], { badge: string; ring: string }> = {
  good: { badge: "bg-success/15 text-success", ring: "hover:border-success/40" },
  warning: { badge: "bg-warning/15 text-warning", ring: "hover:border-warning/40" },
  critical: { badge: "bg-danger/15 text-danger", ring: "hover:border-danger/40" },
};

const trendIcon = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus };

export function KpiIntelCard({ label, value, intel, onDrilldown }: KpiIntelCardProps) {
  const { t } = useT();
  const TrendIcon = trendIcon[intel.trend];
  const styles = statusStyles[intel.status];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card
        className={cn(
          "group relative overflow-hidden border-border/60 transition-all",
          onDrilldown && "cursor-pointer hover:shadow-lg hover:shadow-black/20",
          styles.ring,
        )}
        role={onDrilldown ? "button" : "group"}
        tabIndex={onDrilldown ? 0 : undefined}
        aria-label={onDrilldown ? `${label}: ${value}. ${t("clickToDrilldown")}` : `${label}: ${value}`}
        onClick={onDrilldown}
        onKeyDown={(e) => {
          if (onDrilldown && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onDrilldown();
          }
        }}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", styles.badge)}>
              {intel.status === "good" ? t("statusGood") : intel.status === "warning" ? t("statusWarning") : t("statusCritical")}
            </span>
          </div>

          <p className="mt-2 text-2xl font-semibold tracking-tight tabular">{value}</p>

          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <TrendIcon className="h-3 w-3" aria-hidden="true" />
              {t("kpiTrend")}
            </span>
            {intel.targetLabel && (
              <span className="text-muted-foreground">
                {t("kpiTarget")}: <span className="tabular font-medium text-foreground">{intel.targetLabel}</span>
              </span>
            )}
          </div>

          <p className="mt-3 border-t border-border/60 pt-2.5 text-xs leading-relaxed text-muted-foreground">
            {intel.explanation}
          </p>

          {onDrilldown && (
            <p className="mt-2 text-[10px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              {t("clickToDrilldown")} →
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
