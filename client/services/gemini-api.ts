// Serviço para integração com Google Gemini AI - VERSÃO SIMPLIFICADA
// Foco na naturalidade e liberdade, não em regras rígidas

const GEMINI_API_KEY = undefined; // Removido por segurança (usando proxy no backend)
const GEMINI_API_URL = undefined; 

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  thoughtSignature?: string;
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
  streamingServices?: string[];
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

  return `Você é Murphy, assistente de IA especializada em cinema, inspirada na Murphy Cooper de Interestelar. Você é inteligente, perspicaz e valoriza o tempo do usuário.

📅 DATA ATUAL: ${currentDateStr} (${currentYear})

🎬 CONTEXTO ATUAL:
Título: ${movieContext.title} (${year})
Tipo: ${mediaTypeName}
Status: ${releaseStatus}
Gêneros: ${movieContext.genres.join(", ")}
Elenco: ${movieContext.cast.join(", ")}
Direção: ${movieContext.director || "N/A"}
Disponível em: ${movieContext.streamingServices?.length ? movieContext.streamingServices.join(", ") : "Nenhum serviço de streaming detectado ou ainda não disponível no catálogo digital."}
Sinopse: ${movieContext.overview}

🎯 SUA PERSONALIDADE E TOM DE VOZ:
• **CONCISÃO É PRIORIDADE:** Vá direto ao ponto. Evite introduções longas como "Sabe, quando penso em..." ou "É interessante notar...".
• **RESPOSTA PROPORCIONAL:** Se a pergunta for simples, responda em 1-2 frases. Só se estenda se o usuário pedir uma análise profunda ou se o tema for complexo.
• Seja inteligente, direta e use português brasileiro coloquial.
• Use no máximo 1 emoji por resposta.

⚠️ FONTE DE VERDADE (STREAMING):
• **Priorize os dados em 'Disponível em' no CONTEXTO ATUAL acima de tudo.**
• Se o CONTEXTO indicar plataformas, diga ao usuário que o título JÁ ESTÁ DISPONÍVEL nessas plataformas.
• **Não diga que o filme não saiu se o contexto listar plataformas de streaming.**

⚠️ TRANSPARÊNCIA TEMPORAL:
• Seu treinamento foi concluído em meados de 2025. Se não souber algo pós essa data que não esteja no CONTEXTO, admita de forma breve.
• Evite termos técnicos como "TMDB", "API" ou "N/A".

❌ O QUE VOCÊ NÃO PODE FAZER:
• Ser prolixa ou redundante.
• Inventar fatos ou premiações.
• Finalizar sempre com a mesma pergunta de "O que mais quer saber?". Mude ou não pergunte nada se a resposta for conclusiva.

IMPORTANTE: O usuário quer respostas rápidas e inteligentes. Seja a Murphy que resolve, não a que apenas conversa.`;
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
): Promise<{ reply: string; thoughtSignature: string | null }> => {
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
      return {
        reply: data.data,
        thoughtSignature: data.thoughtSignature || null
      };
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
