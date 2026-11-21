// Controller para interação com Google Gemini AI no Backend
// Mover a lógica para o servidor protege a API Key e permite rate limiting

const API_V1BETA_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Função para criar o prompt do sistema (Murphy)
function createSystemPrompt(movieContext) {
  const { title, overview, releaseDate, genres, cast, director, mediaType, streamingServices } = movieContext;
  const mediaTypeName = mediaType === "movie" ? "filme" : "série";
  const releaseDateObj = releaseDate ? new Date(releaseDate) : null;
  const currentDate = new Date();
  
  const currentDateStr = currentDate.toLocaleDateString("pt-BR");
  const currentYear = currentDate.getFullYear();
  const releaseDateStr = releaseDateObj ? releaseDateObj.toLocaleDateString("pt-BR") : "Não informada";
  const year = releaseDateObj ? releaseDateObj.getFullYear() : "N/A";

  let releaseStatus = "";
  if (!releaseDateObj || isNaN(releaseDateObj.getTime())) {
    releaseStatus = "STATUS NÃO ESPECIFICADO NOS DADOS OFICIAIS";
  } else if (releaseDateObj > currentDate) {
    releaseStatus = `AINDA NÃO LANÇADO - Previsão oficial de estreia: ${releaseDateStr}`;
  } else {
    const monthsAgo = (currentDate.getFullYear() - releaseDateObj.getFullYear()) * 12 + (currentDate.getMonth() - releaseDateObj.getMonth());
    if (monthsAgo < 3) {
      releaseStatus = `LANÇAMENTO RECENTE - Lançado oficialmente em: ${releaseDateStr}`;
    } else if (monthsAgo < 12) {
      releaseStatus = `DISPONÍVEL - Lançado oficialmente em: ${releaseDateStr}`;
    } else {
      releaseStatus = `CATÁLOGO - Lançado oficialmente em: ${releaseDateStr}`;
    }
  }

  const availability = (streamingServices && streamingServices.length > 0) 
    ? `DISPONÍVEL EM: ${streamingServices.join(", ")}`
    : "AINDA NÃO DISPONÍVEL em serviços de streaming (apenas cinemas ou aguardando lançamento).";

  return `Você é Murphy, assistente de IA especializada em cinema, inspirada na Murphy Cooper de Interestelar. Você é inteligente, perspicaz e valoriza o tempo do usuário.

DATA ATUAL: ${currentDateStr} (${currentYear})

CONTEXTO ATUAL DO SISTEMA (SUA ÚNICA FONTE DE VERDADE):
- Título: ${title} (${year})
- Tipo: ${mediaTypeName}
- Status Oficial: ${releaseStatus}
- Disponibilidade Real: ${availability}
- Gêneros: ${genres.join(", ")}
- Elenco: ${cast.join(", ")}
- Direção: ${director || "N/A"}
- Sinopse: ${overview}

PERSONALIDADE E TOM DE VOZ:
- CONCISÃO É PRIORIDADE: Vá direto ao ponto. Evite introduções longas.
- RESPOSTA PROPORCIONAL: Se a pergunta for simples, responda em 1-2 frases. Só se estenda se o usuário pedir uma análise profunda.
- Seja natural, inteligente e direta, usando português brasileiro coloquial.
- NÃO use emojis nas respostas. Mantenha um tom editorial, sóbrio e cinematográfico.
- FORMATAÇÃO DE OBRAS CITADAS (OBRIGATÓRIO): Sempre que mencionar o título de OUTROS filmes ou séries (recomendações, comparações ou referências externas), formate-o como um link Markdown no padrão [Título da Obra](#obra:movie:Título da Obra:ANO) para filmes ou [Título da Obra](#obra:tv:Título da Obra:ANO) para séries (use espaços normais no título, nunca use %20; se não souber o ano exato, omita o :ANO final). Exemplo: recomendo [Batman](#obra:movie:Batman:2022) (2022) e [Breaking Bad](#obra:tv:Breaking Bad:2008). NUNCA aplique esse link à obra principal atual (${title}) e nem a nomes de atores, diretores ou personagens.

REGRAS CRÍTICAS DE VERACIDADE:
1. PRIORIDADE TOTAL AO CONTEXTO: Use APENAS os dados do sistema para fatos específicos sobre a obra (datas, streaming, elenco).
2. LIMITES DE TREINAMENTO: Seu treinamento interno foi concluído em meados de 2025. Se o usuário perguntar fatos globais (premiações, notícias) de 2026, seja honesta de forma breve.
3. NÃO ALUCINE: Nunca invente estreias no futuro se o Status Oficial mostrar que a obra já saiu.
4. DISPONIBILIDADE: Se a 'Disponibilidade Real' mostrar plataformas, confirme que o título JÁ está disponível nelas.

NÃO use termos técnicos como "TMDB", "API" ou "Contexto".`;
}

