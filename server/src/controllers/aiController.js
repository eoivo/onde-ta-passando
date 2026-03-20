// Controller para interação com Google Gemini AI no Backend
// Mover a lógica para o servidor protege a API Key e permite rate limiting

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

// Função para criar o prompt do sistema (Murphy)
function createSystemPrompt(movieContext) {
  const { title, overview, releaseDate, genres, cast, director, mediaType } = movieContext;
  const mediaTypeName = mediaType === "movie" ? "filme" : "série";
  const releaseDateObj = new Date(releaseDate);
  const currentDate = new Date();
  const year = releaseDateObj.getFullYear();

  const currentDateStr = currentDate.toLocaleDateString("pt-BR");
  const currentYear = currentDate.getFullYear();

  let releaseStatus = "";
  if (!releaseDate || isNaN(releaseDateObj.getTime())) {
    releaseStatus = "❓ STATUS NÃO ESPECIFICADO NOS DADOS OFICIAIS";
  } else if (releaseDateObj > currentDate) {
    releaseStatus = `⏳ AINDA NÃO LANÇADO - Previsão: ${releaseDateObj.toLocaleDateString("pt-BR")}`;
  } else {
    const monthsAgo = (currentDate.getFullYear() - releaseDateObj.getFullYear()) * 12 + (currentDate.getMonth() - releaseDateObj.getMonth());
    if (monthsAgo < 3) {
      releaseStatus = `🆕 LANÇAMENTO RECENTE - Lançado em: ${releaseDateObj.toLocaleDateString("pt-BR")}`;
    } else if (monthsAgo < 12) {
      releaseStatus = `🎬 DISPONÍVEL - Lançado em: ${releaseDateObj.toLocaleDateString("pt-BR")}`;
    } else {
      releaseStatus = `📚 CATÁLOGO - Lançado em: ${releaseDateObj.toLocaleDateString("pt-BR")}`;
    }
  }

  return `Você é Murphy, assistente de IA especializada em cinema, inspirada na Murphy Cooper de Interestelar. Você é curiosa, inteligente e apaixonada por filmes e séries.

📅 DATA ATUAL: ${currentDateStr} (${currentYear})

🎬 CONTEXTO ATUAL:
Título: ${title} (${year})
Tipo: ${mediaTypeName}
Status: ${releaseStatus}
Gêneros: ${genres.join(", ")}
Elenco: ${cast.join(", ")}
Direção: ${director || "N/A"}
Sinopse: ${overview}

🎯 SUA PERSONALIDADE:
• Seja natural e conversacional como uma amiga que ama cinema.
• Use português brasileiro coloquial.
• Use 1-2 emojis por resposta (não exagere).

⚠️ TRANSPARÊNCIA TEMPORAL E LIMITAÇÕES:
• Seu treinamento interno de IA foi concluído em meados de 2025.
• Para informações sobre obras ou fatos pós-Junho de 2025 que não estejam no CONTEXTO ATUAL, seja honesta: "Olha, como meu treinamento interno foi finalizado em 2025 e essa obra é super recente, eu ainda não tenho essa confirmação oficial por aqui."
• Evite citar termos técnicos como "TMDB", "API" ou "N/A" para o usuário.

❌ O QUE VOCÊ NÃO PODE FAZER:
• Inventar fatos ou premiações.
• Usar linguagem técnica de desenvolvedor.

✅ SEJA LIVRE PARA admitir o limite de tempo e focar no que você CONHECE sobre o filme.`;
}

// @desc    Enviar mensagem para o chat do Gemini
// @route   POST /api/ai/chat
// @access  Public (ou Private se quiser forçar login)
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

    const systemPrompt = createSystemPrompt(movieContext);
    const recentHistory = (conversationHistory || [])
      .slice(-6)
      .map(msg => `${msg.role === "user" ? "Usuário" : "Murphy"}: ${msg.content}`)
      .join("\n");

    const fullPrompt = `${systemPrompt}\n\n${recentHistory ? `Conversa anterior:\n${recentHistory}\n` : ""}Usuário: ${message}\n\nMurphy:`;

    const requestBody = {
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro Gemini API:", errorData);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Desculpe, não consegui processar sua mensagem.";

    res.status(200).json({
      success: true,
      data: reply
    });

  } catch (error) {
    console.error("Erro no AI Controller:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao processar conversa com a IA"
    });
  }
};
