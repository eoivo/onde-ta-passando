/**
 * Utilitário para filtragem e ordenação inteligente de mídias (filmes e séries).
 * Prioriza qualidade: popularidade, existência de sinopse e avaliações.
 * Filtra títulos obscuros/antigos sem dados básicos.
 */
export function sortAndFilterResults(results: any[]) {
    const currentYear = new Date().getFullYear();

    return results
        .filter((item: any) => {
            // 1. Deve ter pelo menos um tipo de imagem
            const hasImage = !!(item.poster_path || item.backdrop_path);

            // 2. Verifica se tem sinopse decente
            const hasOverview = !!item.overview && item.overview.length > 10;

            // 3. Meta-dados de data e votos
            const voteCount = item.vote_count || 0;
            const releaseDate = item.release_date || item.first_air_date;
            const itemYear = releaseDate ? parseInt(releaseDate.split("-")[0]) : 0;

            // Critério de Obscuridade: 
            // Ignora se for antigo (> 10 anos) E não tiver votos E não tiver sinopse
            const isObscure = itemYear > 0 && itemYear < (currentYear - 10) && voteCount < 5 && !hasOverview;

            return hasImage && !isObscure;
        })
        .sort((a, b) => {
            // 1. Popularidade base da API
            const popA = a.popularity || 0;
            const popB = b.popularity || 0;

            // 2. Pontuação de Qualidade (Quality Score):
            // - Bonus por ter sinopse (+50%)
            // - Bonus por ter relevância histórica de votos (+20%)
            const scoreA = popA * (a.overview ? 1.5 : 1) * (a.vote_count > 100 ? 1.2 : 1);
            const scoreB = popB * (b.overview ? 1.5 : 1) * (b.vote_count > 100 ? 1.2 : 1);

            return scoreB - scoreA;
        });
}
