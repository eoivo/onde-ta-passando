export function sortAndFilterResults(results: any[]) {
    const currentYear = new Date().getFullYear();

    return results
        .filter((item: any) => {
            // 1. REQUISITO MÍNIMO VISUAL: Deve ter um poster
            if (!item.poster_path) return false;

            // 2. REQUISITO MÍNIMO DE INFORMAÇÃO: Sinopse
            const hasOverview = !!item.overview && item.overview.trim().length > 15;
            const releaseDate = item.release_date || item.first_air_date;
            const itemYear = releaseDate ? parseInt(releaseDate.split("-")[0]) : 0;
            const isReleased = itemYear > 0 && itemYear < currentYear;

            // FILTRO RADICAL: Se já foi lançado e NÃO tem sinopse, remove da Home.
            // O usuário não quer ver "caixas vazias" de informação.
            if (isReleased && !hasOverview) return false;

            // Se for lançamento futuro, permitimos sem sinopse apenas se for muito popular (placeholder de marketing)
            if (!isReleased && !hasOverview && (item.popularity || 0) < 5) return false;

            return true;
        })
        .sort((a, b) => {
            const getScore = (item: any) => {
                let score = item.popularity || 0;
                const hasOverview = !!item.overview && item.overview.trim().length > 20;
                const releaseDate = item.release_date || item.first_air_date;
                const year = releaseDate ? parseInt(releaseDate.split("-")[0]) : 0;
                const voteCount = item.vote_count || 0;

                // --- BÔNUS DE QUALIDADE ---
                if (hasOverview) score *= 2; 
                if (item.backdrop_path) score *= 1.2; 
                if (voteCount > 50) score *= 1.3;

                // --- NOVIDADES ---
                if (year >= currentYear) score *= 1.5;

                // Garantia final: Mesmo que passe no filtro, sem sinopse vai pro rabo da fila
                if (!hasOverview) score *= 0.01; 

                return score;
            };

            return getScore(b) - getScore(a);
        });
}
