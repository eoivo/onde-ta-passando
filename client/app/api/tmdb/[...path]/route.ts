import { NextRequest, NextResponse } from "next/server";

// [FIX C-01] Proxy seguro para TMDB — chave fica APENAS no servidor
// A chave é um Bearer Token JWT, enviado no header Authorization
const TMDB_BEARER_TOKEN = process.env.TMDB_API_KEY || "";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const resolvedParams = await params;
  const tmdbPath = "/" + resolvedParams.path.join("/");
  const searchParams = request.nextUrl.searchParams;

  const queryParams = new URLSearchParams(searchParams.toString());

  if (!queryParams.has("language")) {
    queryParams.set("language", "pt-BR");
  }

  const tmdbUrl = `${TMDB_BASE_URL}${tmdbPath}?${queryParams.toString()}`;

  try {
    const response = await fetch(tmdbUrl, {
      next: { revalidate: 3600 },
      headers: {
        "Accept": "application/json",
        // Bearer Token v4 — nunca sai do servidor
        "Authorization": `Bearer ${TMDB_BEARER_TOKEN}`,
      },
    });

    if (response.status === 404) {
      // 404 é normal no TMDB — significa que o recurso não tem dados (ex: filme sem trailer)
      // Retornar 200 com resultados vazios para não poluir o console do browser
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro ao buscar dados do TMDB", results: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("TMDB Proxy error:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar dados", results: [] },
      { status: 500 }
    );
  }
}
