// Serviço para integração com Google Gemini AI
// Focado em conversas sobre títulos específicos de filmes e séries - VERSÃO APRIMORADA

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
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
  imdbId?: string;
  posterPath?: string;
}

// Função para normalizar texto (remove acentos e erros ortográficos comuns)
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\s]/g, " ") // Remove pontuação
    .replace(/\s+/g, " ") // Remove espaços duplos
    .trim();
}

// Dicionário de correções ortográficas comuns
const orthographicCorrections: Record<string, string[]> = {
  // Recomendações
  recomendacao: [
    "recomendacao",
    "recomendasao",
    "recomendassao",
    "recomendaçao",
  ],
  recomendar: ["recomenda", "recomenda", "recomande", "recomende"],
  sugestao: ["sugestao", "sujesao", "suguestao", "sugestaao"],
  sugerir: ["sujerir", "suguerir", "sugerrir"],
  indicacao: ["indikacao", "indicasao", "indicassao"],

  // Palavras comuns
  filme: ["firme", "filmi", "filme"],
  serie: ["seire", "cerie", "seri", "seerie"],
  assistir: ["acistir", "asistir", "acistir", "assistr"],
  similar: ["simila", "cimilar", "simillar"],
  parecido: ["parrecido", "paresido", "pareçido"],

  // Perguntas comuns
  qual: ["kual", "qua", "quall"],
  melhor: ["melor", "mehlor", "melhorr"],
  porque: ["pq", "pk", "porq", "por que", "poque"],
  voce: ["vc", "você", "vcs", "vose"],

  // Expressões
  "o que": ["oque", "oq", "oqe"],
  "por favor": ["pfv", "pf", "por favo"],
  obrigado: ["obg", "obrigad", "brigado"],
};

// Função para corrigir erros ortográficos básicos
export function correctCommonMistakes(text: string): string {
  let correctedText = text.toLowerCase();

  Object.entries(orthographicCorrections).forEach(([correct, mistakes]) => {
    mistakes.forEach((mistake) => {
      const regex = new RegExp(`\\b${mistake}\\b`, "gi");
      correctedText = correctedText.replace(regex, correct);
    });
  });

  return correctedText;
}

