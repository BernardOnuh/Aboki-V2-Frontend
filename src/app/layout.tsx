// ============= app/layout.tsx =============
import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import ConditionalBottomNav from "@/components/layout/BottomNav";
import PWAGate from "@/components/PWAGate";
import PWALinkHandler from "@/components/PWALinkHandler";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aboki V2",
  description: "Your secure crypto wallet - Install as an app for the best experience",
  manifest: "/manifest.json",
  icons: { 
    icon: "/abokiicon.svg",
    apple: "/abokiicon.svg"
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6EDFF" },
    { media: "(prefers-color-scheme: dark)", color: "#252525" }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aboki"
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add Monnify SDK */}
        <Script 
          src="https://sdk.monnify.com/plugin/monnify.js"
          strategy="beforeInteractive"
        />
        
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Aboki" />
        
        {/* Prevent browser redirect prompts */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] font-sans antialiased transition-colors duration-300 ${bricolage.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <PWALinkHandler />
            <PWAGate>
              {children}
              <ConditionalBottomNav />
            </PWAGate>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}