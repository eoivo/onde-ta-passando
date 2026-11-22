import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";
import CopyEmailButton from "@/components/CopyEmailButton";

export const metadata: Metadata = {
  title: "Política de Privacidade | Onde Tá Passando?",
  description:
    "Política de privacidade e tratamento de dados pessoais da plataforma Onde Tá Passando?",
};

const SECTIONS = [
  {
    number: "01",
    title: "Informações que Coletamos",
    content: [
      'A sua privacidade é prioridade no "Onde Tá Passando?". Coletamos apenas o mínimo de informações necessárias para oferecer uma experiência personalizada e segura:',
    ],
    bullets: [
      "Dados de Conta (fornecidos por você): Nome, endereço de e-mail, senha criptografada e foto de perfil opcional quando você cria uma conta;",
      "Listas Pessoais: Filmes e séries que você salva voluntariamente em Favoritos, Quero Ver e Assistidos;",
      "Interações com a Murphy (IA): As perguntas enviadas no chat sobre filmes e séries são processadas em tempo real para gerar respostas e recomendações contextualizadas, mantendo o histórico local apenas durante a sua sessão no navegador;",
      "Dados Técnicos de Acesso: Endereço IP e tokens de sessão (armazenados localmente) para autenticação e proteção contra abuso (rate limiting).",
    ],
  },
  {
    number: "02",
    title: "Como Utilizamos suas Informações",
    content: [
      "Não realizamos venda de dados nem exibimos anúncios invasivos. Utilizamos as informações coletadas exclusivamente para:",
    ],
    bullets: [
      "Autenticar seu acesso e sincronizar suas listas de Favoritos, Quero Ver e Assistidos;",
      "Enviar e-mails transacionais estritamente necessários, como recuperação e redefinição de senha solicitadas por você;",
      "Personalizar recomendações de obras audiovisuais;",
      "Prevenir fraudes, abusos de API e garantir a estabilidade técnica da plataforma.",
    ],
  },
  {
    number: "03",
    title: "Compartilhamento de Dados e Serviços Integrados",
    content: [
      "Não comercializamos suas informações pessoais com terceiros. O compartilhamento ocorre apenas com serviços de infraestrutura essenciais para o funcionamento da plataforma:",
    ],
    bullets: [
      "APIs de Catálogo (TMDB / Watchmode): Consultas de obras e provedores de streaming (sem envio de dados pessoais do usuário);",
      "Processamento de Linguagem Natural (Google Gemini API): Apenas o texto da sua mensagem e o título da obra em conversa são enviados para gerar a resposta da assistente Murphy;",
      "Armazenamento de Mídia (Cloudinary): Caso você faça upload de uma foto de perfil personalizada.",
    ],
  },
  {
    number: "04",
    title: "Armazenamento Local e Cookies",
    content: [
      "Utilizamos o armazenamento local do navegador (LocalStorage e SessionStorage) para manter sua sessão autenticada e preservar temporariamente suas conversas com a Murphy enquanto você navega entre páginas.",
      "Você pode limpar os dados do navegador ou encerrar sua sessão a qualquer momento clicando em \"Sair\" no menu do seu perfil.",
    ],
  },
  {
    number: "05",
    title: "Segurança dos Dados",
    content: [
      "Adotamos práticas modernas de segurança, incluindo criptografia de senhas (hash irreversível), comunicação via HTTPS, tokens JWT com expiração e limitação de requisições por usuário e IP. Nenhum dado bancário ou de cartão de crédito é solicitado ou coletado pela plataforma.",
    ],
  },
  {
    number: "06",
    title: "Seus Direitos (LGPD)",
    content: [
      "Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD), você tem direito a:",
    ],
    bullets: [
      "Acessar e visualizar todos os dados vinculados ao seu perfil;",
      "Atualizar seu nome, e-mail, foto e senha diretamente na página de Perfil;",
      "Remover a qualquer momento obras de suas listas de Favoritos, Quero Ver e Assistidos;",
      "Solicitar a exclusão definitiva da sua conta e de todos os dados associados através do nosso canal de contato.",
    ],
  },
];

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navegação entre Termos e Privacidade */}
        <div className="flex flex-col items-center text-center space-y-5">
          <div className="inline-flex items-center p-1 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <Link
              href="/termos"
              className="h-9 px-5 rounded-full text-neutral-400 hover:text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors leading-none"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Termos de Uso</span>
            </Link>
            <Link
              href="/privacidade"
              className="h-9 px-5 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors leading-none"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacidade</span>
            </Link>
          </div>

          <div className="space-y-2 max-w-2xl">
            <h1 className="font-bebas text-4xl md:text-6xl text-white tracking-wider uppercase leading-none">
              Política de <span className="text-red-600">Privacidade</span>
            </h1>
            <p className="text-neutral-400 text-sm md:text-base">
              Transparência sobre como protegemos e tratamos seus dados no Onde Tá Passando?.
            </p>
          </div>
        </div>

        {/* Conteúdo Editorial Dark Glass */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-10 space-y-8 backdrop-blur-xl shadow-2xl">
          {SECTIONS.map((sec) => (
            <section
              key={sec.number}
              className="pb-8 border-b border-white/5 last:border-b-0 last:pb-0 space-y-3"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-bebas text-xl md:text-2xl text-red-500 tracking-wider leading-none">
                  {sec.number}.
                </span>
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  {sec.title}
                </h2>
              </div>

              <div className="space-y-3 text-neutral-300 text-sm md:text-[15px] leading-relaxed pl-0 md:pl-8">
                {sec.content.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}

                {sec.bullets && (
                  <ul className="space-y-2 pt-1">
                    {sec.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-neutral-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500/80 mt-2 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          {/* Card de Contato */}
          <div className="pt-4">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-sm font-bold text-white">
                  Dúvidas ou solicitações sobre seus dados?
                </h3>
                <p className="text-xs text-neutral-400">
                  Clique para copiar nosso e-mail oficial e fale diretamente com a gente.
                </p>
              </div>
              <CopyEmailButton />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
