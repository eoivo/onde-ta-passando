"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Tv, User } from "lucide-react";
import MovieCard from "./MovieCard";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLoadingStore } from "@/store/loading-store";

interface SearchResultsProps {
  results: any[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();
  const { setLoading } = useLoadingStore();

  const movies = results.filter((item) => item.media_type === "movie");
  const tvShows = results.filter((item) => item.media_type === "tv");
  const people = results.filter((item) => item.media_type === "person");

  const getActiveResults = () => {
    switch (activeTab) {
      case "movies":
        return movies;
      case "tv":
        return tvShows;
      case "people":
        return people;
      default:
        return results;
    }
  };

  const activeResults = getActiveResults();

  const handlePersonClick = (person: any) => {
    setLoading(true, "pessoa");

    window.scrollTo(0, 0);
  };

  if (results.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-xl text-gray-400">Nenhum resultado encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900">
          <TabsTrigger value="all">Todos ({results.length})</TabsTrigger>
          <TabsTrigger value="movies">
            <Film className="w-4 h-4 mr-1" />
            Filmes ({movies.length})
          </TabsTrigger>
          <TabsTrigger value="tv">
            <Tv className="w-4 h-4 mr-1" />
            Séries ({tvShows.length})
          </TabsTrigger>
          <TabsTrigger value="people">
            <User className="w-4 h-4 mr-1" />
            Pessoas ({people.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {activeResults.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="search-result-item"
                data-search-result
              >
                {item.media_type === "person" ? (
                  <div
                    className="aspect-[2/3] relative rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => handlePersonClick(item)}
                  >
                    {item.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${item.profile_path}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute bottom-0 w-full bg-black/70 p-2">
                      <p className="text-sm font-medium">{item.name}</p>
                    </div>
                  </div>
                ) : (
                  <MovieCard movie={item} />
                )}
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="movies" className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="search-result-item"
                data-search-result
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tv" className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {tvShows.map((show, index) => (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="search-result-item"
                data-search-result
              >
                <MovieCard movie={show} />
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="people" className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {people.map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handlePersonClick(person)}
                className="cursor-pointer search-result-item"
                data-search-result
              >
                <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                  {person.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute bottom-0 w-full bg-black/70 p-2">
                    <p className="text-sm font-medium">{person.name}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
