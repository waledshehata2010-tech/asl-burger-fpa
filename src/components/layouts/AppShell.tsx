"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  ClipboardList,
  FileBarChart,
  Languages,
  LayoutDashboard,
  ScatterChart,
  Users,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useT, type DictKey } from "@/lib/i18n";
import { useLocaleStore } from "@/store/localeStore";
import { useUiStore, type ModuleKey } from "@/store/uiStore";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { UploadWorkbookDialog } from "@/components/upload/UploadWorkbookDialog";
import { useFinancialModel } from "@/hooks/useFinancialModel";
import { ExecutiveOverview } from "@/components/modules/ExecutiveOverview";

// The Executive Overview is the default/most-visited tab, so it stays a
// normal static import (bundled up front, no extra network waterfall on
// first load). The other modules pull in the heaviest dependencies (AG Grid
// especially) and are only ever needed once the user navigates to them, so
// they're loaded on demand — this is what keeps the initial JS payload lean.
const ModuleSkeleton = () => (
  <div className="flex h-64 items-center justify-center text-muted-foreground">
    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
  </div>
);

const FinancialStatements = dynamic(
  () => import("@/components/modules/FinancialStatements").then((m) => m.FinancialStatements),
  { loading: ModuleSkeleton, ssr: false },
);
const ScenarioPlanning = dynamic(
  () => import("@/components/modules/ScenarioPlanning").then((m) => m.ScenarioPlanning),
  { loading: ModuleSkeleton },
);
const Benchmarking = dynamic(
  () => import("@/components/modules/Benchmarking").then((m) => m.Benchmarking),
  { loading: ModuleSkeleton, ssr: false },
);
const BoardDashboard = dynamic(
  () => import("@/components/modules/BoardDashboard").then((m) => m.BoardDashboard),
  { loading: ModuleSkeleton },
);
const InvestorDashboard = dynamic(
  () => import("@/components/modules/InvestorDashboard").then((m) => m.InvestorDashboard),
  { loading: ModuleSkeleton },
);

const MODULES: { key: ModuleKey; labelKey: DictKey; icon: typeof LayoutDashboard }[] = [
  { key: "overview", labelKey: "navOverview", icon: LayoutDashboard },
  { key: "statements", labelKey: "navStatements", icon: FileBarChart },
  { key: "scenarios", labelKey: "navScenarios", icon: ScatterChart },
  { key: "benchmarks", labelKey: "navBenchmarks", icon: BarChart3 },
  { key: "board", labelKey: "navBoard", icon: ClipboardList },
  { key: "investor", labelKey: "navInvestor", icon: Users },
];

function LanguageToggle() {
  const { t } = useT();
  const toggleLocale = useLocaleStore((s) => s.toggleLocale);
  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
      aria-label={t("langToggle")}
    >
      <Languages className="h-3.5 w-3.5" aria-hidden="true" />
      {t("langToggle")}
    </button>
  );
}

export function AppShell() {
  const active = useUiStore((s) => s.activeModule);
  const setActive = useUiStore((s) => s.setActiveModule);
  const { model, isUsingSample } = useFinancialModel();
  const { t } = useT();

  const activeLabel = MODULES.find((m) => m.key === active)?.labelKey;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className="no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-e border-border bg-card/60 px-3 py-5 lg:flex"
        aria-label="Primary"
      >
        <div className="mb-6 flex items-center gap-2.5 px-2">
          {/* Official Asl Burger mark (aslalburger.sa), cropped to the
              circular icon so it reads cleanly on the dark sidebar. */}
          <Image
            src="/brand/asl-burger-mark.png"
            alt="Asl Burger"
            width={36}
            height={36}
            priority
            className="h-9 w-9 shrink-0 rounded-full shadow-sm shadow-primary/30"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight">{t("appName")}</p>
            <p className="truncate text-[11px] text-muted-foreground leading-tight">{t("appTagline")}</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label={t("navOverview")}>
          {MODULES.map((m) => {
            const Icon = m.icon;
            const isActive = active === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setActive(m.key)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-primary/15 ring-1 ring-inset ring-primary/25"
                    transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" aria-hidden="true" />
                <span className="relative z-10">{t(m.labelKey)}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2">
          <LanguageToggle />
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-[11px] text-muted-foreground">
            {t("dataSource")}: {isUsingSample ? t("sampleAudited") : model.meta.sourceFileName}
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <Image
              src="/brand/asl-burger-mark.png"
              alt="Asl Burger"
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full shadow-sm shadow-primary/30 lg:hidden"
            />
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
                {activeLabel ? t(activeLabel) : ""}
              </h1>
              <p className="hidden truncate text-xs text-muted-foreground sm:block">{t("headerSubtitle")}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="lg:hidden">
              <LanguageToggle />
            </div>
            <UploadWorkbookDialog />
          </div>
        </header>

        <div className="print-only mb-6 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- plain img keeps the print header simple and avoids next/image's client hydration on a print-only element */}
          <img src="/brand/asl-burger-logo-full.png" alt="Asl Burger" className="h-14 w-auto" />
        </div>

        <main id="main-content" className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:pb-6">
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
            {active === "board" && <BoardDashboard />}
            {active === "investor" && <InvestorDashboard />}
          </motion.div>
        </main>
      </div>

      {/* Mobile bottom tab bar — replaces the sidebar below the lg breakpoint,
          so every module stays reachable on phones/tablets. */}
      <nav
        aria-label={t("navOverview")}
        className="no-print fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around overflow-x-auto border-t border-border bg-card/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {MODULES.map((m) => {
          const Icon = m.icon;
          const isActive = active === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setActive(m.key)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="line-clamp-1 text-center leading-tight">{t(m.labelKey)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