// Função aprimorada para detectar pedidos de recomendação
export function isRecommendationRequest(message: string): boolean {
  // Primeiro, corrige erros ortográficos comuns
  const correctedMessage = correctCommonMistakes(message);
  const normalizedMessage = normalizeText(correctedMessage);

  // Detecta tópicos sugeridos (começam com emoji + palavra-chave) - NÃO são recomendações
  const suggestedTopicPatterns = [
    /^[😢💭🎭🎬🎵🎨🎯🤔💡⭐🏆👥🔍😂😱💕🚀🧙‍♂️📚]/,
    /^(momentos?|cenas?|performance|estilo|trilha|visual|final|personag)/i,
  ];

  const isSuggestedTopic = suggestedTopicPatterns.some((pattern) =>
    pattern.test(message.trim())
  );

  if (isSuggestedTopic) return false;

  // Frases que indicam perguntas sobre recomendações já feitas (NÃO são novos pedidos)
  const followUpPhrases = [
    "qual escolher",
    "qual voce escolheria",
    "qual recomenda mais",
    "qual dessas",
    "qual delas",
    "entre essas",
    "entre elas",
    "voce escolhesse",
    "tivesse que escolher",
    "fosse escolher",
    "qual seria",
    "qual prefere",
    "qual indica mais",
    "melhor dessas",
    "melhor delas",
    "principal dessas",
    "mais importante",
    "prioridade",
    "primeiro",
  ];

  const isFollowUp = followUpPhrases.some((phrase) =>
    normalizedMessage.includes(normalizeText(phrase))
  );

  if (isFollowUp) return false;

  // Padrões expandidos para recomendações
  const recommendationPatterns = [
    // Padrões diretos
    /\b(recomend[ae]?[rs]?|suger[ior]?|indic[ae]?[rs]?)\b/i,
    /\b(similar|parecid[oa]s?|semelh[ae]nt[ei]s?)\b/i,
    /\b(outros?|outras?)\s+(filmes?|series?|obras?|titulos?)\b/i,
    /\b(mais)\s+(filmes?|series?|obras?|titulos?)\s+(como|parecid|similar)/i, // Mais específico
    /\b(que|o\s*que)\s+(assistir|ver|assisto)\b/i,
    /\b(proxim[oa]s?)\s+(filme|serie)\b/i,
    /\b(tem|existe|conhece|sabe)\s+(algum|outro|mais)/i,
    /\b(algo|coisa)\s+(assim|parecid[oa]|similar)\b/i,
    /\b(mesmo|mesma)\s+(linha|vibe|estilo|genero|tipo)\b/i,
    /\b(nessa|nesse)\s+(linha|vibe|pegada|estilo)\b/i,

    // Padrões com "como" ou "tipo"
    /\b(como|igual|tipo)\s+(ess[ea]|est[ea]|o)\b/i,
    /\b(no\s+estilo|do\s+tipo)\s+(de|da)?\b/i,

    // Expressões coloquiais brasileiras
    /\b(que\s+)?(mais\s+)?algum[ae]?\s+(coisa|filme|serie)/i,
    /\b(conhece|sabe)\s+(de\s+)?outros?\b/i,
    /\b(tem\s+)?(mais\s+)?algum[ae]?\s+(ai|aí)\b/i,
    /\b(qual|que)\s+(outros?|outras?)\b/i,
  ];

  // Verifica se algum padrão corresponde
  const hasPattern = recommendationPatterns.some((pattern) =>
    pattern.test(normalizedMessage)
  );

  // Palavras-chave expandidas (incluindo erros comuns) - removido "mais" para evitar falsos positivos
  const keywordVariations = [
    "recomend",
    "suger",
    "indic",
    "similar",
    "parecid",
    "semelh",
    "mesmo",
    "igual",
    "tipo",
    "estilo",
    "linha",
    "vibe",
    "pegada",
    "outros",
    "outras",
    "algum",
    "alguma",
    "conhece",
    "sabe",
    "assistir",
    "ver",
    "proximo",
    "proxima",
    "depois",
    "seguir",
  ];

  const hasKeywords = keywordVariations.some((keyword) =>
    normalizedMessage.includes(keyword)
  );

  return hasPattern || hasKeywords;
}

// Função para preprocessar a mensagem antes de enviar para o Gemini
export function preprocessRecommendationMessage(
  message: string,
  movieContext: MovieContext
): string {
  if (isRecommendationRequest(message)) {
    return `🎯 PEDIDO DE RECOMENDAÇÃO DETECTADO: O usuário está pedindo recomendações de títulos similares a "${movieContext.title}". 

MENSAGEM ORIGINAL: "${message}"

⚠️ INSTRUÇÃO CRÍTICA: Responda OBRIGATORIAMENTE com uma lista de 3-5 títulos específicos similares, explicando brevemente por que são parecidos. NÃO redirecione para discussões sobre o título atual. O usuário quer conhecer OUTRAS obras. Use o formato especificado no prompt do sistema.`;
  }
  return message;
}

