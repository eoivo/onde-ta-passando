# Onde Tá Passando?

![Onde Tá Passando Logo](public/images/logo.png)

## 📺 Sobre o Projeto

**Onde Tá Passando?** é uma plataforma que ajuda usuários a descobrirem onde seus filmes e séries favoritos estão disponíveis para assistir. O sistema conecta-se à API TMDB (The Movie Database) para fornecer informações atualizadas sobre filmes, séries, avaliações e disponibilidade em serviços de streaming.

🔗 **Site em produção:** [onde-ta-passando.netlify.app](https://onde-ta-passando.netlify.app/)

## ✨ Funcionalidades

- **Descoberta de conteúdo:** Navegue por filmes e séries populares, bem avaliados e lançamentos recentes
- **Busca avançada:** Encontre conteúdo por título, gênero, ano e tipo
- **Detalhes de mídia:** Informações detalhadas sobre filmes e séries, incluindo sinopse, elenco e avaliações
- **Onde assistir:** Descubra em quais plataformas de streaming o conteúdo está disponível
- **Design responsivo:** Interface adaptada para dispositivos móveis e desktop
- **Carregamento otimizado:** Sistema de carregamento eficiente com feedback visual
- **Trailers:** Visualize trailers dos títulos diretamente na plataforma

## 🛠️ Tecnologias Utilizadas

- **Frontend:**

  - [Next.js 15](https://nextjs.org/) - Framework React com App Router
  - [React 19](https://react.dev/) - Biblioteca para construção de interfaces
  - [TypeScript](https://www.typescriptlang.org/) - Linguagem tipada baseada em JavaScript
  - [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
  - [Framer Motion](https://www.framer.com/motion/) - Biblioteca de animações para React
  - [Radix UI](https://www.radix-ui.com/) - Componentes primitivos acessíveis
  - [Lucide React](https://lucide.dev/icons/) - Biblioteca de ícones

- **Integração e APIs:**

  - [TMDB API](https://www.themoviedb.org/documentation/api) - API de filmes e séries
  - [Zustand](https://github.com/pmndrs/zustand) - Gerenciamento de estado

- **Infraestrutura:**
  - [Netlify](https://www.netlify.com/) - Hospedagem e CI/CD

## 🚀 Instalação e Uso

### Pré-requisitos

- Node.js 18 ou superior
- npm, yarn ou pnpm

### Configuração do ambiente

1. Clone o repositório:

   ```bash
   git clone https://github.com/eoivo/onde-ta-passando.git
   cd onde-ta-passando
   ```

2. Instale as dependências:

   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. Crie um arquivo `.env` na raiz do projeto com sua chave de API do TMDB:

   ```
   API_KEY=sua_chave_api_aqui
   ```

4. Execute o servidor de desenvolvimento:

   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   ```

5. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🌐 Deploy

O projeto está configurado para deploy automático no Netlify. Sempre que um novo commit é enviado para a branch principal, o Netlify compila e implanta automaticamente as atualizações.

### Configurações do Netlify

- **Build command:** `next build`
- **Publish directory:** `.next`
- **Environment variables:** Defina a variável `API_KEY` nas configurações do projeto no Netlify.

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.