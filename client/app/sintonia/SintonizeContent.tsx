"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ArrowRight, Info, Star, ChevronLeft, ChevronRight, X } from "lucide-react";
import { getMovieDetails, getTvDetails, getMediaKeywords, searchMulti, getMovieRecommendations, getTvRecommendations, getTrending, discoverMovies, discoverTVShows } from "@/services/tmdb-api";
import { sortAndFilterResults } from "@/utils/media-utils";
import { motion, AnimatePresence } from "framer-motion";
import MovieCard from "@/components/MovieCard";
import { useLoadingStore } from "@/store/loading-store";

const GENRE_TRANSLATIONS: Record<string, string> = {
    "Action & Adventure": "Ação e Aventura",
    "Sci-Fi & Fantasy": "Ficção e Fantasia",
    "War & Politics": "Guerra e Política",
    "Kids": "Infantil",
    "News": "Notícias",
    "Reality": "Reality",
    "Soap": "Novela",
    "Talk": "Talk Show",
    "Thriller": "Suspense",
};

const formatGenreName = (name: string) => GENRE_TRANSLATIONS[name] || name;

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
        router.push(`/sintonia?${params.toString()}`, { scroll: false });
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
            <div className="relative min-h-[85vh] flex flex-col items-center justify-center pt-40 pb-20 px-4 overflow-hidden">
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

                    <p className="text-red-500 text-[11px] font-bold uppercase tracking-[0.28em] mb-2">
                        Busca por semelhança
                    </p>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-normal text-white mb-3 tracking-wider uppercase font-bebas drop-shadow-2xl leading-none">
                        Qual obra você já viu e amou?
                    </h1>
                    <p className="text-neutral-400 mb-7 text-sm sm:text-base md:text-lg font-normal max-w-xl mx-auto">
                        Conte o que você já viu e encontre obras parecidas ou com o mesmo clima.
                    </p>

                    <div className="relative group mb-2 max-w-2xl mx-auto">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-red-500 transition-colors z-10 pointer-events-none" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Ex: Crepúsculo, Interestelar, Breaking Bad..."
                            className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-full h-14 pl-13 pr-12 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.07] transition-colors shadow-2xl"
                            style={{ paddingLeft: "3.25rem" }}
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setSearchPage(1); }}
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full transition-colors z-10"
                            >
                                <X className="w-4 h-4 text-neutral-400" />
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
                                className="space-y-4 w-full max-w-2xl mx-auto text-left bg-neutral-950/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-4 sm:p-5 shadow-2xl overflow-hidden mt-3"
                            >
                                <div className="divide-y divide-white/5">
                                    {searchResults.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => selectTarget(item)}
                                            className="flex items-center gap-3.5 p-3 hover:bg-white/5 cursor-pointer transition-colors group rounded-2xl"
                                        >
                                            <div className="w-11 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 bg-neutral-900">
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                                    alt={item.title || item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                                                    {item.title || item.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400 font-medium">
                                                    <span className="bg-white/[0.06] px-2 py-0.5 rounded uppercase tracking-wider text-[9.5px] font-bold text-neutral-300 leading-none">
                                                        {item.media_type === "movie" ? "Filme" : "Série"}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {(item.release_date || item.first_air_date)?.split("-")[0] || "N/A"}
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors flex-shrink-0" />
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
                                className="w-full space-y-8 mt-10"
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
                                            className="cursor-pointer group relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 hover:border-white/25 transition-colors duration-200 shadow-xl"
                                        >
                                            <img
                                                src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                                                alt={item.title || item.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                                                <p className="text-xs text-white font-semibold leading-tight line-clamp-2">
                                                    {item.title || item.name}
                                                </p>
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
    const goToTargetDetails = () => {
        if (!targetMedia) return;
        const id = targetMedia.id || targetId;
        setGlobalLoading(true, targetMedia.title || targetMedia.name);
        router.push(`/${targetType === "tv" ? "serie" : "filme"}/${id}`);
    };
    return (
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-24">
            {loading ? (
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin"></div>
                    <p className="text-neutral-400 font-semibold tracking-widest uppercase text-xs">Buscando obras na mesma sintonia...</p>
                </div>
            ) : (
                <div className="space-y-14">
                    <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-red-600/5 blur-[120px] -mr-56 -mt-56 rounded-full pointer-events-none"></div>

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-7 md:gap-10 relative z-10">
                            <div
                                onClick={goToTargetDetails}
                                role="link"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === "Enter") goToTargetDetails(); }}
                                aria-label={`Ver detalhes de ${targetMedia?.title || targetMedia?.name}`}
                                className="relative w-44 h-64 sm:w-52 sm:h-80 md:w-56 md:h-84 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 flex-shrink-0 cursor-pointer transition-colors duration-200 hover:border-white/30"
                            >
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${targetMedia?.poster_path}`}
                                    alt={targetMedia?.title || targetMedia?.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-grow space-y-5 text-center md:text-left min-w-0 w-full">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                                        <span className="h-7 px-3 rounded-full bg-red-500/10 border border-red-500/25 text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] leading-none inline-flex items-center">
                                            Referência escolhida
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => { setTargetId(""); setTargetMedia(null); setRecommendations([]); setSearchResults([]); setSearchQuery(""); }}
                                            className="h-7 px-3 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] hover:border-white/25 text-neutral-300 hover:text-white transition-colors text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 leading-none cursor-pointer"
                                        >
                                            <ArrowRight className="w-3 h-3 rotate-180" />
                                            <span>Trocar referência</span>
                                        </button>
                                    </div>

                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                                        {targetMedia?.title || targetMedia?.name}
                                    </h1>
                                </div>

                                {/* Gêneros traduzidos + Nota + Ano perfeitamente alinhados */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                    {targetMedia?.genres?.map((g: any) => (
                                        <span
                                            key={g.id}
                                            className="h-7 px-3 rounded-full bg-white/[0.05] border border-white/15 text-white/90 text-xs font-medium leading-none inline-flex items-center justify-center"
                                        >
                                            {formatGenreName(g.name)}
                                        </span>
                                    ))}

                                    {typeof targetMedia?.vote_average === "number" && targetMedia.vote_average > 0 && (
                                        <div className="inline-flex items-center gap-1.5 ml-1 text-sm text-white font-semibold">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span>{targetMedia.vote_average.toFixed(1)}</span>
                                        </div>
                                    )}

                                    {(targetMedia?.release_date || targetMedia?.first_air_date) && (
                                        <span className="text-sm text-neutral-400 ml-1">
                                            • {(targetMedia.release_date || targetMedia.first_air_date).split("-")[0]}
                                        </span>
                                    )}
                                </div>

                                {targetMedia?.overview && (
                                    <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto md:mx-0 line-clamp-3 font-normal">
                                        {targetMedia.overview}
                                    </p>
                                )}

                                {keywords.length > 0 && (
                                    <div className="pt-4 border-t border-white/5 space-y-2.5">
                                        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                                            Elementos de estilo identificados
                                        </p>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
                                            {keywords.slice(0, 6).map((kw) => (
                                                <span
                                                    key={kw.id}
                                                    className="h-6 px-2.5 bg-white/[0.03] border border-white/10 rounded-full text-[11px] font-medium text-neutral-400 leading-none inline-flex items-center"
                                                >
                                                    {kw.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="space-y-1.5">
                            <p className="text-red-500 text-xs font-bold uppercase tracking-[0.28em]">
                                Na mesma sintonia de
                            </p>
                            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-none">
                                {targetMedia?.title || targetMedia?.name}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                            {recommendations.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                >
                                    <MovieCard movie={{ ...item, media_type: targetType }} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Paginação de Recomendações em Pílulas Glass */}
                        {recsTotalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 pt-8 border-t border-white/5">
                                <button
                                    type="button"
                                    disabled={recsPage === 1}
                                    onClick={() => { setRecsPage(p => p - 1); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                                    className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] hover:border-white/25 text-neutral-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Anterior
                                </button>
                                <div className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
                                    <span className="text-white font-bold">{recsPage}</span>
                                    <span>/</span>
                                    <span>{recsTotalPages}</span>
                                </div>
                                <button
                                    type="button"
                                    disabled={recsPage === recsTotalPages}
                                    onClick={() => { setRecsPage(p => p + 1); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                                    className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] hover:border-white/25 text-neutral-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                                >
                                    Próxima <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {recommendations.length === 0 && (
                            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-16 text-center">
                                <Info className="w-10 h-10 text-neutral-600 mx-auto mb-4" />
                                <p className="text-neutral-400 text-base font-medium">Nenhuma recomendação encontrada para esta referência no momento.</p>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}
