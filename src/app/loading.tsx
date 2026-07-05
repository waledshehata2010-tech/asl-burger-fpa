import Image from "next/image";
import { Loader2 } from "lucide-react";

/** App Router loading fallback, shown while the route segment streams in. */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-muted-foreground">
      <Image
        src="/brand/asl-burger-mark.png"
        alt="Asl Burger"
        width={56}
        height={56}
        priority
        className="h-14 w-14 animate-pulse rounded-full shadow-lg shadow-primary/20"
      />
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <p className="text-sm">جارٍ تحميل المنصة... / Loading platform...</p>
    </div>
  );
}
