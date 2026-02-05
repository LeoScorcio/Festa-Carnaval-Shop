# Loja Festa & Carnaval (Exemplo)

Este é um projeto de exemplo: uma loja simples de produtos de festa/carnaval com um chatbot que utiliza a OpenAI através do backend.

Funcionalidades:
- Listagem de produtos (arquivo JSON)
- Carrinho simples (no frontend)
- Checkout simulado (endpoint /api/checkout)
- Chatbot que responde perguntas e pode usar contexto do produto (endpoint /api/chat -> proxia p/ OpenAI)

Pré-requisitos:
- Node.js 14+ (recomendado 18+)
- Chave OpenAI (não compartilhe)

Como rodar localmente:
1. renomeie `.env.example` para `.env` e adicione sua chave:
   OPENAI_API_KEY=suachaveaqui
2. Instale dependências:
   npm install
3. Rode:
   npm start
4. Abra no navegador:
   http://localhost:3000

Deploy recomendados:
- Render / Railway: recomendado para rodar um backend Node (processo contínuo).
- Vercel: bom para frontends; para usar o Express você precisa adaptar para serverless ou usar outra estratégia.
- GitHub Pages: só para frontend estático (não serve para o chatbot backend).

Observações:
- Nunca comite sua chave em repositórios públicos. Use variáveis de ambiente na plataforma de deploy.
- Em produção: adicione rate-limiting, validação e gateway de pagamento real.