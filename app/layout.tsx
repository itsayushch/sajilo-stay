import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { AppLanguageProvider, LanguageSwitcher } from "@/components/app-language";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sajilo Stay",
  description: "An offline homestay helper for Darjeeling garden villages.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#15506d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><AppLanguageProvider><LanguageSwitcher />{children}</AppLanguageProvider><ServiceWorkerRegistration /></body>
    </html>
  );
}
