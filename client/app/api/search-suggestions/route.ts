import { NextRequest, NextResponse } from "next/server";
import { searchMulti } from "@/services/tmdb-api";

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
    const results = await searchMulti(query);

    const filteredResults = results.filter(
      (item: any) => item.media_type === "movie" || item.media_type === "tv"
    );

    return NextResponse.json({ results: filteredResults });
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch search suggestions" },
      { status: 500 }
    );
  }
}
