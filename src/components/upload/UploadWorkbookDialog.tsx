"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, RotateCcw, UploadCloud } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFinancialModel } from "@/hooks/useFinancialModel";
import { useT } from "@/lib/i18n";

export function UploadWorkbookDialog() {
  const { model, isUsingSample, uploadStatus, uploadError, loadWorkbookFile, resetToSample } = useFinancialModel();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UploadCloud className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t("uploadButton")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dataSourceTitle")}</DialogTitle>
          <DialogDescription>{t("dataSourceDesc")}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
          <FileSpreadsheet className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{model.meta.sourceFileName ?? t("noFile")}</p>
            <p className="text-xs text-muted-foreground">
              {isUsingSample ? t("sampleDatasetDesc") : t("userUploadedDesc")}
            </p>
          </div>
          {isUsingSample ? <Badge variant="secondary">{t("sampleBadge")}</Badge> : <Badge variant="success">{t("liveBadge")}</Badge>}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          aria-label={t("chooseFile")}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) await loadWorkbookFile(file);
            e.target.value = "";
          }}
        />

        {uploadStatus === "error" && (
          <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-2 text-xs text-danger">
            {uploadError}
          </p>
        )}
        {uploadStatus === "success" && uploadError && (
          <p role="status" className="rounded-md border border-warning/30 bg-warning/10 p-2 text-xs text-warning">
            {uploadError}
          </p>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" size="sm" onClick={resetToSample} disabled={isUsingSample}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t("resetToSample")}
          </Button>
          <Button size="sm" onClick={() => inputRef.current?.click()} disabled={uploadStatus === "parsing"}>
            <UploadCloud className="h-4 w-4" aria-hidden="true" />
            {uploadStatus === "parsing" ? t("parsing") : t("chooseFile")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
