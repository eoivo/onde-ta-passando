import type React from "react";
import type { Metadata } from "next/types";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import LoadingOverlay from "@/components/LoadingOverlay";
import NavigationProvider from "@/providers/NavigationProvider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas"
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://onde-ta-passando.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Onde Tá Passando? - Descubra onde assistir seus filmes e séries",
    template: "%s | Onde Tá Passando?",
  },
  description:
    "Encontre facilmente em quais plataformas de streaming no Brasil seus filmes e séries favoritos estão disponíveis, descubra obras na mesma sintonia e converse com a Murphy AI.",
  keywords: [
    "onde assistir",
    "onde tá passando",
    "streaming brasil",
    "netflix",
    "prime video",
    "max",
    "disney plus",
    "apple tv",
    "filmes",
    "séries",
    "catálogo de streaming",
  ],
  authors: [{ name: "Ivo Fernandes" }],
  creator: "Ivo Fernandes",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Onde Tá Passando?",
    title: "Onde Tá Passando? - Descubra onde assistir filmes e séries",
    description:
      "Descubra em tempo real em quais streamings do Brasil seus filmes e séries favoritos estão disponíveis.",
    images: [
      {
        url: "/images/logos/icon_full_name.png",
        width: 1200,
        height: 630,
        alt: "Onde Tá Passando?",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Onde Tá Passando? - Descubra onde assistir filmes e séries",
    description:
      "Descubra em tempo real em quais streamings do Brasil seus filmes e séries favoritos estão disponíveis.",
    images: ["/images/logos/icon_full_name.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/images/logos/icon.png", type: "image/png" },
    ],
    apple: "/images/logos/icon.png",
    shortcut: "/images/logos/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${bebas.variable} font-sans bg-black text-white antialiased flex flex-col min-h-screen`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            <NavigationProvider>
              <SmoothScroll>
                <LoadingOverlay />
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
                <Toaster
                  position="top-right"
                  richColors
                  closeButton
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#1a1a1a',
                      color: '#fff',
                      border: '1px solid #363636',
                    },
                  }}
                />
              </SmoothScroll>
            </NavigationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
