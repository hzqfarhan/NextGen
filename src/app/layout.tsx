import type { Metadata, Viewport } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { CoachFAB } from "@/components/layout/CoachFAB";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { GlobalBackground } from "@/components/layout/GlobalBackground";

const inter = { className: "font-sans" };


export const metadata: Metadata = {
  title: "BeU NextGen",
  description: "AI-powered financial companion for youth money habits.",
  openGraph: {
    title: "BeU NextGen",
    description: "Spend smarter, save better, and understand money before it becomes a problem.",
  },
  appleWebApp: {
    title: "BeU NextGen",
    statusBarStyle: "default",
    capable: true,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#DF0059",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground min-h-screen selection:bg-primary/30`}>
        <GlobalBackground />
        <main className="min-h-screen">
          <SplashScreen />
          {children}
        </main>
        <CoachFAB />
        <Navbar />
      </body>
    </html>
  );
}

