import type { Metadata } from "next";
import "./globals.css";
import "@/styles/theme-modern.scss";
import "@/lib/sentry-init";
import { Providers } from "@/components/providers";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "MMDSS - Magnus Recruitment Management System",
  description: "Enterprise staffing operations platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="ops-modern-theme">
        <NextTopLoader
          color="var(--brand-600, #1700ae)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px var(--brand-500, #1700ae), 0 0 5px var(--brand-500, #1700ae)"
        />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
