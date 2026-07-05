import type { Metadata, Viewport } from "next";
import { Rubik, Cairo } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { LocaleHtmlSync } from "@/components/layouts/LocaleHtmlSync";
import "./globals.css";

// Brand typography, matching aslalburger.sa: Rubik for Latin text/numbers
// (the main site's own headline font) paired with Cairo for Arabic — a
// geometric, bold-weight Arabic face that pairs naturally with Rubik and
// (unlike the previous font stack) is actually loaded as a webfont rather
// than just named and left to fall back to whatever the OS has installed.
const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-rubik",
  display: "swap",
});
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "أصل البرجر | منصة التخطيط والتحليل المالي",
  description: "Asl Burger Enterprise FP&A Platform — نمذجة مالية، سيناريوهات، وتقييم مباشر مبني على ملف الإكسل الرسمي.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
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
      <body className={`${rubik.variable} ${cairo.variable} antialiased bg-background text-foreground`}>
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
