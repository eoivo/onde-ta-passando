import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://onde-ta-passando.netlify.app";

export default function robots(): MetadataRoute.Robots {
  const disallowed = [
    "/api/",
    "/perfil",
    "/login",
    "/cadastro",
    "/recuperar-senha",
    "/redefinir-senha",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowed,
      },
      // Libera explicitamente buscadores de IA (GEO / AI Search) para as páginas públicas do catálogo
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
        ],
        allow: "/",
        disallow: disallowed,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
