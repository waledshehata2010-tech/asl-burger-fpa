import type { Metadata } from "next";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "أصل البرجر | منصة التخطيط والتحليل المالي",
  description: "Asl Burger Enterprise FP&A Platform — نمذجة مالية، سيناريوهات، وتقييم مباشر مبني على ملف الإكسل الرسمي.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased bg-background text-foreground">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
