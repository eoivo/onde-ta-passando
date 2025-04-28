import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Onde Tá Passando?",
  description: "Termos e condições de uso do serviço Onde Tá Passando?",
};

export default function TermosPage() {
  return (
    <div className="container px-4 py-20 mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Termos de Uso</h1>

      <div className="prose prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            1. Aceitação dos Termos
          </h2>
          <p className="mb-4">
            Ao acessar e utilizar o serviço "Onde Tá Passando?", o usuário
            aceita e concorda em cumprir os termos e condições aqui
            estabelecidos. Caso não concorde com qualquer disposição destes
            termos, solicitamos que não utilize nosso serviço.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            2. Descrição do Serviço
          </h2>
          <p className="mb-4">
            O "Onde Tá Passando?" é um serviço que permite aos usuários
            descobrir em quais plataformas de streaming filmes e séries estão
            disponíveis. Nosso objetivo é facilitar a busca por conteúdo
            audiovisual, fornecendo informações sobre disponibilidade em
            diferentes provedores de streaming.
          </p>
          <p className="mb-4">
            As informações fornecidas pelo serviço são baseadas em dados de
            terceiros e podem estar sujeitas a mudanças sem aviso prévio, uma
            vez que as plataformas de streaming frequentemente atualizam seus
            catálogos.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Uso do Serviço</h2>
          <p className="mb-4">
            O usuário compromete-se a utilizar o serviço apenas para fins legais
            e de acordo com estes termos. É expressamente proibido:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              Utilizar o serviço para qualquer finalidade ilegal ou não
              autorizada;
            </li>
            <li className="mb-2">
              Interferir ou interromper o funcionamento do serviço ou servidores
              conectados a ele;
            </li>
            <li className="mb-2">
              Tentar obter acesso não autorizado a qualquer parte do serviço;
            </li>
            <li className="mb-2">
              Utilizar scraping, bots ou outros métodos automatizados para
              acessar ou coletar dados do serviço;
            </li>
            <li className="mb-2">
              Reproduzir, duplicar, copiar, vender ou explorar comercialmente
              qualquer parte do serviço sem autorização expressa.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            4. Propriedade Intelectual
          </h2>
          <p className="mb-4">
            Todo o conteúdo disponibilizado no "Onde Tá Passando?", incluindo
            mas não se limitando a textos, gráficos, logotipos, ícones, imagens,
            clipes de áudio, downloads digitais e compilações de dados, é de
            propriedade do "Onde Tá Passando?" ou seus fornecedores de conteúdo
            e está protegido por leis de direitos autorais brasileiras e
            internacionais.
          </p>
          <p className="mb-4">
            Os nomes e logotipos de serviços de streaming mencionados no site
            são marcas registradas de seus respectivos proprietários e seu uso
            no "Onde Tá Passando?" tem finalidade informativa.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            5. Limitação de Responsabilidade
          </h2>
          <p className="mb-4">
            O "Onde Tá Passando?" não garante a precisão, completude ou
            atualidade das informações disponibilizadas pelo serviço. O uso do
            serviço é por conta e risco do usuário.
          </p>
          <p className="mb-4">
            Em nenhuma circunstância o "Onde Tá Passando?" será responsável por
            danos diretos, indiretos, incidentais, especiais ou consequentes
            resultantes do uso ou da incapacidade de usar o serviço.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            6. Modificações nos Termos
          </h2>
          <p className="mb-4">
            O "Onde Tá Passando?" reserva-se o direito de modificar estes termos
            a qualquer momento, a seu exclusivo critério. As modificações
            entrarão em vigor imediatamente após sua publicação no site.
          </p>
          <p className="mb-4">
            O uso continuado do serviço após a publicação de quaisquer
            modificações constitui aceitação dessas alterações.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Lei Aplicável</h2>
          <p className="mb-4">
            Estes termos são regidos e interpretados de acordo com as leis do
            Brasil. Qualquer disputa decorrente ou relacionada a estes termos
            será submetida à jurisdição exclusiva dos tribunais brasileiros.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contato</h2>
          <p className="mb-4">
            Em caso de dúvidas sobre estes termos, entre em contato conosco
            através do e-mail: contato@ondetapassando.com
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