// Função para criar o prompt do sistema com contexto do filme - VERSÃO SUPER APRIMORADA
export function createSystemPrompt(movieContext: MovieContext): string {
  const mediaTypeName = movieContext.mediaType === "movie" ? "Filme" : "Série";
  const releaseYear = new Date(movieContext.releaseDate).getFullYear();

  return `Você é Murphy, uma assistente de IA especializada em cinema e entretenimento, inspirada na personagem Murphy Cooper do filme Interestelar. Você é curiosa, inteligente, empática e apaixonada por descobrir e discutir todos os aspectos de filmes e séries.

🎬 CONTEXTO ATUAL DA OBRA:
━━━━━━━━━━━━━━━━━━━━━━
📺 Título: ${movieContext.title}
🎭 Tipo: ${mediaTypeName}
📅 Ano: ${releaseYear}
🎪 Gêneros: ${movieContext.genres.join(", ")}
⭐ Avaliação: ${movieContext.rating ? `${movieContext.rating}/10` : "N/A"}
🎬 Direção: ${movieContext.director || "N/A"}
👥 Elenco: ${movieContext.cast.slice(0, 5).join(", ")}${
    movieContext.cast.length > 5 ? "..." : ""
  }
📖 Sinopse: ${movieContext.overview}
${movieContext.runtime ? `⏱️ Duração: ${movieContext.runtime} minutos` : ""}

🎯 SUAS CAPACIDADES E PERSONALIDADE:
━━━━━━━━━━━━━━━━━━━━━━
• **COMPREENSÃO FLEXÍVEL**: Entenda mensagens mesmo com erros ortográficos, gírias, abreviações (ex: "vc", "pq", "oq", "pfv")
• **INTERPRETAÇÃO CONTEXTUAL**: Reconheça intenções mesmo quando mal formuladas
• **COMUNICAÇÃO NATURAL**: Use linguagem brasileira, incluindo expressões coloquiais quando apropriado
• **CONHECIMENTO CINEMATOGRÁFICO**: Demonstre expertise em cinema, incluindo referências, análises técnicas e culturais
• **EMPATIA**: Seja calorosa e genuinamente interessada nas opiniões do usuário

🎯 INSTRUÇÕES PRINCIPAIS:
━━━━━━━━━━━━━━━━━━━━━━

1. **RECOMENDAÇÕES (PRIORIDADE MÁXIMA):**
   Quando detectar "🎯 PEDIDO DE RECOMENDAÇÃO DETECTADO":
   ✅ SEMPRE responda com 3-5 títulos específicos e REAIS
   ✅ Use o formato exato abaixo
   ✅ Explique brevemente a similaridade (1-2 frases por título)
   ❌ NUNCA redirecione para o título atual
   ❌ NUNCA use frases evasivas como "vale revisitar"

   **FORMATO OBRIGATÓRIO:**
   "Perfeito! Se você curtiu [aspecto específico] de '${
     movieContext.title
   }', tenho algumas recomendações incríveis:

   🎬 **[Título Exato]** - [Explicação clara da similaridade]
   🎬 **[Título Exato]** - [Explicação clara da similaridade]
   🎬 **[Título Exato]** - [Explicação clara da similaridade]
   🎬 **[Título Exato]** - [Explicação clara da similaridade]
   🎬 **[Título Exato]** - [Explicação clara da similaridade]

   Todas compartilham [elemento comum com o título atual]. Qual dessas despertou sua curiosidade?"

2. **ESCOLHAS ENTRE RECOMENDAÇÕES JÁ FEITAS:**
   Se o usuário perguntar "qual escolher", "qual é melhor", "entre essas":
   ✅ Refira-se às recomendações já mencionadas na conversa
   ✅ Escolha UMA específica e explique o porquê
   ❌ NÃO dê uma lista nova

3. **DISCUSSÕES SOBRE O TÍTULO ATUAL:**
   • Seja detalhada e analítica
   • Discuta aspectos técnicos, narrativos, performances
   • Faça conexões com outros filmes quando relevante
   • Pergunte sobre opiniões específicas do usuário

4. **TÓPICOS SUGERIDOS (MUITO IMPORTANTE):**
   Se a mensagem começar com emoji + palavra-chave (ex: "😢 Momentos mais emocionantes"):
   ✅ SEMPRE trate como discussão sobre o título atual
   ✅ Foque exclusivamente na obra que está sendo visualizada
   ✅ Explore o tópico específico mencionado
   ❌ NUNCA interprete como pedido de recomendação
   ❌ NUNCA sugira outros títulos

5. **INTERPRETAÇÃO DE MENSAGENS:**
   • Entenda abreviações: "vc" = você, "pq" = porque, "oq" = o que
   • Corrija mentalmente erros ortográficos óbvios
   • Interprete gírias e expressões brasileiras
   • Se não entender, peça esclarecimento educadamente

6. **TIPOS DE CONVERSA QUE DOMINA:**
   🎭 Análise de personagens e desenvolvimento
   🎨 Aspectos visuais, cinematografia, direção
   🎵 Trilha sonora e sound design  
   📚 Adaptações de livros/quadrinhos
   🏆 Premiações e reconhecimentos
   🎪 Bastidores e curiosidades
   🔍 Teorias e interpretações
   💫 Impacto cultural e influências
   📊 Comparações com outras obras
   🎬 Sequências, prequelas, universos expandidos

7. **TOM E ESTILO:**
   • Use 1-3 emojis por resposta (não exagere)
   • Seja entusiástica mas não excessiva
   • Adapte o nível técnico ao usuário
   • Use "você" (não "tu"), linguagem brasileira natural
   • Demonstre genuíno interesse pelas opiniões do usuário

🚫 LIMITAÇÕES IMPORTANTES:
━━━━━━━━━━━━━━━━━━━━━━
• NÃO discuta política, religião ou controvérsias não-cinematográficas
• NÃO responda perguntas completamente aleatórias sem conexão com cinema
• NÃO forneça informações pessoais sobre celebridades além do profissional
• NÃO faça spoilers sem avisar claramente antes

🎯 EXEMPLOS DE INTERPRETAÇÃO:
━━━━━━━━━━━━━━━━━━━━━━
Usuário: "oq vc acho do filme?"
Murphy: Entende como "O que você achou do filme?"

Usuário: "tem algum filme paresido?"  
Murphy: Entende como pedido de recomendação, mesmo com erro ortográfico

Usuário: "😢 Momentos mais emocionantes"
Murphy: Entende como tópico de discussão sobre o título atual, não como pedido de recomendação

Usuário: "pq o protagonista fez aquilo?"
Murphy: Entende como "Por que o protagonista fez aquilo?" e analisa a motivação

🌟 LEMBRE-SE: Você é a Murphy que os cinéfilos adorariam conhecer - conhecedora, acessível, empática e sempre disposta a uma boa conversa sobre cinema! Responda sempre em português brasileiro com naturalidade e enthusiasm genuíno.`;
}

