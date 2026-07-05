"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkline } from "./Sparkline";
import { Delta } from "./Delta";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { useT } from "@/lib/i18n";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number | null;
  positiveIsGood?: boolean;
  sparkline?: number[];
  icon?: LucideIcon;
  accent?: "primary" | "success" | "warning" | "danger" | "gold";
  onDrilldown?: () => void;
}

const accentMap: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  primary: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  danger: "text-danger bg-danger/10",
  gold: "text-gold bg-gold/10",
};

export function KpiCard({
  label,
  value,
  delta,
  positiveIsGood = true,
  sparkline,
  icon: Icon,
  accent = "primary",
  onDrilldown,
}: KpiCardProps) {
  const { t } = useT();
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card
        className={cn(
          "relative overflow-hidden border-border/60 transition-all duration-200",
          onDrilldown && "cursor-pointer hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-black/20",
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
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular">{value}</p>
            </div>
            {Icon && (
              <div className={cn("rounded-lg p-2", accentMap[accent])} aria-hidden="true">
                <Icon className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            {delta !== undefined ? <Delta value={delta} positiveIsGood={positiveIsGood} /> : <span />}
            {sparkline && sparkline.length > 1 && (
              <div className="w-20" aria-hidden="true">
                <Sparkline data={sparkline} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
