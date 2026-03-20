// Serviço para integração com Google Gemini AI - VERSÃO SIMPLIFICADA
// Foco na naturalidade e liberdade, não em regras rígidas

const GEMINI_API_KEY = undefined; // Removido por segurança (usando proxy no backend)
const GEMINI_API_URL = undefined; 

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Função helper para determinar status de lançamento
export function getReleaseStatus(releaseDate: string): {
  status: "unreleased" | "recent" | "available" | "catalog";
  description: string;
  daysFromRelease: number;
} {
  const release = new Date(releaseDate);
  const current = new Date();
  const diffTime = current.getTime() - release.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: "unreleased",
      description: `Ainda não lançado - Previsão: ${release.toLocaleDateString(
        "pt-BR"
      )}`,
      daysFromRelease: diffDays,
    };
  } else if (diffDays <= 90) {
    // 3 meses
    return {
      status: "recent",
      description: `Lançamento recente - Disponível desde ${release.toLocaleDateString(
        "pt-BR"
      )}`,
      daysFromRelease: diffDays,
    };
  } else if (diffDays <= 365) {
    // 1 ano
    return {
      status: "available",
      description: `Disponível - Lançado em ${release.toLocaleDateString(
        "pt-BR"
      )}`,
      daysFromRelease: diffDays,
    };
  } else {
    return {
      status: "catalog",
      description: `Catálogo - Lançado em ${release.toLocaleDateString(
        "pt-BR"
      )}`,
      daysFromRelease: diffDays,
    };
  }
}

export interface MovieContext {
  title: string;
  overview: string;
  releaseDate: string;
  genres: string[];
  cast: string[];
  director?: string;
  mediaType: "movie" | "tv";
  rating?: number;
  runtime?: number;
}

// Função simples para criar o prompt do sistema - MUITO MAIS ENXUTA
export function createSystemPrompt(movieContext: MovieContext): string {
  const mediaTypeName = movieContext.mediaType === "movie" ? "filme" : "série";
  const releaseDate = new Date(movieContext.releaseDate);
  const currentDate = new Date();
  const year = releaseDate.getFullYear();

  // Formatar datas para comparação
  const releaseDateStr = releaseDate.toLocaleDateString("pt-BR");
  const currentDateStr = currentDate.toLocaleDateString("pt-BR");
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

  // Determinar status de lançamento
  let releaseStatus = "";
  if (!movieContext.releaseDate || isNaN(releaseDate.getTime())) {
    releaseStatus = "❓ STATUS NÃO ESPECIFICADO NOS DADOS OFICIAIS";
  } else if (releaseDate > currentDate) {
    releaseStatus = `⏳ AINDA NÃO LANÇADO - Previsão: ${releaseDateStr}`;
  } else {
    const monthsAgo =
      (currentDate.getFullYear() - releaseDate.getFullYear()) * 12 +
      (currentDate.getMonth() - releaseDate.getMonth());
    if (monthsAgo < 3) {
      releaseStatus = `🆕 LANÇAMENTO RECENTE - Lançado em: ${releaseDateStr}`;
    } else if (monthsAgo < 12) {
      releaseStatus = `🎬 DISPONÍVEL - Lançado em: ${releaseDateStr}`;
    } else {
      releaseStatus = `📚 CATÁLOGO - Lançado em: ${releaseDateStr}`;
    }
  }

  return `Você é Murphy, assistente de IA especializada em cinema, inspirada na Murphy Cooper de Interestelar. Você é curiosa, inteligente e apaixonada por filmes e séries.

📅 DATA ATUAL: ${currentDateStr} (${currentYear})

🎬 CONTEXTO ATUAL:
Título: ${movieContext.title} (${year})
Tipo: ${mediaTypeName}
Status: ${releaseStatus}
Gêneros: ${movieContext.genres.join(", ")}
Elenco: ${movieContext.cast.join(", ")}
Direção: ${movieContext.director || "N/A"}
Sinopse: ${movieContext.overview}

🎯 SUA PERSONALIDADE:
• Seja natural e conversacional como uma amiga que ama cinema.
• Use português brasileiro coloquial.
• Use 1-2 emojis por resposta (não exagere).

⚠️ TRANSPARÊNCIA TEMPORAL E LIMITAÇÕES:
• **Seu treinamento interno de IA foi concluído em meados de 2025.**
• **A data de hoje no sistema é ${currentDateStr} (${currentYear}).**
• Para informações sobre obras ou fatos pós-Junho de 2025 que não estejam no CONTEXTO ATUAL:
  - Seja honesta e direta: "Olha, como meu treinamento interno foi finalizado em 2025 e essa obra é super recente, eu ainda não tenho essa confirmação oficial por aqui. Como essas notícias mudam muito rápido, vale dar uma olhadinha em portais de notícias para garantir! Mas sobre o que eu tenho aqui do filme, quer saber mais alguma coisa?"
  - **Evite citar termos técnicos como "TMDB", "API" ou "N/A"** para o usuário. Fale de "meus dados" ou "registros oficiais".

⚠️ CINE-INTEGRIDADE (OSCARS):
• As indicações ao Oscar saem em JANEIRO e a cerimônia em FEVEREIRO/MARÇO.
• Se tiver dúvida sobre uma premiação recente, use a transparência acima em vez de chutar.

❌ O QUE VOCÊ NÃO PODE FAZER:
• Inventar fatos ou premiações.
• Usar linguagem técnica de desenvolvedor (TMDB, JSON, Contexto).
• Finalizar apenas com perguntas vagas - tente ser útil com o que você já sabe.

✅ SEJA LIVRE PARA:
• Admitir o limite de tempo: "Eita, essa é novinha! Meus dados param em 2025, então se isso rolou agora em ${currentYear}, eu ainda não fui atualizada com esse fato. Mas ó, o que eu puder te ajudar sobre a trama ou o elenco, é só falar!"
• Focar no que você CONHECE sobre o filme (elenco, diretor, gênero).

IMPORTANTE: A honestidade sobre ser uma IA com data de corte de conhecimento gera MAIS confiança. Seja uma especialista honesta!`;
}

