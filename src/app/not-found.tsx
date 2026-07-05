import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Compass className="h-7 w-7" />
      </div>
      <div>
        <h1 className="text-lg font-semibold">الصفحة غير موجودة / Page not found</h1>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          الصفحة التي تبحث عنها غير متاحة. / The page you&apos;re looking for isn&apos;t available.
        </p>
      </div>
      <Button asChild size="sm">
        <Link href="/">العودة للرئيسية / Back to home</Link>
      </Button>
    </div>
  );
}
