import type { Metadata, Viewport } from "next";
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
  themeColor: "#3b82f6",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: false,
  maximumScale: 1,
  themeColor: "#3B82F6", // Primary color do tema customizado
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${jetbrainsMono.variable} ${orbitron.variable}`}
    >
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
      </head>
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
