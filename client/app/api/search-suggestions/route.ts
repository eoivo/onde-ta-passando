import { NextRequest, NextResponse } from "next/server";
import { searchMulti } from "@/services/tmdb-api";
import { sortAndFilterResults } from "@/utils/media-utils";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { results: [] },
      { status: 400, statusText: "Query parameter is required" }
    );
  }

  try {
    const data = await searchMulti(query);
    const results = data.results || [];

    // Filtra apenas filmes e séries
    const mediaResults = results.filter(
      (item: any) => item.media_type === "movie" || item.media_type === "tv"
    );

    // Aplica ordenação e filtro inteligente de qualidade
    const sortedResults = sortAndFilterResults(mediaResults);

    // Retorna apenas os top 10 para o dropdown
    return NextResponse.json({ results: sortedResults.slice(0, 10) });
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch search suggestions" },
      { status: 500 }
    );
  }
}
