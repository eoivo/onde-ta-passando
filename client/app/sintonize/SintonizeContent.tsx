"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Sparkles, Filter, ArrowRight, Film, Tv, Info, Star, ChevronLeft, ChevronRight, X } from "lucide-react";
import { getMovieDetails, getTvDetails, getMediaKeywords, searchMulti, getMovieRecommendations, getTvRecommendations, getTrending, discoverMovies, discoverTVShows } from "@/services/tmdb-api";
import { sortAndFilterResults } from "@/utils/media-utils";
import { motion, AnimatePresence } from "framer-motion";
import MovieCard from "@/components/MovieCard";
import { useLoadingStore } from "@/store/loading-store";

export default function SintonizeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { setLoading: setGlobalLoading } = useLoadingStore();

    const [targetId, setTargetId] = useState(searchParams?.get("id") || "");
    const [targetType, setTargetType] = useState(searchParams?.get("type") || "movie");
    const [targetMedia, setTargetMedia] = useState<any>(null);
    const [keywords, setKeywords] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [recsPage, setRecsPage] = useState(1);
    const [recsTotalPages, setRecsTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchPage, setSearchPage] = useState(1);
    const [searchTotalPages, setSearchTotalPages] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const [examples, setExamples] = useState<any[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Reset do estado quando volta para a página sem parâmetros (clique no Header)
    useEffect(() => {
        const id = searchParams?.get("id");
        const type = searchParams?.get("type");

        if (!id) {
            setTargetId("");
            setTargetMedia(null);
            setKeywords([]);
            setRecommendations([]);
            setSearchQuery("");
            setSearchResults([]);
            setRecsPage(1);
        } else {
            setTargetId(id);
            if (type) setTargetType(type);
        }
    }, [searchParams]);

    // Se tiver um ID na URL, carrega o DNA da obra (apenas uma vez para o ID)
    useEffect(() => {
        if (targetId) {
            loadDNA(targetId, targetType as "movie" | "tv");
        }
    }, [targetId]);

    // Busca recomendações quando o ID ou a PÁGINA de recs muda
    useEffect(() => {
        if (targetId) {
            fetchRecs(targetId, targetType as "movie" | "tv", recsPage);
        }
    }, [targetId, targetType, recsPage]);

    async function loadDNA(id: string, type: "movie" | "tv") {
        setLoading(true);
        try {
            const [details, tags] = await Promise.all([
                type === "movie" ? getMovieDetails(id) : getTvDetails(id),
                getMediaKeywords(id, type)
            ]);

            setTargetMedia(details);
            setKeywords(tags.slice(0, 8));
        } catch (error) {
            console.error("Erro ao carregar DNA:", error);
        } finally {
            setLoading(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    async function fetchRecs(id: string, type: "movie" | "tv", page: number) {
        setLoading(true);
        try {
            // 1. Buscamos duas páginas da API oficial para garantir "gordura" para o filtro de qualidade
            const [recsData, nextRecsData] = await Promise.all([
                type === "movie" ? getMovieRecommendations(id, (page * 2) - 1) : getTvRecommendations(id, (page * 2) - 1),
                type === "movie" ? getMovieRecommendations(id, page * 2) : getTvRecommendations(id, page * 2)
            ]);

            let results = [...(recsData.results || []), ...(nextRecsData.results || [])];
            let rawTotalPages = recsData.total_pages || 1;

            // 2. Filtra por qualidade
            let highQualityResults = sortAndFilterResults(results);

            // 3. BACKFILL: Se após o filtro tivermos menos de 24 itens, usamos o DISCOVER para completar a página
            if (highQualityResults.length < 24) {
                const tags = keywords.length > 0 ? keywords : await getMediaKeywords(id, type);
                const genresIds = targetMedia?.genres?.map((g: any) => g.id).join(",") || "";
                const keywordsIds = tags.slice(0, 5).map((kw: any) => kw.id).join("|");

                const discoverData = type === "movie"
                    ? await discoverMovies({ genreId: genresIds, keywords: keywordsIds, page: page, sortBy: "popularity.desc" })
                    : await discoverTVShows({ genreId: genresIds, keywords: keywordsIds, page: page, sortBy: "popularity.desc" });

                const discoverFiltered = sortAndFilterResults(discoverData.results || []);

                // Adiciona itens do discover que não sejam duplicatas até completar 24
                discoverFiltered.forEach((item: any) => {
                    if (highQualityResults.length < 24 && !highQualityResults.some(r => r.id === item.id) && item.id.toString() !== id) {
                        highQualityResults.push(item);
                    }
                });
            }

            // 4. Garante o corte de exatamente 24 por página
            setRecommendations(highQualityResults.slice(0, 24));

            // Ajustamos o total de páginas para refletir a nova densidade
            setRecsTotalPages(Math.min(Math.max(Math.ceil(rawTotalPages / 2), 10), 10));

        } catch (error) {
            console.error("Erro ao buscar recomendações:", error);
        } finally {
            setLoading(false);
        }
    }

    // Busca de referências com paginação
    useEffect(() => {
        const fetchRefSearch = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const data = await searchMulti(searchQuery, "all", undefined, undefined, searchPage);
                const results = data.results || [];

                // Aplica ordenação e filtro inteligente
                const sorted = sortAndFilterResults(results);

                // Garante exatamente 10 por página (ou o que sobrar)
                setSearchResults(sorted.slice(0, 10));
                setSearchTotalPages(Math.min(data.total_pages || 1, 100)); // Cápula para não exagerar
            } catch (error) {
                console.error("Erro na busca de referência:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchRefSearch, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, searchPage]);

    const selectTarget = (media: any) => {
        setTargetId(media.id.toString());
        setTargetType(media.media_type);
        setSearchResults([]);
        setSearchQuery("");

        const params = new URLSearchParams();
        params.set("id", media.id.toString());
        params.set("type", media.media_type);
        router.push(`/sintonize?${params.toString()}`, { scroll: false });
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setSearchPage(1);
        searchInputRef.current?.focus();
    };

    // Busca exemplos de tendências para inspiração
    useEffect(() => {
        if (!targetId && examples.length === 0) {
            getTrending("all", "week").then(res => {
                setExamples(res.slice(0, 12));
            });
        }
    }, [targetId, examples.length]);

    // UI Inicial / Busca de Referência
    if (!targetId) {
        return (
            <div className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-20 px-4 overflow-hidden">
                {/* Background Wall */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/backgroung.jpg"
                        alt="Background Wall"
                        fill
                        className="object-cover"
                        priority
                        quality={90}
                    />
                    {/* Dark Overlays & Strong Blur */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-5xl text-center relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mb-6 text-sm font-bold tracking-widest uppercase backdrop-blur-md">
                        <Sparkles className="w-4 h-4" />
                        Sintonize seu Gosto
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase font-bebas drop-shadow-2xl">
                        Qual obra você <span className="text-red-600 italic">amou?</span>
                    </h1>
                    <p className="text-white/60 mb-10 text-lg md:text-xl font-light drop-shadow-lg">
                        Digite o nome de uma obra e selecione como sua referência de estilo.
                    </p>

                    <div className="relative group mb-16 max-w-3xl mx-auto shadow-2xl">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/30 group-focus-within:text-red-500 transition-colors" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Ex: Crepúsculo, Interestelar, Breaking Bad..."
                            className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl py-6 pl-16 pr-16 text-xl text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xl"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setSearchPage(1); }}
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-white/40" />
                            </button>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {isSearching ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex justify-center py-20"
                            >
                                <div className="flex gap-1.5">
                                    {[0, 1, 2].map((i) => (
                                        <span key={i} className="w-2 h-2 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                            </motion.div>
                        ) : searchResults.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6 w-full max-w-3xl mx-auto text-left bg-gray-950/60 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-6 shadow-2xl overflow-hidden"
                            >
                                <div className="divide-y divide-white/5">
                                    {searchResults.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => selectTarget(item)}
                                            className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-all group first:rounded-t-2xl last:rounded-b-2xl"
                                        >
                                            <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-red-500/50 transition-colors">
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                                    alt={item.title || item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="text-white font-bold group-hover:text-red-500 transition-colors">
                                                    {item.title || item.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
                                                    <span className="bg-white/5 px-2 py-0.5 rounded uppercase tracking-wider text-[9px] font-black text-red-500/80">
                                                        {item.media_type === "movie" ? "Filme" : "Série"}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {(item.release_date || item.first_air_date)?.split("-")[0] || "N/A"}
                                                    </span>
                                                </div>
                                            </div>
                                            <Sparkles className="w-5 h-5 text-white/10 group-hover:text-red-500 group-hover:animate-pulse transition-all" />
                                        </div>
                                    ))}
                                </div>

                                {/* Paginação da Busca */}
                                {searchTotalPages > 1 && (
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5 text-sm">
                                        <button
                                            disabled={searchPage === 1}
                                            onClick={() => setSearchPage(p => p - 1)}
                                            className="flex items-center gap-2 text-white/40 hover:text-white disabled:opacity-0 transition-colors px-4 py-2"
                                        >
                                            <ChevronLeft className="w-4 h-4" /> Anterior
                                        </button>
                                        <span className="text-white/20 font-mono tracking-tighter">Página {searchPage} de {searchTotalPages}</span>
                                        <button
                                            disabled={searchPage === searchTotalPages}
                                            onClick={() => setSearchPage(p => p + 1)}
                                            className="flex items-center gap-2 text-white/40 hover:text-white disabled:opacity-0 transition-colors px-4 py-2"
                                        >
                                            Próxima <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ) : !searchQuery && examples.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-full space-y-8"
                            >
                                <div className="flex items-center justify-center gap-4">
                                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-grow" />
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] px-4 drop-shadow-md">
                                        Obras para te inspirar
                                    </p>
                                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-grow" />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                    {examples.map((item, idx) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => selectTarget(item)}
                                            className="cursor-pointer group relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 hover:border-red-600/50 transition-all duration-500 shadow-xl backdrop-blur-sm"
                                        >
                                            <img
                                                src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                                                alt={item.title || item.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                            />
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent h-24 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-end p-3">
                                                <p className="text-[10px] text-white font-bold leading-tight line-clamp-2 uppercase tracking-tighter">
                                                    {item.title || item.name}
                                                </p>
                                            </div>
                                            <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100 border border-white/10">
                                                <Sparkles className="w-4 h-4 text-red-500" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        {!searchResults.length && searchQuery.length >= 2 && !isSearching && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-white/20 italic bg-black/20 backdrop-blur-md rounded-3xl border border-white/5">
                                Nenhuma obra encontrada com este nome.
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        );
    }

    // Página de Resultados do DNA
    return (
        <div className="max-w-7xl mx-auto px-4 py-32">
            {loading ? (
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin"></div>
                    <p className="text-red-500 font-bold tracking-widest uppercase text-xs">Mapeando DNA...</p>
                </div>
            ) : (
                <div className="space-y-16">
                    <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] -mr-64 -mt-64 rounded-full"></div>

                        <div className="flex flex-col md:flex-row gap-10 relative z-10">
                            <div className="w-48 h-72 md:w-64 md:h-96 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 flex-shrink-0">
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${targetMedia?.poster_path}`}
                                    alt={targetMedia?.title || targetMedia?.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-grow space-y-8">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-[9px] font-black uppercase text-red-500 tracking-[0.4em] bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">Referência Original</span>
                                        <button
                                            onClick={() => { setTargetId(""); setTargetMedia(null); setRecommendations([]); setSearchResults([]); setSearchQuery(""); }}
                                            className="text-white/30 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group"
                                        >
                                            <ArrowRight className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform" /> Trocar Referência
                                        </button>
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-black text-white leading-[0.9] tracking-tighter">
                                        {targetMedia?.title || targetMedia?.name}
                                    </h1>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Filter className="w-3 h-3 text-red-500" />
                                        Sintonizado pelo Estilo:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {keywords.map((kw) => (
                                            <span
                                                key={kw.id}
                                                className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white/60 hover:text-white hover:bg-red-600/20 hover:border-red-500/30 transition-all cursor-default"
                                            >
                                                {kw.name}
                                            </span>
                                        ))}
                                        {targetMedia?.genres?.map((g: any) => (
                                            <span key={g.id} className="px-4 py-1.5 bg-red-600 text-white rounded-full text-xs font-black uppercase tracking-tighter">
                                                {g.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 flex flex-col md:flex-row md:items-center gap-6 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full border border-yellow-500/30 bg-yellow-500/5">
                                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black text-white leading-none">{targetMedia?.vote_average?.toFixed(1)}</span>
                                            <span className="text-[10px] uppercase text-white/30 font-bold tracking-tighter">Avaliação</span>
                                        </div>
                                    </div>
                                    <p className="text-white/40 text-sm leading-relaxed max-w-xl line-clamp-3 italic">
                                        {targetMedia?.overview}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-12">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl md:text-4xl font-black text-white flex items-center gap-4 tracking-tighter">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-600/20">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                Obras na <span className="text-red-600 italic">mesma sintonize:</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                            {recommendations.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover-trigger"
                                >
                                    <MovieCard movie={{ ...item, media_type: targetType }} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Paginação de Recomendações */}
                        {recsTotalPages > 1 && (
                            <div className="flex items-center justify-center gap-8 pt-12 border-t border-white/5">
                                <button
                                    disabled={recsPage === 1}
                                    onClick={() => { setRecsPage(p => p - 1); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                                    className="flex items-center gap-2 text-white/40 hover:text-white disabled:opacity-0 transition-all font-bold group"
                                >
                                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Anterior
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 flex items-center justify-center bg-red-600 rounded-lg text-white font-black">{recsPage}</span>
                                    <span className="text-white/20 font-bold">de</span>
                                    <span className="text-white/40 font-bold">{recsTotalPages}</span>
                                </div>
                                <button
                                    disabled={recsPage === recsTotalPages}
                                    onClick={() => { setRecsPage(p => p + 1); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                                    className="flex items-center gap-2 text-white/40 hover:text-white disabled:opacity-0 transition-all font-bold group"
                                >
                                    Próxima <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}
                        {recommendations.length === 0 && (
                            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-32 text-center">
                                <Info className="w-16 h-16 text-white/5 mx-auto mb-6" />
                                <p className="text-white/30 text-xl font-medium tracking-tight">O DNA desta obra é único, sintonizando novas recomendações...</p>
                            </div>
                        )}
                    </section>

                    <section className="pt-20 border-t border-white/5 text-center pb-20">
                        <p className="text-white/20 text-[10px] uppercase tracking-[0.4em] font-black">
                            Não era o que você buscava?
                            <button
                                onClick={() => { setTargetId(""); setTargetMedia(null); setSearchQuery(""); }}
                                className="ml-4 text-red-600 hover:text-red-500 underline underline-offset-8 decoration-red-600/30 transition-all font-black"
                            >
                                TESTAR OUTRA VIBE
                            </button>
                        </p>
                    </section>
                </div>
            )}
        </div>
    );
}
