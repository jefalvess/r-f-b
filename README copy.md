# Backend Restaurante - Node.js

API REST para sistema interno de restaurante, com autenticação, controle operacional e relatórios.

## Tecnologias

- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT para autenticação
- Zod para validação

## Estrutura

- src/config: configuração de infraestrutura
- src/common: utilitários compartilhados
- src/middlewares: autenticação, validação e tratamento de erro
- src/modules: domínio em camadas (controller, service, repository)
- prisma/schema.prisma: modelo relacional

## Como rodar

1. Instale dependências:

npm install

2. Configure variáveis de ambiente:

cp .env.example .env

3. Ajuste DATABASE_URL no arquivo .env para seu PostgreSQL.

4. Gere client e rode migration:

npm run prisma:generate
npm run prisma:migrate

5. Opcional: popular dados iniciais (admin e categorias):

npm run prisma:seed

6. Suba a API:

npm run dev

## Login inicial (seed)

- userName: admin@restaurante.local
- senha: admin123

## Endpoints principais

### Auth
- POST /login

### Usuários
- GET /users
- POST /users
- PUT /users/:id
- DELETE /users/:id

### Categorias
- GET /categories
- POST /categories
- PUT /categories/:id
- DELETE /categories/:id

### Produtos
- GET /products
- POST /products
- PUT /products/:id
- DELETE /products/:id

### Ingredientes
- GET /ingredients
- POST /ingredients
- PUT /ingredients/:id
- DELETE /ingredients/:id

### Ficha técnica
- GET /recipes/:productId
- PUT /recipes

### Pedidos
- POST /orders
- GET /orders/open
- GET /orders/:id
- POST /orders/:id/items
- PUT /orders/:id/items/:itemId
- DELETE /orders/:id/items/:itemId
- PUT /orders/:id/status
- POST /orders/:id/close

### Caixa
- GET /cash/current
- POST /cash/open
- POST /cash/movement
- POST /cash/close

### Relatórios
- GET /reports/sales
- GET /reports/top-products
- GET /reports/payments
- GET /reports/orders-by-type

### Impressão
- GET /print/orders/:id/kitchen
- GET /print/orders/:id/customer
- GET /print/orders/:id/delivery

## Regras de negócio contempladas

- Pedido com ID público único.
- Perfis com permissão por rota (admin, gerente, atendente).
- Histórico de alterações e cancelamentos em logs.
- Registro de usuário que alterou preço de item.
- Bloqueio de fechamento de pedido já pago.
- Bloqueio de caixa duplicado aberto.
- Bloqueio de exclusão de produto já vendido.
- Baixa automática de estoque ao fechar pedido pago.

## Preparado para evolução

A estrutura modular facilita incluir integrações futuras:

- WhatsApp pedidos
- QR Code em mesa
- app cliente
- IA para compras
- múltiplas filiais
