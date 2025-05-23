import type { Metadata } from "next";
import { Geist, Geist_Mono, Tsukimi_Rounded } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import ThirdwebAutoConnect from "@/components/thirdweb-auto-connect";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tsukimiRounded = Tsukimi_Rounded({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-tsukimi-rounded",
});

export const metadata: Metadata = {
  title: "digiDov | Lightweight Nonprofit Crypto",
  description: "The simplest, best way to accept crypto donations.",
  icons: {
    icon: "/favicon-32x32.png",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.web.manifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`}
          async
          defer
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${tsukimiRounded.variable} antialiased`}
      >
        <ThirdwebProvider>
          <ThirdwebAutoConnect />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </ThirdwebProvider>
        <Analytics />
      </body>
    </html>
  );
}