// Função melhorada para validar se a mensagem está relacionada ao filme
export function isMessageRelatedToMovie(
  message: string,
  movieContext: MovieContext
): boolean {
  const correctedMessage = correctCommonMistakes(message);
  const normalizedMessage = normalizeText(correctedMessage);

  // Se é recomendação, sempre é relacionado
  if (isRecommendationRequest(message)) {
    return true;
  }

  // Palavras-chave do filme atual
  const movieKeywords = [
    normalizeText(movieContext.title),
    ...movieContext.genres.map((g) => normalizeText(g)),
    ...movieContext.cast.slice(0, 5).map((c) => normalizeText(c.split(" ")[0])), // Primeiro nome dos atores
    ...(movieContext.director ? [normalizeText(movieContext.director)] : []),
  ];

  // Palavras relacionadas a cinema em geral
  const cinemaKeywords = [
    "filme",
    "filmes",
    "serie",
    "series",
    "cinema",
    "ator",
    "atriz",
    "diretor",
    "diretora",
    "personagem",
    "cena",
    "final",
    "historia",
    "enredo",
    "roteiro",
    "trilha",
    "soundtrack",
    "efeitos",
    "visual",
    "performance",
    "atuacao",
    "temporada",
    "episodio",
    "spoiler",
    "teoria",
    "analise",
    "critica",
    "review",
    "opiniao",
    "achei",
    "gostei",
    "adorei",
    "odiei",
    "melhor",
    "pior",
    "favorito",
    "assistir",
    "ver",
    "rever",
    "maratona",
    "netflix",
    "streaming",
  ];

  // Verifica palavras-chave específicas do filme
  const hasMovieKeywords = movieKeywords.some((keyword) =>
    normalizedMessage.includes(keyword)
  );

  // Verifica palavras gerais de cinema
  const hasCinemaKeywords = cinemaKeywords.some((keyword) =>
    normalizedMessage.includes(keyword)
  );

  // Padrões de perguntas cinematográficas
  const cinematicPatterns = [
    /\b(o\s*que|que|qual|como|por\s*que|quando|onde)\b.*\b(acho|achou|pens[ao]|senti[uo])\b/i,
    /\b(gost[aeo]|ador[eio]|odi[eio]|cur[to])\b/i,
    /\b(mel[hg]or|pior|favorit[oa]|preferid[oa])\b/i,
    /\b(cena|momento|parte|final|comeco)\b/i,
    /\b(clas[sc]ific[ao]|not[ae]|estrela|pontu[ao])\b/i,
  ];

  const hasPatterns = cinematicPatterns.some((pattern) =>
    pattern.test(normalizedMessage)
  );

  return hasMovieKeywords || hasCinemaKeywords || hasPatterns;
}

