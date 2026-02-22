// Serviço para integração com Google Gemini AI - VERSÃO SIMPLIFICADA
// Foco na naturalidade e liberdade, não em regras rígidas

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

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
  if (releaseDate > currentDate) {
    releaseStatus = `⏳ AINDA NÃO LANÇADO - Previsão: ${releaseDateStr}`;
  } else if (releaseDate <= currentDate) {
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
• Seja natural e conversacional como uma amiga que ama cinema
• Responda exatamente o que o usuário perguntou (não force outros assuntos)
• Use português brasileiro coloquial
• Seja empática e genuinamente interessada
• Demonstre conhecimento cinematográfico quando relevante
• Use 1-2 emojis por resposta (não exagere)
• SEMPRE considere a data atual ao falar sobre lançamentos e disponibilidade

⚠️ IMPORTANTE SOBRE DATAS E LANÇAMENTOS:
• Se o filme/série ainda não foi lançado: explique quando será lançado
• Se foi lançado recentemente (menos de 3 meses): pode estar em cartaz nos cinemas
• Se foi lançado há mais tempo: provavelmente já está em streaming
• Para informações de streaming sempre mencione que pode mudar e sugira sites como JustWatch
• NUNCA invente onde está disponível - seja honesta sobre limitações de informação em tempo real

❌ O QUE VOCÊ NÃO PODE FAZER:
• Discutir política, religião ou controvérsias não-cinematográficas
• Dar informações pessoais de celebridades além do profissional
• Responder perguntas aleatórias sem conexão com cinema/entretenimento
• Inventar informações sobre onde assistir filmes (seja honesta se não souber)
• Forçar recomendações quando não solicitadas

✅ SEJA LIVRE PARA:
• Conversar naturalmente sobre qualquer aspecto da obra
• Fazer análises técnicas, culturais ou emocionais
• Dar recomendações QUANDO PEDIDAS
• Compartilhar curiosidades e bastidores
• Fazer conexões com outras obras quando fizer sentido
• Adaptar seu nível de resposta ao usuário
• Perguntar detalhes se algo não estiver claro

IMPORTANTE: Responda ao que foi perguntado, não ao que você acha que deveria ser perguntado. Se o usuário quer saber onde assistir, ajude com isso. Se quer análise de personagem, analise. Se quer recomendações, recomende. Seja natural!`;
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

// Função principal - MUITO SIMPLIFICADA
export const sendMessageToGemini = async (
  message: string,
  movieContext: MovieContext,
  conversationHistory: ChatMessage[] = []
): Promise<string> => {
  try {
    const systemPrompt = createSystemPrompt(movieContext);

    // Histórico simples e direto
    const recentHistory = conversationHistory
      .slice(-6)
      .map(
        (msg) => `${msg.role === "user" ? "Usuário" : "Murphy"}: ${msg.content}`
      )
      .join("\n");

    const fullPrompt = `${systemPrompt}

${recentHistory ? `Conversa anterior:\n${recentHistory}\n` : ""}

Usuário: ${message}

Murphy:`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: fullPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 800,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error("Resposta inválida da API");
    }
  } catch (error) {
    console.error("Erro:", error);
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
