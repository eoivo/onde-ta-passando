import { NextRequest, NextResponse } from "next/server";

// [FIX C-01] Proxy seguro para Watchmode — chave fica APENAS no servidor
const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY || "";
const WATCHMODE_BASE_URL = "https://api.watchmode.com/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const resolvedParams = await params;
  const watchmodePath = "/" + resolvedParams.path.join("/");
  const searchParams = request.nextUrl.searchParams;

  const queryParams = new URLSearchParams(searchParams.toString());
  queryParams.set("apiKey", WATCHMODE_API_KEY);

  const watchmodeUrl = `${WATCHMODE_BASE_URL}${watchmodePath}/?${queryParams.toString()}`;

  try {
    const response = await fetch(watchmodeUrl, {
      next: { revalidate: 3600 }, // Cache de 1 hora
    });

    if (!response.ok) {
      return NextResponse.json([], { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Watchmode Proxy error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
