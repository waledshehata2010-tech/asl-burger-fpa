"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkline } from "./Sparkline";
import { Delta } from "./Delta";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number | null;
  positiveIsGood?: boolean;
  sparkline?: number[];
  icon?: LucideIcon;
  accent?: "primary" | "success" | "warning" | "danger" | "gold";
}

const accentMap: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  gold: "text-gold",
};

export function KpiCard({ label, value, delta, positiveIsGood = true, sparkline, icon: Icon, accent = "primary" }: KpiCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card className="relative overflow-hidden border-border/60" role="group" aria-label={`${label}: ${value}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular">{value}</p>
            </div>
            {Icon && (
              <div className={cn("rounded-lg bg-white/5 p-2", accentMap[accent])} aria-hidden="true">
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