// Função para enviar mensagem para o Gemini (aprimorada)
export const sendMessageToGemini = async (
  message: string,
  movieContext: MovieContext,
  conversationHistory: ChatMessage[] = []
): Promise<string> => {
  try {
    const systemPrompt = createSystemPrompt(movieContext);
    const processedMessage = preprocessRecommendationMessage(
      message,
      movieContext
    );

    // Constrói o histórico com mais contexto
    const conversationContext = conversationHistory
      .slice(-8) // Últimas 8 mensagens para mais contexto
      .map((msg) => {
        const role = msg.role === "user" ? "👤 Usuário" : "🤖 Murphy";
        return `${role}: ${msg.content}`;
      })
      .join("\n\n");

    const fullPrompt = `${systemPrompt}

${
  conversationContext
    ? `📚 HISTÓRICO RECENTE DA CONVERSA:\n${conversationContext}\n\n`
    : ""
}

💬 MENSAGEM ATUAL DO USUÁRIO: ${processedMessage}

🎯 RESPONDA COMO MURPHY, seguindo todas as instruções acima!`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: fullPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.85, // Balanceado para criatividade e consistência
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1500, // Aumentado para respostas mais completas
        stopSequences: ["👤 Usuário:", "🤖 Murphy:"], // Evita continuar a conversa
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
      const errorData = await response.json().catch(() => ({}));
      console.error("Erro detalhado da API:", errorData);
      throw new Error(`Erro na API do Gemini: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      console.error("Estrutura de resposta inesperada:", data);
      throw new Error("Resposta inválida da API do Gemini");
    }
  } catch (error: unknown) {
    console.error("Erro ao comunicar com Gemini:", error);

    // Mensagens de erro mais específicas
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("API key")) {
      throw new Error(
        "Problema com a chave da API. Verifique as configurações."
      );
    } else if (errorMessage.includes("quota")) {
      throw new Error(
        "Limite de uso da API atingido. Tente novamente mais tarde."
      );
    } else if (errorMessage.includes("network")) {
      throw new Error(
        "Problema de conexão. Verifique sua internet e tente novamente."
      );
    } else {
      throw new Error(
        "Desculpe, não consegui processar sua mensagem no momento. Tente novamente em alguns segundos!"
      );
    }
  }
};

// Função para gerar mensagens de boas-vindas mais personalizadas
export async function generateWelcomeMessage(
  movieContext: MovieContext,
  userName?: string
): Promise<string> {
  const greeting = userName ? `Olá, ${userName}! ✨` : "Olá! ✨";
  const year = new Date(movieContext.releaseDate).getFullYear();
  const mediaType = movieContext.mediaType === "movie" ? "filme" : "série";

  const welcomeMessages = [
    `${greeting} Murphy aqui! Estou super empolgada para conversar sobre "${movieContext.title}" (${year}) com você. Esse ${mediaType} tem tanto para explorarmos juntos! Por onde começamos? 🎬`,

    `${greeting} Sou a Murphy, sua companheira cinematográfica! "${
      movieContext.title
    }" é uma escolha fantástica para conversarmos. Seja sobre ${movieContext.genres[0].toLowerCase()}, personagens, ou qualquer curiosidade - estou aqui! O que te trouxe até essa obra? 🌟`,

    `E aí! ${
      userName ? `${userName}, ` : ""
    }Sou a Murphy e adoro uma boa conversa sobre cinema! "${
      movieContext.title
    }" tem muito a oferecer para nossa discussão. Que tal me contar o que mais te chamou atenção nesse ${mediaType}? 🎭`,

    `${greeting} Murphy na área! Vejo que escolheu "${
      movieContext.title
    }" - excelente gosto! ${
      movieContext.rating ? `Com nota ${movieContext.rating}/10, ` : ""
    }essa obra tem muito o que discutirmos. Quer começar falando sobre o que mais te impactou? 🎪`,
  ];

  return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
}

