import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito, Caveat } from "next/font/google";
import "./globals.css";
import { RoomProvider } from "@/context/RoomContext";
import { ChatProvider } from "@/context/ChatContext";
import { APP_CONFIG } from "@/config/app.config";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
  adjustFontFallback: true,
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: true,
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: APP_CONFIG.decoyName,
  description: APP_CONFIG.decoyDescription,
  manifest: "/manifest.json",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_CONFIG.decoyName,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: APP_CONFIG.decoyThemeColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable} ${caveat.variable}`}>
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
      </head>
      <body className="min-h-screen bg-cream font-body text-plum flex justify-center antialiased">
        <RoomProvider>
          <ChatProvider>
            <div className="w-full max-w-[420px] min-h-screen bg-cream shadow-xl relative overflow-x-hidden flex flex-col">
              {children}
            </div>
          </ChatProvider>
        </RoomProvider>
      </body>
    </html>
  );
}
