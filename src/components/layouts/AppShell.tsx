"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  FileBarChart,
  GaugeCircle,
  LayoutDashboard,
  ScatterChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadWorkbookDialog } from "@/components/upload/UploadWorkbookDialog";
import { useFinancialModel } from "@/hooks/useFinancialModel";
import { ExecutiveOverview } from "@/components/modules/ExecutiveOverview";
import { FinancialStatements } from "@/components/modules/FinancialStatements";
import { ScenarioPlanning } from "@/components/modules/ScenarioPlanning";
import { Benchmarking } from "@/components/modules/Benchmarking";

const MODULES = [
  { key: "overview", label: "لوحة العرض التنفيذي", icon: LayoutDashboard },
  { key: "statements", label: "القوائم المالية", icon: FileBarChart },
  { key: "scenarios", label: "السيناريوهات والتقييم", icon: ScatterChart },
  { key: "benchmarks", label: "معايير الصناعة", icon: BarChart3 },
] as const;

type ModuleKey = (typeof MODULES)[number]["key"];

export function AppShell() {
  const [active, setActive] = useState<ModuleKey>("overview");
  const { model, isUsingSample } = useFinancialModel();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-l border-border bg-card/60 px-3 py-5 lg:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <GaugeCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">أصل البرجر</p>
            <p className="text-[11px] text-muted-foreground leading-tight">FP&A Platform</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {MODULES.map((m) => {
            const Icon = m.icon;
            const isActive = active === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setActive(m.key)}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-primary/15"
                    transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{m.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-[11px] text-muted-foreground">
          مصدر البيانات: {isUsingSample ? "عينة مدققة" : model.meta.sourceFileName}
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-6 py-4 backdrop-blur">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {MODULES.find((m) => m.key === active)?.label}
            </h1>
            <p className="text-xs text-muted-foreground">
              منصة التخطيط والتحليل المالي المؤسسي — شركة أصل البرجر
            </p>
          </div>
          <UploadWorkbookDialog />
        </header>

        <main className="flex-1 px-6 py-6">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {active === "overview" && <ExecutiveOverview />}
            {active === "statements" && <FinancialStatements />}
            {active === "scenarios" && <ScenarioPlanning />}
            {active === "benchmarks" && <Benchmarking />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
