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

export function UploadWorkbookDialog() {
  const { model, isUsingSample, uploadStatus, uploadError, loadWorkbookFile, resetToSample } = useFinancialModel();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UploadCloud className="h-4 w-4" />
          رفع ملف الإكسل
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>مصدر البيانات</DialogTitle>
          <DialogDescription>
            الملف المرفوع هو مصدر الحقيقة الوحيد للمنصة — كل المؤشرات والرسومات والتقييم تُعاد حسابها تلقائيًا فور الرفع.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
          <FileSpreadsheet className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{model.meta.sourceFileName ?? "لا يوجد ملف"}</p>
            <p className="text-xs text-muted-foreground">
              {isUsingSample ? "عينة افتراضية مبنية على البيانات المدققة" : "ملف مرفوع من المستخدم"}
            </p>
          </div>
          {isUsingSample ? <Badge variant="secondary">عينة</Badge> : <Badge variant="success">مباشر</Badge>}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) await loadWorkbookFile(file);
            e.target.value = "";
          }}
        />

        {uploadStatus === "error" && (
          <p className="rounded-md border border-danger/30 bg-danger/10 p-2 text-xs text-danger">{uploadError}</p>
        )}
        {uploadStatus === "success" && uploadError && (
          <p className="rounded-md border border-warning/30 bg-warning/10 p-2 text-xs text-warning">{uploadError}</p>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" size="sm" onClick={resetToSample} disabled={isUsingSample}>
            <RotateCcw className="h-4 w-4" />
            الرجوع للعينة الافتراضية
          </Button>
          <Button size="sm" onClick={() => inputRef.current?.click()} disabled={uploadStatus === "parsing"}>
            <UploadCloud className="h-4 w-4" />
            {uploadStatus === "parsing" ? "جارٍ القراءة..." : "اختيار ملف .xlsx"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