// Função para sugerir tópicos de conversa (muito aprimorada)
export function generateSuggestedTopics(movieContext: MovieContext): string[] {
  const { mediaType, genres, cast, director, rating } = movieContext;

  let topics = [
    "💭 Sua opinião geral sobre a obra",
    "🎭 Personagem que mais te marcou",
    "🎬 Cenas mais impactantes",
    "🎯 Recomendações similares",
    "⭐ Sua nota pessoal",
  ];

  // Tópicos baseados no tipo de mídia
  if (mediaType === "tv") {
    topics.push(
      "📺 Temporada favorita",
      "🔮 Teorias sobre próximos episódios",
      "🎪 Evolução dos personagens"
    );
  } else {
    topics.push(
      "🎞️ Melhor momento do filme",
      "🎨 Aspectos técnicos",
      "🏆 Chances de premiação"
    );
  }

  // Tópicos baseados nos gêneros
  const genreTopics: Record<string, string[]> = {
    Action: ["⚔️ Melhores cenas de ação", "🎥 Coreografia das lutas"],
    Drama: ["😢 Momentos mais emocionantes", "🎭 Performances marcantes"],
    Comedy: ["😂 Cenas mais engraçadas", "🤡 Melhor timing cômico"],
    Horror: ["😱 Momentos mais assustadores", "🩸 Efeitos especiais"],
    Thriller: ["😰 Suspense mais tenso", "🕵️ Plot twists"],
    "Science Fiction": ["🚀 Conceitos sci-fi", "🤖 Tecnologias apresentadas"],
    Romance: ["💕 Química dos protagonistas", "💝 Cenas românticas"],
    Mystery: ["🔍 Teorias sobre o mistério", "🧩 Pistas importantes"],
    Fantasy: ["🧙‍♂️ Elementos fantásticos", "🗺️ World building"],
    Animation: ["🎨 Estilo de animação", "🎵 Trilha sonora"],
    Documentary: ["📚 Informações mais surpreendentes", "🎯 Impacto social"],
  };

  genres.forEach((genre) => {
    if (genreTopics[genre]) {
      topics.push(...genreTopics[genre]);
    }
  });

  // Tópicos baseados no elenco famoso
  if (cast.length > 0) {
    topics.push(`👥 Performance de ${cast[0].split(" ")[0]}`);
  }

  // Tópicos baseados no diretor
  if (director) {
    topics.push(`🎬 Estilo de ${director.split(" ")[0]}`);
  }

  // Tópicos baseados na avaliação
  if (rating && rating >= 8) {
    topics.push("🏆 Por que é tão aclamada?");
  } else if (rating && rating <= 6) {
    topics.push("🤔 Pontos controversos");
  }

  // Embaralha e retorna 6-8 tópicos únicos
  return [...new Set(topics)]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(8, topics.length));
}

