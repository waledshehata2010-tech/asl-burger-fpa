"use client";

import { AlertOctagon, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { SmartAlert } from "@/lib/insightEngine";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const severityStyles: Record<SmartAlert["severity"], { icon: typeof AlertOctagon; className: string; dot: string }> = {
  critical: { icon: AlertOctagon, className: "border-danger/30 bg-danger/5 text-danger", dot: "bg-danger" },
  warning: { icon: AlertTriangle, className: "border-warning/30 bg-warning/5 text-warning", dot: "bg-warning" },
  info: { icon: Info, className: "border-primary/30 bg-primary/5 text-primary", dot: "bg-primary" },
  good: { icon: CheckCircle2, className: "border-success/30 bg-success/5 text-success", dot: "bg-success" },
};

export function AlertsPanel({ alerts }: { alerts: SmartAlert[] }) {
  const { t } = useT();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("smartAlertsTitle")}</CardTitle>
        <CardDescription>
          {alerts.length > 0
            ? `${alerts.length}`
            : t("smartAlertsNone")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {alerts.length === 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t("smartAlertsNone")}
          </div>
        )}
        {alerts.map((alert) => {
          const style = severityStyles[alert.severity];
          const Icon = style.icon;
          return (
            <div
              key={alert.id}
              role={alert.severity === "critical" ? "alert" : "status"}
              className={cn("flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm", style.className)}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div className="text-foreground">
                <p className="font-medium">{alert.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{alert.message}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
