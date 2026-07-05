"use client";

import { useMemo } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { LineChartPanel } from "@/components/charts/LineChartPanel";
import { KpiCard } from "@/components/kpi/KpiCard";
import { useFinancialModel } from "@/hooks/useFinancialModel";
import { fmtPct, fmtSar, fmtX } from "@/lib/format";
import { computeScenario } from "@/services/dataEngine";
import { useT, type DictKey } from "@/lib/i18n";
import type { ScenarioKey } from "@/types/financial";

const SCENARIO_ORDER: { key: ScenarioKey; labelKey: DictKey }[] = [
  { key: "pessimistic", labelKey: "scenarioPessimistic" },
  { key: "base", labelKey: "scenarioBase" },
  { key: "optimistic", labelKey: "scenarioOptimistic" },
];

export function ScenarioPlanning() {
  const {
    model,
    scenarioKey,
    overrides,
    scenarioResult,
    dcf,
    setScenarioKey,
    updateOverride,
    resetOverrides,
  } = useFinancialModel();
  const { t } = useT();

  const activeDef = model.scenarios[scenarioKey];
  const sameStoreDelta = overrides.sameStoreDelta ?? activeDef.sameStoreDelta;
  const cogsShock = overrides.cogsShock ?? activeDef.cogsShock;
  const waccPremium = overrides.waccPremium ?? activeDef.waccPremium;

  // Base case reference line for comparison, always recomputed with zero overrides.
  const baseReference = useMemo(() => computeScenario(model, "base"), [model]);

  const currentScenarioLabel = t("legendCurrentScenario");
  const baseReferenceLabel = t("legendBaseReference");

  const chartData = scenarioResult.years.map((y, i) => ({
    year: String(y),
    [currentScenarioLabel]: scenarioResult.revenue[i],
    [baseReferenceLabel]: baseReference.revenue[i],
  }));

  const lastIdx = scenarioResult.years.length - 1;
  const lastYear = scenarioResult.years[lastIdx];

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("scenarioTitle")}</CardTitle>
            <CardDescription>{t("scenarioDesc")}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={resetOverrides}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t("resetOverrides")}
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Tabs value={scenarioKey} onValueChange={(v) => setScenarioKey(v as ScenarioKey)}>
            <TabsList className="flex-wrap h-auto">
              {SCENARIO_ORDER.map(({ key, labelKey }) => (
                <TabsTrigger key={key} value={key}>
                  {t(labelKey)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("sliderSameStore")}</span>
                <span className="tabular font-medium">{sameStoreDelta >= 0 ? "+" : ""}{fmtPct(sameStoreDelta)}</span>
              </div>
              <Slider
                value={[sameStoreDelta]}
                min={-0.1}
                max={0.1}
                step={0.005}
                aria-label={t("sliderSameStore")}
                onValueChange={([v]) => updateOverride("sameStoreDelta", v)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("sliderCogsShock")}</span>
                <span className="tabular font-medium">{cogsShock >= 0 ? "+" : ""}{fmtPct(cogsShock)}</span>
              </div>
              <Slider
                value={[cogsShock]}
                min={-0.03}
                max={0.08}
                step={0.005}
                aria-label={t("sliderCogsShock")}
                onValueChange={([v]) => updateOverride("cogsShock", v)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("sliderWacc")}</span>
                <span className="tabular font-medium">{waccPremium >= 0 ? "+" : ""}{fmtPct(waccPremium)}</span>
              </div>
              <Slider
                value={[waccPremium]}
                min={-0.03}
                max={0.05}
                step={0.005}
                aria-label={t("sliderWacc")}
                onValueChange={([v]) => updateOverride("waccPremium", v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={`${t("kpiRevenue2030Short").replace("2030", String(lastYear))}`}
          value={fmtSar(scenarioResult.revenue[lastIdx])}
          icon={Calculator}
          accent="primary"
        />
        <KpiCard
          label={`${t("kpiNetIncome2030").replace("2030", String(lastYear))}`}
          value={fmtSar(scenarioResult.netIncome[lastIdx])}
          accent="success"
        />
        <KpiCard
          label={`${t("kpiCash2030Short").replace("2030", String(lastYear))}`}
          value={fmtSar(scenarioResult.endingCash[lastIdx])}
          accent="gold"
        />
        <KpiCard
          label={`${t("kpiCurrentRatio2030").replace("2030", String(lastYear))}`}
          value={fmtX(scenarioResult.currentRatio[lastIdx])}
          accent="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{t("scenarioVsBaseTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartPanel
              data={chartData}
              xKey="year"
              series={[
                { key: currentScenarioLabel, label: currentScenarioLabel, color: "#4f8ff7" },
                { key: baseReferenceLabel, label: baseReferenceLabel, color: "#9aa1ae", dashed: true },
              ]}
              height={280}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dcfTitle")}</CardTitle>
            <CardDescription>{t("dcfDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{t("dcfEv")}</p>
              <p className="mt-1 text-2xl font-semibold tabular">{fmtSar(dcf.enterpriseValue)}</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
              <span className="text-muted-foreground">{t("dcfWacc")}</span>
              <span className="tabular font-medium">{fmtPct(dcf.wacc)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
              <span className="text-muted-foreground">{`${t("dcfFcf2030").replace("2030", String(lastYear))}`}</span>
              <span className="tabular font-medium">{fmtSar(dcf.fcf[dcf.fcf.length - 1])}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