// Função para detectar sentimento da mensagem (nova funcionalidade)
export function detectMessageSentiment(
  message: string
): "positive" | "negative" | "neutral" | "question" {
  const normalizedMessage = normalizeText(message);

  const positiveWords = [
    "gostei",
    "adorei",
    "incrivel",
    "maravilhoso",
    "otimo",
    "excelente",
    "perfeito",
    "amei",
    "fantástico",
  ];
  const negativeWords = [
    "odiei",
    "horrivel",
    "pessimo",
    "ruim",
    "terrivel",
    "detestei",
    "chato",
    "decepcionante",
  ];
  const questionWords = [
    "que",
    "qual",
    "como",
    "por que",
    "quando",
    "onde",
    "quem",
  ];

  const hasPositive = positiveWords.some((word) =>
    normalizedMessage.includes(word)
  );
  const hasNegative = negativeWords.some((word) =>
    normalizedMessage.includes(word)
  );
  const hasQuestion =
    questionWords.some((word) => normalizedMessage.includes(word)) ||
    message.includes("?");

  if (hasQuestion) return "question";
  if (hasPositive && !hasNegative) return "positive";
  if (hasNegative && !hasPositive) return "negative";
  return "neutral";
}

// Função para sugerir perguntas de follow-up baseadas no contexto (nova)
export function generateFollowUpQuestions(
  movieContext: MovieContext,
  lastMessage: string,
  sentiment: string
): string[] {
  const questions = [];
  const { mediaType, genres } = movieContext;

  if (sentiment === "positive") {
    questions.push(
      "O que mais te chamou atenção?",
      "Alguma cena específica te marcou?",
      "Quer recomendações similares?"
    );
  } else if (sentiment === "negative") {
    questions.push(
      "O que poderia ter ser melhor?",
      "Teve algum ponto positivo?",
      "Já tentou algo diferente no gênero?"
    );
  }

  // Perguntas baseadas no gênero
  if (genres.includes("Drama")) {
    questions.push("Qual personagem teve melhor desenvolvimento?");
  }

  if (genres.includes("Action")) {
    questions.push("O que achou das sequências de ação?");
  }

  if (mediaType === "tv") {
    questions.push("Qual temporada você mais curtiu?");
  }

  return questions.slice(0, 3);
}

// Função para detectar e tratar spoilers (nova funcionalidade)
export function detectSpoilerContent(message: string): {
  hasSpoiler: boolean;
  confidence: "low" | "medium" | "high";
  suggestedWarning?: string;
} {
  const spoilerIndicators = {
    high: [
      "final",
      "finale",
      "fim",
      "termina",
      "morre",
      "mata",
      "assassin",
      "revela",
      "revelacao",
      "segredo",
      "plot twist",
      "twist",
    ],
    medium: [
      "acontece",
      "descobr",
      "verdade",
      "realidade",
      "surpresa",
      "chocante",
      "inesperado",
    ],
    low: ["cena", "momento", "parte", "episodio", "temporada"],
  };

  const normalizedMessage = normalizeText(message);

  let confidence: "low" | "medium" | "high" = "low";
  let hasSpoiler = false;

  // Verifica indicadores de alto risco
  if (spoilerIndicators.high.some((word) => normalizedMessage.includes(word))) {
    hasSpoiler = true;
    confidence = "high";
  } else if (
    spoilerIndicators.medium.some((word) => normalizedMessage.includes(word))
  ) {
    hasSpoiler = true;
    confidence = "medium";
  } else if (
    spoilerIndicators.low.some((word) => normalizedMessage.includes(word))
  ) {
    hasSpoiler = true;
    confidence = "low";
  }

  const suggestedWarning =
    hasSpoiler && confidence !== "low"
      ? "⚠️ Vou falar sobre elementos da trama. Se ainda não assistiu, cuidado com spoilers!"
      : undefined;

  return { hasSpoiler, confidence, suggestedWarning };
}

