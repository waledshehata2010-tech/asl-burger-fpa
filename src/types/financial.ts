export type ScenarioKey = "base" | "optimistic" | "pessimistic";

export interface ScenarioDefinition {
  key: ScenarioKey;
  label: string;
  sameStoreDelta: number;
  cogsShock: number;
  constrInflation: number;
  waccPremium: number;
}

export interface HistoricalSeries {
  years: number[];
  labels: string[];
  estimated: boolean[];
  revenue: (number | null)[];
  grossProfit: (number | null)[];
  netIncome: (number | null)[];
  totalAssets: (number | null)[];
  totalEquity: (number | null)[];
  totalLiabilities: (number | null)[];
  cash: (number | null)[];
}

export interface ForecastSeries {
  years: number[];
  revenue: number[];
  grossProfit: number[];
  operatingIncome: number[];
  ebitda: number[];
  netIncome: number[];
  endingCash: number[];
  currentRatio: number[];
  capex: number[];
  payoutRatio: number[];
  newBranches: number[];
  totalBranches: number[];
}

export interface ScenarioResult {
  years: number[];
  revenue: number[];
  grossProfit: number[];
  operatingIncome: number[];
  ebitda: number[];
  netIncome: number[];
  capex: number[];
  dividends: number[];
  endingCash: number[];
  currentRatio: number[];
  grossMargin: number[];
  ebitdaMargin: number[];
  netMargin: number[];
}

export interface DcfResult {
  enterpriseValue: number;
  wacc: number;
  fcf: number[];
}

export interface BenchmarkCompany {
  name: string;
  tag: string;
  grossMargin: number | null;
  ebitdaMargin: number | null;
  netMargin: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  roe: number | null;
  payout: number | null;
}

export interface BenchmarkMetric {
  key: keyof Omit<BenchmarkCompany, "name" | "tag">;
  label: string;
  fmt: "pct" | "x";
}

export interface BenchmarkData {
  metrics: BenchmarkMetric[];
  companies: Record<string, BenchmarkCompany>;
}

export interface FinancialModel {
  historical: HistoricalSeries;
  forecastBase: ForecastSeries;
  scenarios: Record<ScenarioKey, ScenarioDefinition>;
  benchmarks: BenchmarkData;
  meta: {
    sourceFileName: string | null;
    parsedAt: string | null;
    sheetsFound: string[];
    warnings: string[];
  };
}

export interface ScenarioOverrides {
  sameStoreDelta?: number;
  cogsShock?: number;
  payoutRatio?: number[];
  waccPremium?: number;
}
