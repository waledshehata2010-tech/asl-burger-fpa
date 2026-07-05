/**
 * ERP Integration Service (future extension point)
 * ---------------------------------------------------------------------------
 * Today the workbook is the single source of truth and is parsed client-side
 * by `excelParser.ts`. This module is the seam future ERP/API integrations
 * (SAP, Oracle NetSuite, Odoo, a custom finance API, etc.) plug into without
 * touching any component or the Data Engine: implement `fetchFromErp` to call
 * the real system and it slots directly into `useFinancialModelQuery` in
 * `src/hooks/useFinancialModel.ts` via React Query.
 */
import type { FinancialModel } from "@/types/financial";

export class ErpNotConfiguredError extends Error {
  constructor() {
    super("لم يتم ربط أي نظام ERP بعد. الرجاء رفع ملف الإكسل يدويًا أو إعداد نقطة اتصال ERP.");
    this.name = "ErpNotConfiguredError";
  }
}

export interface ErpConnectionConfig {
  baseUrl: string;
  apiKey: string;
}

let erpConfig: ErpConnectionConfig | null = null;

export function configureErp(config: ErpConnectionConfig) {
  erpConfig = config;
}

export function isErpConfigured(): boolean {
  return erpConfig !== null;
}

/**
 * Fetch a `FinancialModel` from a connected ERP system. Not implemented
 * today — Asl Burger's model is Excel-driven — but the signature and error
 * contract are stable so a real backend call can be dropped in later without
 * changing any caller.
 */
export async function fetchFromErp(): Promise<FinancialModel> {
  if (!erpConfig) throw new ErpNotConfiguredError();
  const res = await fetch(`${erpConfig.baseUrl}/financial-model`, {
    headers: { Authorization: `Bearer ${erpConfig.apiKey}` },
  });
  if (!res.ok) throw new Error(`فشل الاتصال بنظام ERP: ${res.status}`);
  return (await res.json()) as FinancialModel;
}