// Função simplificada para validar se está relacionado ao cinema
export function isMessageRelatedToMovie(
  message: string,
  movieContext: MovieContext
): boolean {
  const messageLower = message.toLowerCase();

  // Palavras-chave básicas de cinema
  const cinemaKeywords = [
    "filme",
    "series",
    "cinema",
    "assistir",
    "ver",
    "streaming",
    "netflix",
    "amazon",
    "disney",
    "hbo",
    "paramount",
    "apple tv",
    "ator",
    "atriz",
    "diretor",
    "personagem",
    "cena",
    "enredo",
    "historia",
    "final",
    "temporada",
    "episodio",
    "trailer",
    "onde",
    "quando",
    "como",
    "porque",
    "rating",
    "nota",
    "recomend",
    "suger",
    "indic",
    "similar",
    "parecido",
    "oscar",
    "premio",
    "premia",
    "venceu",
    "ganhou",
    "indica",
  ];

  // Se menciona o título do filme/série
  const titleWords = movieContext.title.toLowerCase().split(" ");
  const mentionsTitle = titleWords.some(
    (word) => word.length > 2 && messageLower.includes(word)
  );

  // Se contém palavras de cinema
  const hasCinemaKeywords = cinemaKeywords.some((keyword) =>
    messageLower.includes(keyword)
  );

  // Se está perguntando sobre streaming/onde assistir
  const streamingPatterns = [
    /onde.*assistir/i,
    /onde.*ver/i,
    /onde.*passa/i,
    /esta.*disponivel/i,
    /tem.*netflix/i,
    /tem.*amazon/i,
    /cinema/i,
    /streaming/i,
    /plataforma/i,
  ];

  const isStreamingQuestion = streamingPatterns.some((pattern) =>
    pattern.test(messageLower)
  );

  return mentionsTitle || hasCinemaKeywords || isStreamingQuestion;
}

// Função principal que agora chama o nosso BACKEND para maior segurança e rate limiting
export const sendMessageToGemini = async (
  message: string,
  movieContext: MovieContext,
  conversationHistory: ChatMessage[] = []
): Promise<string> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    
    const response = await fetch(`${API_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        movieContext,
        conversationHistory
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Se caiu no rate limit ou outro erro do servidor
      throw new Error(data.message || `Erro no servidor: ${response.status}`);
    }

    if (data.success && data.data) {
      return data.data;
    } else {
      throw new Error("Resposta inválida do servidor");
    }
  } catch (error: any) {
    console.error("Erro na comunicação com a IA:", error);
    
    // Fallback amigável se for erro de rate limit (429)
    if (error.message && error.message.includes("Murphy está um pouco sobrecarregada")) {
        throw error;
    }

    throw new Error(
      "Não consegui processar sua mensagem no momento. Tente novamente!"
    );
  }
};

// Mensagem de boas-vindas simplificada
export async function generateWelcomeMessage(
  movieContext: MovieContext,
  userName?: string
): Promise<string> {
  const greeting = userName ? `Oi, ${userName}!` : "Oi!";

  // Extrair ano com validação para evitar NaN
  let year = "";
  if (movieContext.releaseDate) {
    const releaseYear = new Date(movieContext.releaseDate).getFullYear();
    if (!isNaN(releaseYear)) {
      year = ` (${releaseYear})`;
    }
  }

  const mediaType = movieContext.mediaType === "movie" ? "filme" : "série";

  return `${greeting} 🎬 Murphy aqui! Vejo que você escolheu "${movieContext.title}"${year} - ótima escolha! Estou aqui para conversar sobre qualquer coisa desse ${mediaType}. O que você gostaria de saber?`;
}

// Tópicos sugeridos mais simples e diretos
export function generateSuggestedTopics(movieContext: MovieContext): string[] {
  const topics = [
    "💭 Sua opinião sobre o filme",
    "🎭 Personagens favoritos",
    "🎬 Cenas marcantes",
    "📍 Onde assistir",
    "🎯 Filmes similares",
    "⭐ Sua nota para o filme",
  ];

  if (movieContext.mediaType === "tv") {
    topics.push("📺 Temporadas favoritas");
    topics.push("🔮 Teorias e especulações");
  }

  return topics.slice(0, 6);
}
