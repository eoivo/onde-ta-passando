import { searchMulti } from "@/services/tmdb-api"
import SearchResults from "@/components/SearchResults"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q: string; type?: string; genre?: string; year?: string }
}) {
  const query = searchParams.q
  const type = searchParams.type || "all"
  const genre = searchParams.genre
  const year = searchParams.year

  if (!query) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-xl text-gray-400">Digite algo para buscar filmes, séries ou pessoas</p>
      </div>
    )
  }

  const results = await searchMulti(query, type, genre, year)

  return (
    <main className="min-h-screen px-4 md:px-8 py-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Resultados para: {query}</h1>
        <SearchResults results={results} />
      </div>
    </main>
  )
}
