import type { Metadata } from "next";
import { JetBrains_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SupabaseProvider } from "@/components/SupabaseProvider";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-tech",
});

export const metadata: Metadata = {
  title: "Pokédex PWA",
  description: "Pokédex futurista com reconhecimento por câmera",
  manifest: "/manifest.json",
  themeColor: "#8B0000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pokédex",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${jetbrainsMono.variable} ${orbitron.variable}`}>
      <body>
        <ErrorBoundary>
          <SupabaseProvider>
            <ServiceWorkerRegistration />
            <PWAInstallBanner />
            {children}
          </SupabaseProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
