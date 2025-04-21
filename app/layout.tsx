import type React from "react";
import type { Metadata } from "next/types";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import LoadingOverlay from "@/components/LoadingOverlay";
import NavigationProvider from "@/providers/NavigationProvider";

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
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <NavigationProvider>
            <LoadingOverlay />
            <Header />
            {children}
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
