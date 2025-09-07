import type React from "react";
import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsProvider } from "@/components/settings-context";
import { DynamicColorProvider } from "@/components/dynamic-color-provider";
import { GlobalColorProvider } from "@/components/global-color-provider";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "جمعية أصيل للتنمية الخيرية - لوحة التحكم",
  description:
    "لوحة تحكم شاملة لإدارة أنشطة ومشاريع جمعية أصيل للتنمية الخيرية في فلسطين",
  keywords: "جمعية خيرية، فلسطين، غزة، تنمية، مساعدات، مشاريع",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <GlobalColorProvider>
            <AuthProvider>
              <SettingsProvider>
                <DynamicColorProvider>{children}</DynamicColorProvider>
              </SettingsProvider>
            </AuthProvider>
          </GlobalColorProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
