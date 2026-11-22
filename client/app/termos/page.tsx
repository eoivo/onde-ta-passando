import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";
import CopyEmailButton from "@/components/CopyEmailButton";

export const metadata: Metadata = {
  title: "Termos de Uso | Onde Tá Passando?",
  description: "Termos e condições de uso da plataforma Onde Tá Passando?",
};

const SECTIONS = [
  {
    number: "01",
    title: "Aceitação dos Termos",
    content: [
      'Ao acessar e utilizar a plataforma "Onde Tá Passando?", você concorda em cumprir os termos e condições aqui estabelecidos. Caso não concorde com qualquer disposição destes termos, recomendamos que não utilize o serviço.',
    ],
  },
  {
    number: "02",
    title: "Descrição do Serviço e Fontes de Dados",
    content: [
      'O "Onde Tá Passando?" é uma plataforma de descoberta audiovisual que permite consultar em quais serviços de streaming filmes e séries estão disponíveis no Brasil, além de oferecer recursos de curadoria ("Sintonia") e recomendações conversacionais com inteligência artificial ("Murphy").',
      "Os metadados, pôsteres, trailers e informações de disponibilidade em catálogos são fornecidos por APIs de terceiros, incluindo o TMDB (The Movie Database) e Watchmode. Embora busquemos a máxima precisão, este produto utiliza a API do TMDB mas não é endossado ou certificado pelo TMDB, e a disponibilidade das obras pode sofrer alterações pelas próprias plataformas de streaming sem aviso prévio.",
    ],
  },
  {
    number: "03",
    title: "Cadastro e Conta do Usuário",
    content: [
      "A consulta de catálogo e disponibilidade é livre. Para utilizar recursos personalizados — como salvar obras em Favoritos, Quero Ver, Assistidos ou interagir com a assistente Murphy — é necessário criar uma conta gratuita.",
      "Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.",
    ],
  },
  {
    number: "04",
    title: "Uso Adequado da Plataforma",
    content: [
      "O usuário compromete-se a utilizar a plataforma apenas para fins pessoais e lícitos. É expressamente proibido:",
    ],
    bullets: [
      "Utilizar o serviço para qualquer finalidade ilegal ou não autorizada;",
      "Interferir ou interromper o funcionamento da plataforma, APIs ou servidores conectados;",
      "Utilizar bots, scrapers ou métodos automatizados abusivos para extrair dados ou consumir cotas da assistente de IA;",
      "Tentar obter acesso não autorizado a contas de outros usuários ou áreas restritas do sistema;",
      "Reproduzir, duplicar, copiar ou explorar comercialmente qualquer parte da plataforma sem autorização expressa.",
    ],
  },
  {
    number: "05",
    title: "Propriedade Intelectual",
    content: [
      'A identidade visual, código-fonte, textos originais e funcionalidades do "Onde Tá Passando?" são de propriedade exclusiva da plataforma e protegidos pelas leis de direitos autorais aplicáveis.',
      "Os títulos, sinopses, pôsteres de obras audiovisuais e os logotipos de serviços de streaming (como Netflix, Prime Video, Max, Disney+, Apple TV+, Globoplay, entre outros) pertencem aos seus respectivos titulares e são exibidos exclusivamente para fins informativos e de direcionamento oficial.",
    ],
  },
  {
    number: "06",
    title: "Limitação de Responsabilidade",
    content: [
      'O "Onde Tá Passando?" não hospeda, não transmite e não comercializa arquivos de vídeo, filmes ou assinaturas de streaming — atuamos exclusivamente como guia informativo e direcionador para as plataformas oficiais.',
      "Não garantimos que os catálogos exibidos estejam livres de divergências momentâneas em relação aos provedores finais, nem nos responsabilizamos por decisões de assinatura ou aluguel tomadas com base nas informações exibidas.",
    ],
  },
  {
    number: "07",
    title: "Modificações nos Termos e Lei Aplicável",
    content: [
      "Reservamo-nos o direito de atualizar estes Termos de Uso periodicamente para refletir evoluções na plataforma ou exigências legais. Estes termos são regidos e interpretados de acordo com as leis da República Federativa do Brasil.",
    ],
  },
];

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navegação entre Termos e Privacidade */}
        <div className="flex flex-col items-center text-center space-y-5">
          <div className="inline-flex items-center p-1 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <Link
              href="/termos"
              className="h-9 px-5 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors leading-none"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Termos de Uso</span>
            </Link>
            <Link
              href="/privacidade"
              className="h-9 px-5 rounded-full text-neutral-400 hover:text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors leading-none"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacidade</span>
            </Link>
          </div>

          <div className="space-y-2 max-w-2xl">
            <h1 className="font-bebas text-4xl md:text-6xl text-white tracking-wider uppercase leading-none">
              Termos de <span className="text-red-600">Uso</span>
            </h1>
            <p className="text-neutral-400 text-sm md:text-base">
              Regras, diretrizes e condições para utilização da plataforma Onde Tá Passando?.
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
                  Ficou com alguma dúvida sobre os Termos?
                </h3>
                <p className="text-xs text-neutral-400">
                  Clique para copiar nosso e-mail e entre em contato diretamente com a equipe.
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
