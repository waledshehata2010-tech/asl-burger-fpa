/**
 * Zustand store — the single client-side state container for the currently
 * loaded financial model, active scenario, and any slider overrides. UI
 * components read from this store and call its actions; they never hold
 * financial data in local component state.
 */
import { create } from "zustand";
import { SAMPLE_MODEL } from "@/data/sampleModel";
import { parseWorkbookFile } from "@/services/excelParser";
import { validateWorkbookFile } from "@/lib/fileValidation";
import { translate } from "@/lib/i18n";
import { useLocaleStore } from "@/store/localeStore";
import type { FinancialModel, ScenarioKey, ScenarioOverrides } from "@/types/financial";

export type UploadStatus = "idle" | "parsing" | "error" | "success";

interface FinancialModelState {
  model: FinancialModel;
  isUsingSample: boolean;
  scenarioKey: ScenarioKey;
  overrides: ScenarioOverrides;
  uploadStatus: UploadStatus;
  uploadError: string | null;

  setScenarioKey: (key: ScenarioKey) => void;
  setOverrides: (overrides: ScenarioOverrides) => void;
  updateOverride: <K extends keyof ScenarioOverrides>(key: K, value: ScenarioOverrides[K]) => void;
  resetOverrides: () => void;
  loadWorkbookFile: (file: File) => Promise<void>;
  resetToSample: () => void;
}

export const useFinancialModelStore = create<FinancialModelState>((set, get) => ({
  model: SAMPLE_MODEL,
  isUsingSample: true,
  scenarioKey: "base",
  overrides: {},
  uploadStatus: "idle",
  uploadError: null,

  setScenarioKey: (key) => set({ scenarioKey: key, overrides: {} }),

  setOverrides: (overrides) => set({ overrides }),

  updateOverride: (key, value) =>
    set({ overrides: { ...get().overrides, [key]: value } }),

  resetOverrides: () => set({ overrides: {} }),

  loadWorkbookFile: async (file: File) => {
    const locale = useLocaleStore.getState().locale;
    set({ uploadStatus: "parsing", uploadError: null });

    const validation = validateWorkbookFile(file);
    if (!validation.ok) {
      const key = validation.reason === "type" ? "errFileType" : validation.reason === "size" ? "errFileTooLarge" : "errFileEmpty";
      set({ uploadStatus: "error", uploadError: translate(locale, key) });
      return;
    }

    try {
      const { model, warnings } = await parseWorkbookFile(file);
      set({
        model,
        isUsingSample: false,
        scenarioKey: "base",
        overrides: {},
        uploadStatus: "success",
        uploadError: warnings.length > 0 ? warnings.join(" ") : null,
      });
    } catch (err) {
      set({
        uploadStatus: "error",
        uploadError: err instanceof Error ? err.message : translate(locale, "errGeneric"),
      });
    }
  },

  resetToSample: () =>
    set({
      model: SAMPLE_MODEL,
      isUsingSample: true,
      scenarioKey: "base",
      overrides: {},
      uploadStatus: "idle",
      uploadError: null,
    }),
}));
