import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Onde Tá Passando?",
  description:
    "Política de privacidade e tratamento de dados do serviço Onde Tá Passando?",
};

export default function PrivacidadePage() {
  return (
    <div className="container px-4 py-20 mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Política de Privacidade
      </h1>

      <div className="prose prose-invert max-w-none">
        <section className="mb-8">
          <p className="mb-4">
            Esta Política de Privacidade descreve como o "Onde Tá Passando?"
            coleta, usa e compartilha informações pessoais quando você utiliza
            nosso serviço. Sua privacidade é importante para nós, e estamos
            comprometidos em proteger e respeitar seus dados pessoais.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            1. Informações que Coletamos
          </h2>
          <h3 className="text-xl font-medium mb-2">
            1.1 Informações fornecidas diretamente por você
          </h3>
          <p className="mb-4">
            Podemos coletar informações que você nos fornece diretamente quando
            utiliza nosso serviço, como nome, endereço de e-mail e outras
            informações de perfil caso você opte por criar uma conta.
          </p>

          <h3 className="text-xl font-medium mb-2">
            1.2 Informações coletadas automaticamente
          </h3>
          <p className="mb-4">
            Quando você acessa nosso serviço, podemos coletar automaticamente
            determinadas informações sobre seu dispositivo e sua interação com o
            serviço, incluindo:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              Informações do dispositivo (tipo de dispositivo, sistema
              operacional, navegador);
            </li>
            <li className="mb-2">Endereço IP;</li>
            <li className="mb-2">
              Informações de acesso (páginas visitadas, tempo gasto no site,
              horários de acesso);
            </li>
            <li className="mb-2">Cookies e tecnologias semelhantes.</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">1.3 Histórico de busca</h3>
          <p className="mb-4">
            Podemos armazenar informações sobre suas buscas por filmes e séries,
            bem como suas preferências de conteúdo para melhorar sua experiência
            com o serviço.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            2. Como Utilizamos suas Informações
          </h2>
          <p className="mb-4">Utilizamos as informações coletadas para:</p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">Fornecer, manter e melhorar nosso serviço;</li>
            <li className="mb-2">Personalizar sua experiência;</li>
            <li className="mb-2">
              Enviar informações sobre atualizações, ofertas e promoções (caso
              você tenha optado por recebê-las);
            </li>
            <li className="mb-2">Analisar padrões de uso e tendências;</li>
            <li className="mb-2">
              Detectar, prevenir e resolver problemas técnicos e de segurança.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. Compartilhamento de Informações
          </h2>
          <p className="mb-4">
            Não vendemos suas informações pessoais a terceiros. Podemos
            compartilhar suas informações nas seguintes circunstâncias:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              Com provedores de serviços que nos auxiliam na operação do site;
            </li>
            <li className="mb-2">Para cumprir obrigações legais;</li>
            <li className="mb-2">
              Para proteger direitos, propriedade ou segurança do "Onde Tá
              Passando?", seus usuários ou terceiros;
            </li>
            <li className="mb-2">
              Em caso de fusão, venda ou transferência de ativos, suas
              informações podem ser transferidas para a nova entidade.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            4. Cookies e Tecnologias Semelhantes
          </h2>
          <p className="mb-4">
            Utilizamos cookies e tecnologias semelhantes para coletar
            informações sobre sua interação com nosso serviço. Cookies são
            pequenos arquivos de texto armazenados em seu dispositivo que nos
            permitem reconhecê-lo e lembrar suas preferências.
          </p>
          <p className="mb-4">
            Você pode configurar seu navegador para recusar cookies ou alertá-lo
            quando cookies estiverem sendo enviados. No entanto, algumas partes
            do serviço podem não funcionar adequadamente sem cookies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Segurança de Dados</h2>
          <p className="mb-4">
            Implementamos medidas de segurança técnicas e organizacionais para
            proteger suas informações contra acesso não autorizado, perda,
            alteração ou destruição. No entanto, nenhum método de transmissão
            pela internet ou de armazenamento eletrônico é 100% seguro, e não
            podemos garantir segurança absoluta.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Seus Direitos</h2>
          <p className="mb-4">
            De acordo com a Lei Geral de Proteção de Dados (LGPD) e outras leis
            de proteção de dados aplicáveis, você tem certos direitos em relação
            às suas informações pessoais, incluindo:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              Direito de acesso às suas informações pessoais;
            </li>
            <li className="mb-2">
              Direito de retificação de dados incorretos ou incompletos;
            </li>
            <li className="mb-2">
              Direito de exclusão de suas informações pessoais;
            </li>
            <li className="mb-2">
              Direito de oposição ao processamento de suas informações;
            </li>
            <li className="mb-2">Direito de portabilidade de dados;</li>
            <li className="mb-2">
              Direito de retirar seu consentimento a qualquer momento.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            7. Alterações nesta Política
          </h2>
          <p className="mb-4">
            Podemos atualizar esta Política de Privacidade periodicamente para
            refletir mudanças em nossas práticas ou por outros motivos
            operacionais, legais ou regulatórios. Recomendamos que você revise
            esta política regularmente para estar ciente de quaisquer
            alterações.
          </p>
          <p className="mb-4">
            Alterações significativas serão notificadas através de um aviso em
            nosso site ou por e-mail (se tivermos seu endereço de e-mail).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contato</h2>
          <p className="mb-4">
            Se você tiver dúvidas ou preocupações sobre esta Política de
            Privacidade ou sobre como tratamos seus dados pessoais, entre em
            contato conosco através do e-mail: contato@ondetapassando.com
          </p>
        </section>

        <p className="text-sm text-gray-400 mt-12 text-center">
          Última atualização:{" "}
          {new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
