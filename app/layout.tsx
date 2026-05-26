import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-provider";
import { Header } from "@/components/header";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const _ibm_plex_sans = IBM_Plex_Sans({
  subsets: ["latin", "cyrillic-ext"],
  variable: "--font-sans",
});
const _ibm_plex_mono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic-ext"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Femida Forms",
  description:
    "Форми, конкурси та опитування для учасників Discord-серверу GoITeens",
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning className="bg-background">
      <body
        className={`${_ibm_plex_sans.variable} ${_ibm_plex_mono.variable}  antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
            </div>
          </AuthProvider>
          <Toaster />
          {process.env.NODE_ENV === "production" && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  );
}
