import type { Metadata, Viewport } from "next";
import { QueryProvider } from "@/providers/query-provider";
import { LocaleHtmlSync } from "@/components/layouts/LocaleHtmlSync";
import "./globals.css";

export const metadata: Metadata = {
  title: "أصل البرجر | منصة التخطيط والتحليل المالي",
  description: "Asl Burger Enterprise FP&A Platform — نمذجة مالية، سيناريوهات، وتقييم مباشر مبني على ملف الإكسل الرسمي.",
};

export const viewport: Viewport = {
  themeColor: "#0b0d12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          تخطي إلى المحتوى الرئيسي / Skip to main content
        </a>
        <LocaleHtmlSync />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
