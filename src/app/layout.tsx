import type { Metadata, Viewport } from "next";
import "./globals.css";
import {Toaster} from "@/components/ui/sonner";
import {ThemeProvider} from "@/components/theme-provider";
import {Providers} from "@/app/providers";
import QueryProvider from "@/providers/QueryProvider";
import NextTopLoader from 'nextjs-toploader';
import { StandaloneGuard } from "@/components/pwa/StandaloneGuard";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "ERP",
  description: "enterprise resource planning",
  manifest: "/manifest.json",
  applicationName: "ERP",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ERP",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`antialiased`}
      >
      <Providers>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextTopLoader shadow="none" color="var(--primary)" showSpinner={false} />
            <StandaloneGuard />
            {children}
            <Toaster
              position={'top-right'}
            />
          </ThemeProvider>
        </QueryProvider>
      </Providers>
      </body>
    </html>
  );
}
