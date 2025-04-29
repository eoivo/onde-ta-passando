# API do Onde Tá Passando

Backend para a plataforma Onde Tá Passando, que ajuda usuários a descobrirem onde seus filmes e séries favoritos estão disponíveis para assistir.

## Tecnologias Utilizadas

- Node.js
- Express
- MongoDB
- JWT Authentication
- Cloudinary (para armazenamento de imagens)

## Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure as variáveis de ambiente (crie um arquivo `.env` baseado no exemplo abaixo):
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

## Comandos Disponíveis

- Iniciar em desenvolvimento:
  ```
  npm run dev
  ```
- Iniciar em produção:
  ```
  npm start
  ```

## Deploy no Render

1. Crie uma conta no [Render](https://render.com)
2. Conecte seu repositório GitHub
3. Crie um novo Web Service:
   - Selecione o repositório
   - Nome: onde-ta-passando-api
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Configure as variáveis de ambiente:
   - PORT: 10000 (o Render vai automaticamente definir a porta correta)
   - NODE_ENV: production
   - MONGODB_URI: sua_uri_do_mongodb
   - JWT_SECRET: seu_segredo_jwt
   - JWT_EXPIRE: 30d
   - CLOUDINARY_CLOUD_NAME: seu_cloudname
   - CLOUDINARY_API_KEY: sua_api_key
   - CLOUDINARY_API_SECRET: seu_api_secret

## Estrutura da API

### Endpoints de Autenticação

- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/me` - Dados do usuário autenticado

### Endpoints de Usuário

- `PUT /api/users/profile` - Atualizar perfil
- `POST /api/users/profile-image` - Upload de imagem de perfil
- `POST /api/users/favorites/:type` - Adicionar aos favoritos
- `DELETE /api/users/favorites/:type/:id` - Remover dos favoritos
- `GET /api/users/favorites` - Listar favoritos
- `POST /api/users/watchlist/:type` - Adicionar à lista "quero assistir"
- `DELETE /api/users/watchlist/:type/:id` - Remover da lista "quero assistir"
- `GET /api/users/watchlist` - Listar "quero assistir"
- `POST /api/users/watched/:type` - Adicionar à lista "assistidos"
- `DELETE /api/users/watched/:type/:id` - Remover da lista "assistidos"
- `GET /api/users/watched` - Listar "assistidos"
