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
    releaseStatus = "❓ STATUS NÃO ESPECIFICADO NOS DADOS OFICIAIS";
  } else if (releaseDateObj > currentDate) {
    releaseStatus = `⏳ AINDA NÃO LANÇADO - Previsão oficial de estreia: ${releaseDateStr}`;
  } else {
    const monthsAgo = (currentDate.getFullYear() - releaseDateObj.getFullYear()) * 12 + (currentDate.getMonth() - releaseDateObj.getMonth());
    if (monthsAgo < 3) {
      releaseStatus = `🆕 LANÇAMENTO RECENTE - Lançado oficialmente em: ${releaseDateStr}`;
    } else if (monthsAgo < 12) {
      releaseStatus = `🎬 DISPONÍVEL - Lançado oficialmente em: ${releaseDateStr}`;
    } else {
      releaseStatus = `📚 CATÁLOGO - Lançado oficialmente em: ${releaseDateStr}`;
    }
  }

  const availability = (streamingServices && streamingServices.length > 0) 
    ? `✅ DISPONÍVEL EM: ${streamingServices.join(", ")}`
    : "❌ AINDA NÃO DISPONÍVEL em serviços de streaming (apenas cinemas ou aguardando lançamento).";

  return `Você é Murphy, assistente de IA especializada em cinema, inspirada na Murphy Cooper de Interestelar. Você é curiosa, inteligente e apaixonada por filmes e séries.

📅 DATA ATUAL: ${currentDateStr} (${currentYear})

🎬 CONTEXTO ATUAL DO SISTEMA (SUA ÚNICA FONTE DE VERDADE):
• Título: ${title} (${year})
• Tipo: ${mediaTypeName}
• Status Oficial: ${releaseStatus}
• Disponibilidade Real: ${availability}
• Gêneros: ${genres.join(", ")}
• Elenco: ${cast.join(", ")}
• Direção: ${director || "N/A"}
• Sinopse: ${overview}

🎯 SUA PERSONALIDADE:
• Seja natural e conversacional como uma amiga que ama cinema. Use português brasileiro coloquial.

⚠️ REGRAS CRÍTICAS DE VERACIDADE:
1. **PRIORIDADE TOTAL AO CONTEXTO:** Use APENAS os dados do sistema para fatos específicos sobre o filme que você está conversando hoje (datas, streaming, elenco).
2. **LIMITES DE TREINAMENTO:** Seu treinamento interno foi concluído em meados de 2025. Se o usuário perguntar fatos globais (premiações, notícias) de 2026, seja honesta que sua memória interna para ali.
3. **NÃO ALUCINE:** Nunca invente estreias no futuro se o Status Oficial mostrar que o filme já saiu.
4. **DISPONIBILIDADE:** Se a 'Disponibilidade Real' mostrar plataformas, ignore sua memória de que o filme ainda não saiu e confirme que ele JÁ está em streaming.

❌ NÃO use termos técnicos como "TMDB", "API" ou "Contexto".`;
}

// @desc    Enviar mensagem para o chat do Gemini com lógica de Fallback
// @route   POST /api/ai/chat
// @access  Public
exports.chat = async (req, res) => {
  try {
    const { message, movieContext, conversationHistory } = req.body;

    if (!message || !movieContext) {
      return res.status(400).json({
        success: false,
        message: "Forneça a mensagem e o contexto do filme"
      });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Configuração da API Key do Gemini ausente no servidor"
      });
    }

    // Configuração dos modelos para tentativa (Cascata de Fallback)
    // Desativada a Busca no Google (Grounding) para priorizar estabilidade na cota gratuita
    const modelsToTry = [
      { 
        name: "gemini-3.1-flash-lite-preview", 
        useGrounding: false, 
        useThoughtSigs: true 
      },
      { 
        name: "gemini-2.5-flash-lite", 
        useGrounding: false, 
        useThoughtSigs: false 
      },
      { 
        name: "gemini-1.5-flash-latest", 
        useGrounding: false, 
        useThoughtSigs: false 
      }
    ];

    let lastError = null;

    for (const modelConfig of modelsToTry) {
      try {
        const systemPrompt = createSystemPrompt(movieContext);
        const contents = [];

        // Mapear histórico (limpando thought_signatures se o modelo não suportar)
        if (conversationHistory && conversationHistory.length > 0) {
          conversationHistory.slice(-8).forEach(msg => {
            const role = msg.role === "user" ? "user" : "model";
            const parts = [{ text: msg.content }];
            
            if (modelConfig.useThoughtSigs && msg.thoughtSignature) {
              parts.push({ thought_signature: msg.thoughtSignature });
            }
            
            contents.push({ role, parts });
          });
        }

        contents.push({
          role: "user",
          parts: [{ text: message }]
        });

        const requestBody = {
          systemInstruction: {
            role: "system",
            parts: [{ text: systemPrompt }]
          },
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
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
        ? "Murphy está um pouco sobrecarregada em todos os motores! Espere um minuto. 😅"
        : "Erro ao processar conversa com a IA"
    });
  }
};
