"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Sparkles, Filter, ArrowRight, Film, Tv, Info, Star, ChevronLeft, ChevronRight, X } from "lucide-react";
import { getMovieDetails, getTvDetails, getMediaKeywords, searchMulti, getMovieRecommendations, getTvRecommendations } from "@/services/tmdb-api";
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
        try {
            const recsData = type === "movie"
                ? await getMovieRecommendations(id, page)
                : await getTvRecommendations(id, page);

            const sortedRecs = sortAndFilterResults(recsData.results || []);
            setRecommendations(sortedRecs);
            setRecsTotalPages(Math.min(recsData.total_pages || 1, 50));
        } catch (error) {
            console.error("Erro ao buscar recomendações:", error);
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

    // UI Inicial / Busca de Referência
    if (!targetId) {
        return (
            <div className="min-h-[90vh] flex flex-col items-center pt-32 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-3xl text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mb-6 text-sm font-bold tracking-widest uppercase">
                        <Sparkles className="w-4 h-4" />
                        Sintonize seu Gosto
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                        Qual obra você <span className="text-red-600 italic">amou?</span>
                    </h1>
                    <p className="text-white/40 mb-12 text-lg">
                        Digite o nome de uma obra e selecione como sua referência de estilo.
                    </p>

                    <div className="relative group mb-12">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/30 group-focus-within:text-red-500 transition-colors" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Ex: Crepúsculo, Interestelar, Breaking Bad..."
                            className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-16 text-xl text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xl"
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
                                className="flex justify-center py-10"
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
                                className="space-y-6 w-full text-left bg-gray-950/40 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 shadow-2xl overflow-hidden"
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
                        ) : searchQuery.length >= 2 && !isSearching && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-white/20 italic">
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
