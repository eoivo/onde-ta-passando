import type React from "react";
import type { Metadata } from "next/types";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import LoadingOverlay from "@/components/LoadingOverlay";
import NavigationProvider from "@/providers/NavigationProvider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Onde Tá Passando? - Descubra onde assistir seus filmes e séries",
  description:
    "Encontre facilmente em quais plataformas de streaming seus filmes e séries favoritos estão disponíveis",
  icons: {
    icon: "/favicon.ico",
  },
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-black text-white antialiased flex flex-col min-h-screen`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            <NavigationProvider>
              <LoadingOverlay />
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
              <Toaster theme="dark" position="top-center" richColors />
            </NavigationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
