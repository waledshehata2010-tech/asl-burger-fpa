import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Delta({ value, positiveIsGood = true }: { value: number | null; positiveIsGood?: boolean }) {
  if (value === null || Number.isNaN(value)) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> —
      </span>
    );
  }
  const isGood = positiveIsGood ? value >= 0 : value < 0;
  const Icon = value >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", isGood ? "text-success" : "text-danger")}>
      <Icon className="h-3 w-3" />
      {fmtPct(Math.abs(value))}
    </span>
  );
}
