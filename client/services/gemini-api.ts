// Serviço para integração com Google Gemini AI
// Focado em conversas sobre títulos específicos de filmes e séries

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
}

// Função para criar o prompt do sistema com contexto do filme
export function createSystemPrompt(movieContext: MovieContext): string {
  return `Você é Murphy, uma assistente de IA especializada em cinema e entretenimento, inspirada na personagem Murphy Cooper do filme Interestelar. Você é curiosa, inteligente e apaixonada por descobrir e discutir todos os aspectos de filmes e séries.

CONTEXTO ATUAL:
Título: ${movieContext.title}
Tipo: ${movieContext.mediaType === "movie" ? "Filme" : "Série"}
Sinopse: ${movieContext.overview}
Data de lançamento: ${movieContext.releaseDate}
Gêneros: ${movieContext.genres.join(", ")}
Elenco principal: ${movieContext.cast.join(", ")}
Diretor/Produtor: ${movieContext.director}
Avaliação: ${movieContext.rating}/10

SUAS INSTRUÇÕES:
1. Foque EXCLUSIVAMENTE em "${movieContext.title}" e tópicos relacionados
2. Seja enthusiasta, conhecedora e envolvente como Murphy
3. Use emojis moderadamente para tornar a conversa mais dinâmica
4. Forneça análises profundas sobre enredo, personagens, cinematografia, trilha sonora, etc.
5. Faça conexões inteligentes com outros filmes/séries quando relevante
6. Se perguntarem sobre outros filmes/séries não relacionados, redirecione gentilmente para "${
    movieContext.title
  }"
7. Mantenha um tom amigável mas inteligente, como Murphy faria

BLOQUEIOS:
- NÃO discuta política, religião ou temas controversos não relacionados ao filme
- NÃO forneça informações sobre outros filmes/séries além de "${
    movieContext.title
  }"
- NÃO responda perguntas pessoais sobre você como IA

Responda sempre em português brasileiro e seja a Murphy que os fãs de cinema adorariam conhecer!`;
}

// Função para enviar mensagem para o Gemini
export const sendMessageToGemini = async (
  message: string,
  movieContext: MovieContext,
  conversationHistory: ChatMessage[] = []
): Promise<string> => {
  try {
    const systemPrompt = createSystemPrompt(movieContext);

    // Construir histórico da conversa para contexto
    const conversationContext = conversationHistory
      .slice(-6) // Últimas 6 mensagens para não exceder limite
      .map(
        (msg) =>
          `${msg.role === "user" ? "Usuário" : "Assistente"}: ${msg.content}`
      )
      .join("\n");

    const fullPrompt = `${systemPrompt}

${conversationContext ? `HISTÓRICO DA CONVERSA:\n${conversationContext}\n` : ""}

MENSAGEM ATUAL DO USUÁRIO: ${message}

Responda focando exclusivamente em "${movieContext.title}":`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: fullPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
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
      throw new Error(`Erro na API do Gemini: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Resposta inválida da API do Gemini");
    }
  } catch (error) {
    console.error("Erro ao comunicar com Gemini:", error);
    throw new Error(
      "Desculpe, não consegui processar sua mensagem no momento. Tente novamente!"
    );
  }
};

// Função para validar se a mensagem está relacionada ao filme
export function isMessageRelatedToMovie(
  message: string,
  movieContext: MovieContext
): boolean {
  const movieKeywords = [
    movieContext.title.toLowerCase(),
    ...movieContext.genres.map((g) => g.toLowerCase()),
    ...movieContext.cast.slice(0, 3).map((c) => c.toLowerCase()),
    movieContext.director.toLowerCase(),
  ];

  const messageWords = message.toLowerCase().split(" ");
  return movieKeywords.some((keyword) =>
    messageWords.some(
      (word) => word.includes(keyword) || keyword.includes(word)
    )
  );
}

// Função para gerar mensagens de boas-vindas personalizadas
export async function generateWelcomeMessage(
  movieContext: MovieContext
): Promise<string> {
  const welcomeMessages = [
    `Oi! 🎬 Sou a Murphy, sua assistente cinematográfica! Estou aqui para bater um papo sobre "${movieContext.title}". O que você gostaria de saber ou discutir sobre esta obra?`,
    `Olá! ✨ Murphy aqui! Estou super animada para conversar sobre "${movieContext.title}" com você. Que tal começarmos explorando o que mais te chamou atenção?`,
    `E aí! 🌟 Sou a Murphy e adoro uma boa conversa sobre cinema! Vamos mergulhar juntos no universo de "${movieContext.title}"?`,
  ];

  return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
}

// Função para sugerir tópicos de conversa
export function generateSuggestedTopics(movieContext: MovieContext): string[] {
  const { mediaType, genres } = movieContext;

  const topics = [
    "O que você achou do enredo?",
    "Qual personagem mais te marcou?",
    "Alguma cena te surpreendeu?",
    "O que achou do final?",
  ];

  if (mediaType === "tv") {
    topics.push("Qual sua temporada favorita?");
    topics.push("Teorias sobre os próximos episódios");
  }

  if (genres.includes("Action")) {
    topics.push("As melhores cenas de ação");
  }

  if (genres.includes("Drama")) {
    topics.push("Momentos mais emocionantes");
  }

  if (genres.includes("Comedy")) {
    topics.push("Cenas mais engraçadas");
  }

  if (genres.includes("Horror") || genres.includes("Thriller")) {
    topics.push("Momentos mais tensos");
  }

  if (genres.includes("Science Fiction")) {
    topics.push("Tecnologias e conceitos sci-fi");
  }

  // Retorna 6 tópicos aleatórios
  return topics.sort(() => Math.random() - 0.5).slice(0, 6);
}
