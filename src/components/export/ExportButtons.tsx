"use client";

import { FileDown, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportRowsToCsv, exportRowsToXlsx } from "@/lib/exportData";
import { useT } from "@/lib/i18n";

interface ExportButtonsProps {
  rows: Record<string, unknown>[];
  sheetName: string;
  fileName: string;
}

/** Drop-in export toolbar for any tabular module — exports the exact rows
 *  currently shown (including the active scenario/selection) to CSV or
 *  .xlsx, entirely client-side. */
export function ExportButtons({ rows, sheetName, fileName }: ExportButtonsProps) {
  const { t } = useT();
  const disabled = rows.length === 0;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => exportRowsToCsv(rows, fileName)}
        aria-label={t("exportCsv")}
      >
        <FileDown className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">CSV</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => exportRowsToXlsx(rows, sheetName, fileName)}
        aria-label={t("exportXlsx")}
      >
        <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Excel</span>
      </Button>
    </div>
  );
}