// @desc    Enviar mensagem para o chat do Gemini com lógica de Fallback
// @route   POST /api/ai/chat
// @access  Public
exports.chat = async (req, res) => {
  try {
    const { message, movieContext, conversationHistory } = req.body;

    if (!message || !movieContext || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Forneça a mensagem e o contexto do filme"
      });
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return res.status(400).json({
        success: false,
        message: "A mensagem não pode estar vazia"
      });
    }

    // Limite de 500 caracteres por mensagem para evitar abuso de tokens
    if (trimmedMessage.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Sua mensagem é muito longa (máximo de 500 caracteres)."
      });
    }

    // Sanitiza os campos do movieContext para evitar payloads gigantes
    const safeMovieContext = {
      title: String(movieContext.title || "").slice(0, 150),
      overview: String(movieContext.overview || "").slice(0, 1200),
      releaseDate: String(movieContext.releaseDate || "").slice(0, 30),
      genres: Array.isArray(movieContext.genres) ? movieContext.genres.slice(0, 8).map(g => String(g).slice(0, 40)) : [],
      cast: Array.isArray(movieContext.cast) ? movieContext.cast.slice(0, 10).map(c => String(c).slice(0, 60)) : [],
      director: movieContext.director ? String(movieContext.director).slice(0, 80) : "N/A",
      mediaType: movieContext.mediaType === "tv" ? "tv" : "movie",
      streamingServices: Array.isArray(movieContext.streamingServices)
        ? movieContext.streamingServices.slice(0, 10).map(s => String(s).slice(0, 40))
        : []
    };

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Configuração da API Key do Gemini ausente no servidor"
      });
    }

    // Configuração dos modelos para tentativa (Cascata de Fallback)
    // Priorizando modelos estáveis (GA), rápidos (<1.5s) e com cota ativa no Free Tier
    const modelsToTry = [
      { 
        name: "gemini-3.5-flash-lite", 
        useGrounding: false, 
        useThoughtSigs: false 
      },
      { 
        name: "gemini-3-flash-preview", 
        useGrounding: false, 
        useThoughtSigs: true 
      },
      { 
        name: "gemini-3.1-flash-lite", 
        useGrounding: false, 
        useThoughtSigs: true 
      },
      { 
        name: "gemini-2.5-flash-lite", 
        useGrounding: false, 
        useThoughtSigs: false 
      }
    ];

    let lastError = null;

    for (const modelConfig of modelsToTry) {
      try {
        const systemPrompt = createSystemPrompt(safeMovieContext);
        const contents = [];

        // Mapear histórico (máx 6 mensagens recentes e 1500 caracteres por item para economizar tokens)
        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
          conversationHistory.slice(-6).forEach(msg => {
            if (!msg || typeof msg.content !== "string") return;
            const role = msg.role === "user" ? "user" : "model";
            const parts = [{ text: msg.content.slice(0, 1500) }];
            
            if (modelConfig.useThoughtSigs && msg.thoughtSignature) {
              parts.push({ thought_signature: msg.thoughtSignature });
            }
            
            contents.push({ role, parts });
          });
        }

        contents.push({
          role: "user",
          parts: [{ text: trimmedMessage }]
        });

        const requestBody = {
          systemInstruction: {
            role: "system",
            parts: [{ text: systemPrompt }]
          },
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
          }
        };

        // Ativar Busca no Google APENAS se o modelo suportar
        if (modelConfig.useGrounding) {
          requestBody.tools = [{ google_search_retrieval: {} }];
        }

        const modelUrl = `${API_V1BETA_URL}/${modelConfig.name}:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(modelUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(12000),
        });

        if (!response.ok) {
          const errorData = await response.json();
          // Se for erro de cota (429), vamos para o próximo modelo sem disparar erro pro usuário
          if (response.status === 429) {
            console.warn(`Modelo ${modelConfig.name} atingiu limite de cota. Tentando fallback...`);
            continue; 
          }
          throw new Error(`Erro na API (${modelConfig.name}): ${response.status}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const parts = candidate?.content?.parts || [];
        
        let reply = "";
        let newThoughtSignature = null;

        parts.forEach(part => {
          if (part.text) reply += part.text;
          if (part.thought_signature) newThoughtSignature = part.thought_signature;
        });

        if (!reply) throw new Error("Resposta vazia da IA");

        // Sucesso! Retornamos a resposta do modelo que funcionou
        return res.status(200).json({
          success: true,
          data: reply,
          thoughtSignature: newThoughtSignature,
          modelUsed: modelConfig.name
        });

      } catch (err) {
        console.error(`Falha no modelo ${modelConfig.name}:`, err.message);
        lastError = err;
      }
    }

    // Se saiu do loop, todas as tentativas falharam
    throw lastError || new Error("Falha total na comunicação com a IA");

  } catch (error) {
    console.error("Erro Final no AI Controller:", error);
    res.status(500).json({
      success: false,
      message: error.message.includes("429") 
        ? "Murphy está um pouco sobrecarregada em todos os motores. Espere um minuto."
        : "Erro ao processar conversa com a IA"
    });
  }
};
