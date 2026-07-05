"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** App Router error boundary. Catches render/runtime errors anywhere in the
 *  tree below it and shows a recoverable fallback instead of a blank/crashed
 *  page. Logged to the console for now; swap in a real error-reporting
 *  service (Sentry, etc.) here when one is wired up. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[asl-burger-fpa] unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertOctagon className="h-7 w-7" />
      </div>
      <div>
        <h1 className="text-lg font-semibold">حدث خطأ غير متوقع / Something went wrong</h1>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          واجهت المنصة خطأ أثناء العرض. يمكنك إعادة المحاولة أو تحديث الصفحة.
          <br />
          The platform hit an error while rendering. You can retry or refresh the page.
        </p>
      </div>
      <Button onClick={() => reset()} size="sm">
        <RotateCcw className="h-4 w-4" />
        إعادة المحاولة / Try again
      </Button>
    </div>
  );
}
