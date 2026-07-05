/**
 * Composed data-access hook for the UI layer.
 * ---------------------------------------------------------------------------
 * Components should import from here — never from the store or Data Engine
 * directly — so the wiring between "current model" -> "current scenario
 * result" -> "DCF" -> "benchmarks" lives in exactly one place.
 */
"use client";

import { useMemo } from "react";
import { useFinancialModelStore } from "@/store/financialModelStore";
import { computeScenario, computeModelBenchmark, simpleDCF } from "@/services/dataEngine";
import type { BenchmarkCompany } from "@/types/financial";

const WACC_BASE = 0.12;
const TERMINAL_GROWTH = 0.03;

export function useFinancialModel() {
  const model = useFinancialModelStore((s) => s.model);
  const isUsingSample = useFinancialModelStore((s) => s.isUsingSample);
  const scenarioKey = useFinancialModelStore((s) => s.scenarioKey);
  const overrides = useFinancialModelStore((s) => s.overrides);
  const uploadStatus = useFinancialModelStore((s) => s.uploadStatus);
  const uploadError = useFinancialModelStore((s) => s.uploadError);
  const setScenarioKey = useFinancialModelStore((s) => s.setScenarioKey);
  const updateOverride = useFinancialModelStore((s) => s.updateOverride);
  const resetOverrides = useFinancialModelStore((s) => s.resetOverrides);
  const loadWorkbookFile = useFinancialModelStore((s) => s.loadWorkbookFile);
  const resetToSample = useFinancialModelStore((s) => s.resetToSample);

  const scenarioResult = useMemo(
    () => computeScenario(model, scenarioKey, overrides),
    [model, scenarioKey, overrides],
  );

  const dcf = useMemo(() => {
    const def = model.scenarios[scenarioKey];
    const waccPremium = overrides.waccPremium ?? def.waccPremium;
    return simpleDCF(scenarioResult, WACC_BASE, waccPremium, TERMINAL_GROWTH);
  }, [scenarioResult, model, scenarioKey, overrides]);

  const benchmarkCompanies = useMemo((): Record<string, BenchmarkCompany> => {
    const modelRow: BenchmarkCompany = computeModelBenchmark(scenarioResult);
    return { aslBurger: modelRow, ...model.benchmarks.companies };
  }, [model, scenarioResult]);

  return {
    model,
    isUsingSample,
    scenarioKey,
    overrides,
    scenarioResult,
    dcf,
    benchmarkMetrics: model.benchmarks.metrics,
    benchmarkCompanies,
    uploadStatus,
    uploadError,
    setScenarioKey,
    updateOverride,
    resetOverrides,
    loadWorkbookFile,
    resetToSample,
  };
}
