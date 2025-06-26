# Onde Tá Passando?

<p align="center">
  <img src="client/public/images/logo.png" alt="Onde Tá Passando Logo" width="300">
</p>

## 📺 Sobre o Projeto

**Onde Tá Passando?** é uma plataforma completa que ajuda usuários a descobrirem onde seus filmes e séries favoritos estão disponíveis para assistir. O sistema conecta-se à API TMDB (The Movie Database) para fornecer informações atualizadas sobre filmes, séries, avaliações e disponibilidade em serviços de streaming.

🔗 **Site em produção:** [onde-ta-passando.netlify.app](https://onde-ta-passando.netlify.app/)

## 🤖 Murphy - Assistente Cinematográfica IA

Uma das funcionalidades mais inovadoras da plataforma é a **Murphy**, uma assistente de inteligência artificial inspirada na personagem Murphy Cooper do filme Interestelar. A Murphy oferece uma experiência única de conversação sobre filmes e séries:

### 🎬 Características da Murphy:

- **Especialização contextual:** Foca exclusivamente no filme ou série que você está visualizando
- **Análises profundas:** Discute enredo, personagens, cinematografia, trilha sonora e aspectos técnicos
- **Sugestões inteligentes:** Gera tópicos de conversa baseados no gênero e características do título
- **Interface imersiva:** Avatar personalizado da Murphy com animações fluidas
- **Powered by Gemini AI:** Utiliza a avançada tecnologia de IA do Google

### 💬 Como funciona:

1. Acesse qualquer página de filme ou série
2. Clique no botão "Conversar com a Murphy"
3. Inicie uma conversa focada exclusivamente naquele título
4. Explore análises, teorias e discussões cinematográficas

A Murphy transforma a experiência de descobrir conteúdo em uma jornada interativa e educativa sobre cinema!

## ✨ Funcionalidades

- **Descoberta de conteúdo:** Navegue por filmes e séries populares, bem avaliados e lançamentos recentes
- **Busca avançada:** Encontre conteúdo por título, gênero, ano e tipo
- **Detalhes de mídia:** Informações detalhadas sobre filmes e séries, incluindo sinopse, elenco e avaliações
- **Onde assistir:** Descubra em quais plataformas de streaming o conteúdo está disponível
- **🤖 Murphy - Assistente IA:** Converse com Murphy, uma assistente cinematográfica inteligente inspirada no filme Interestelar, que oferece:
  - Análises profundas sobre enredo, personagens e cinematografia
  - Discussões focadas exclusivamente no título que você está visualizando
  - Sugestões de tópicos baseadas no gênero do filme/série
  - Interface moderna com avatar da Murphy e animações fluidas
  - Powered by Google Gemini AI
- **Perfil de usuário:** Cadastre-se para salvar favoritos, marcar como "assistido" e adicionar à lista de "quero assistir"
- **Design responsivo:** Interface adaptada para dispositivos móveis e desktop
- **Carregamento otimizado:** Sistema de carregamento eficiente com feedback visual
- **Trailers:** Visualize trailers dos títulos diretamente na plataforma

## 🧩 Arquitetura do Sistema

O projeto utiliza uma arquitetura moderna cliente-servidor:

### Frontend (client)

- Interface de usuário construída com Next.js 15 e React 19
- Design responsivo com Tailwind CSS
- Animações com Framer Motion
- Componentes acessíveis com Radix UI
- Gerenciamento de estado com Zustand

### Backend (server)

- API RESTful construída com Node.js e Express
- Autenticação com JWT
- Banco de dados MongoDB para armazenamento de usuários e preferências
- Integração com Cloudinary para armazenamento de imagens
- Deploy no Render

## 🛠️ Tecnologias Utilizadas

### Frontend:

- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca para construção de interfaces
- **TypeScript** - Linguagem tipada baseada em JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **Framer Motion** - Biblioteca de animações para React
- **Radix UI** - Componentes primitivos acessíveis
- **Lucide React** - Biblioteca de ícones
- **Zustand** - Gerenciamento de estado
- **Google Gemini AI** - Inteligência artificial para a assistente Murphy
- **React Hot Toast** - Notificações elegantes

### Backend:

- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web para Node.js
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação com tokens
- **Bcrypt** - Criptografia de senhas
- **Cloudinary** - Armazenamento de imagens

### Infraestrutura:

- **Netlify** - Hospedagem e CI/CD para o frontend
- **Render** - Hospedagem para o backend

## 🚀 Instalação e Uso

### Pré-requisitos

- Node.js 18 ou superior
- npm, yarn ou pnpm
- MongoDB (local ou Atlas)

### Configuração do Frontend

1. Clone o repositório
2. Navegue até a pasta do cliente:
   ```bash
   cd client
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Configure as variáveis de ambiente (crie um arquivo `.env.local`):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_TMDB_API_KEY=sua_chave_api_tmdb
   NEXT_PUBLIC_GEMINI_API_KEY=sua_chave_api_gemini
   ```
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### Configuração do Backend

1. Navegue até a pasta do servidor:
   ```bash
   cd server
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente (crie um arquivo `.env`):
   ```
   PORT=3001
   MONGODB_URI=sua_uri_do_mongodb
   JWT_SECRET=seu_segredo_jwt
   JWT_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=seu_cloudname
   CLOUDINARY_API_KEY=sua_api_key
   CLOUDINARY_API_SECRET=seu_api_secret
   NODE_ENV=development
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🌐 Deploy

### Frontend (Netlify)

O frontend está configurado para deploy automático no Netlify:

- **Build command:** `next build`
- **Publish directory:** `.next`
- **Environment variables:** Configure as variáveis necessárias nas configurações do projeto no Netlify.

### Backend (Render)

O backend está configurado para deploy no Render:

1. Crie um novo Web Service no Render
2. Configure o build:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Configure as variáveis de ambiente necessárias

## 📝 Licença

Este projeto está sob a licença MIT.
