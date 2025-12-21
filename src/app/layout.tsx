import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import Script from "next/script"; // Add this import
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ConditionalBottomNav from "@/components/layout/BottomNav";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aboki V2",
  icons: { icon: "/abokiicon.svg" },
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
      </head>
      <body className={`min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] font-sans antialiased transition-colors duration-300 ${bricolage.variable}`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <ConditionalBottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}