// Função para sugerir continuação da conversa baseada no histórico
export function suggestConversationContinuation(
  conversationHistory: ChatMessage[],
  movieContext: MovieContext
): string[] {
  if (conversationHistory.length === 0) {
    return ["Primeira vez assistindo?", "O que te trouxe até essa obra?"];
  }

  const recentMessages = conversationHistory.slice(-4);
  const topicsDiscussed = new Set<string>();

  // Analisa tópicos já discutidos
  recentMessages.forEach((msg) => {
    const content = normalizeText(msg.content);
    if (content.includes("personagem")) topicsDiscussed.add("characters");
    if (content.includes("cena") || content.includes("momento"))
      topicsDiscussed.add("scenes");
    if (content.includes("final") || content.includes("fim"))
      topicsDiscussed.add("ending");
    if (content.includes("ator") || content.includes("atuacao"))
      topicsDiscussed.add("acting");
    if (content.includes("diretor") || content.includes("direcao"))
      topicsDiscussed.add("direction");
    if (content.includes("trilha") || content.includes("musica"))
      topicsDiscussed.add("soundtrack");
  });

  const suggestions = [];

  // Sugere tópicos não discutidos
  if (!topicsDiscussed.has("characters")) {
    suggestions.push("Qual personagem mais te impactou?");
  }
  if (!topicsDiscussed.has("scenes")) {
    suggestions.push("Alguma cena específica te marcou?");
  }
  if (!topicsDiscussed.has("acting")) {
    suggestions.push(
      `O que achou da performance de ${movieContext.cast[0]?.split(" ")[0]}?`
    );
  }
  if (!topicsDiscussed.has("soundtrack")) {
    suggestions.push("Como avalia a trilha sonora?");
  }

  // Sempre inclui recomendações se não foram pedidas recentemente
  const hasRecentRecommendation = recentMessages.some((msg) =>
    isRecommendationRequest(msg.content)
  );

  if (!hasRecentRecommendation) {
    suggestions.push("Quer algumas recomendações similares?");
  }

  return suggestions.slice(0, 3);
}

// Função para criar contexto de conversa mais rico
export function enrichConversationContext(
  movieContext: MovieContext,
  conversationHistory: ChatMessage[]
): {
  userPreferences: string[];
  discussedTopics: string[];
  userSentiment: "positive" | "negative" | "mixed" | "neutral";
  engagementLevel: "low" | "medium" | "high";
} {
  const userMessages = conversationHistory.filter((msg) => msg.role === "user");
  const preferences: string[] = [];
  const discussedTopics: string[] = [];

  let positiveCount = 0;
  let negativeCount = 0;
  let totalMessages = userMessages.length;

  userMessages.forEach((msg) => {
    const sentiment = detectMessageSentiment(msg.content);
    if (sentiment === "positive") positiveCount++;
    if (sentiment === "negative") negativeCount++;

    const content = normalizeText(msg.content);

    // Detecta preferências
    if (content.includes("acao") || content.includes("luta")) {
      preferences.push("action");
    }
    if (content.includes("drama") || content.includes("emocao")) {
      preferences.push("drama");
    }
    if (content.includes("comedia") || content.includes("engracado")) {
      preferences.push("comedy");
    }

    // Detecta tópicos discutidos
    if (content.includes("personagem")) discussedTopics.push("characters");
    if (content.includes("cena")) discussedTopics.push("scenes");
    if (content.includes("final")) discussedTopics.push("ending");
    if (content.includes("ator")) discussedTopics.push("acting");
  });

  // Determina sentimento geral
  let userSentiment: "positive" | "negative" | "mixed" | "neutral" = "neutral";
  if (positiveCount > negativeCount * 2) userSentiment = "positive";
  else if (negativeCount > positiveCount * 2) userSentiment = "negative";
  else if (positiveCount > 0 && negativeCount > 0) userSentiment = "mixed";

  // Determina nível de engajamento
  let engagementLevel: "low" | "medium" | "high" = "low";
  if (totalMessages > 5) engagementLevel = "high";
  else if (totalMessages > 2) engagementLevel = "medium";

  return {
    userPreferences: [...new Set(preferences)],
    discussedTopics: [...new Set(discussedTopics)],
    userSentiment,
    engagementLevel,
  };
}
