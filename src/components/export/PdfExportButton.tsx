"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

/**
 * PDF export via the browser's native print pipeline. Chosen over a
 * client-side rasterization library (html2canvas/jsPDF) because it renders
 * Arabic RTL text, AG Grid tables, and charts with full fidelity, adds zero
 * bytes to the JS bundle, and lets the browser handle pagination correctly.
 * Pairs with the `@media print` rules in globals.css, which hide navigation
 * chrome and force a light, ink-friendly palette for the printed page.
 */
export function PdfExportButton({ className }: { className?: string }) {
  const { t } = useT();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={`no-print ${className ?? ""}`}
      onClick={() => window.print()}
    >
      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
      {t("exportPdf")}
    </Button>
  );
}
