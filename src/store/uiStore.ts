/**
 * Cross-module navigation state — kept separate from financialModelStore
 * (data) and localeStore (language). Lets any component (e.g. a KPI card)
 * drive the active module and, for Financial Statements, which tab is open,
 * enabling one-click "drill down from a KPI to its underlying statement".
 */
import { create } from "zustand";

export type ModuleKey = "overview" | "statements" | "scenarios" | "benchmarks" | "board" | "investor";
export type StatementsTab = "income" | "balance" | "cashflow" | "scenario";

interface UiState {
  activeModule: ModuleKey;
  statementsTab: StatementsTab;
  setActiveModule: (m: ModuleKey) => void;
  setStatementsTab: (tab: StatementsTab) => void;
  goToStatement: (tab: StatementsTab) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeModule: "overview",
  statementsTab: "income",
  setActiveModule: (m) => set({ activeModule: m }),
  setStatementsTab: (tab) => set({ statementsTab: tab }),
  goToStatement: (tab) => set({ activeModule: "statements", statementsTab: tab }),
}));
