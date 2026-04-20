const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Restaurant Backend API",
    version: "1.0.0",
    description: "Documentacao dos endpoints do sistema interno de restaurante.",
  },
  servers: [{ url: "http://localhost:3000" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/health": { get: { tags: ["System"], summary: "Health check" } },

    "/login": {
      post: {
        tags: ["Auth"],
        summary: "Realiza login e retorna token JWT",
      },
    },

    "/users": {
      get: { tags: ["Users"], summary: "Lista usuarios", security: [{ bearerAuth: [] }] },
      post: { tags: ["Users"], summary: "Cria usuario", security: [{ bearerAuth: [] }] },
    },
    "/users/{id}": {
      delete: { tags: ["Users"], summary: "Desativa usuario", security: [{ bearerAuth: [] }] },
    },

    "/categories": {
      get: { tags: ["Categories"], summary: "Lista tipos de produto", security: [{ bearerAuth: [] }] },
      post: { tags: ["Categories"], summary: "Cria tipo de produto", security: [{ bearerAuth: [] }] },
    },
    "/categories/{id}": {
      put: { tags: ["Categories"], summary: "Atualiza tipo de produto", security: [{ bearerAuth: [] }] },
      delete: { tags: ["Categories"], summary: "Remove tipo de produto", security: [{ bearerAuth: [] }] },
    },

    "/products": {
      get: { tags: ["Products"], summary: "Lista produtos", security: [{ bearerAuth: [] }] },
      post: { tags: ["Products"], summary: "Cria produto", security: [{ bearerAuth: [] }] },
    },
    "/products/{id}": {
      put: { tags: ["Products"], summary: "Atualiza produto", security: [{ bearerAuth: [] }] },
      delete: { tags: ["Products"], summary: "Remove produto", security: [{ bearerAuth: [] }] },
    },

    "/orders": {
      post: { tags: ["Orders"], summary: "Cria pedido", security: [{ bearerAuth: [] }] },
    },
    "/orders/open": {
      get: { tags: ["Orders"], summary: "Lista pedidos abertos", security: [{ bearerAuth: [] }] },
    },
    "/orders/{id}": {
      get: { tags: ["Orders"], summary: "Busca pedido por id", security: [{ bearerAuth: [] }] },
    },
    "/orders/{id}/items": {
      post: { tags: ["Orders"], summary: "Adiciona item ao pedido", security: [{ bearerAuth: [] }] },
    },
    "/orders/{id}/items/{itemId}": {
      put: { tags: ["Orders"], summary: "Atualiza item do pedido", security: [{ bearerAuth: [] }] },
      delete: { tags: ["Orders"], summary: "Remove item do pedido", security: [{ bearerAuth: [] }] },
    },
    "/orders/{id}/status": {
      put: { tags: ["Orders"], summary: "Atualiza status do pedido", security: [{ bearerAuth: [] }] },
    },
    "/orders/{id}/close": {
      post: { tags: ["Orders"], summary: "Fecha pedido e registra pagamento", security: [{ bearerAuth: [] }] },
    },

    "/reports/sales": {
      get: { tags: ["Reports"], summary: "Relatorio de vendas", security: [{ bearerAuth: [] }] },
    },
    "/reports/top-products": {
      get: { tags: ["Reports"], summary: "Top produtos", security: [{ bearerAuth: [] }] },
    },
    "/reports/payments": {
      get: { tags: ["Reports"], summary: "Relatorio de pagamentos", security: [{ bearerAuth: [] }] },
    },
    "/reports/orders-by-type": {
      get: { tags: ["Reports"], summary: "Pedidos por tipo", security: [{ bearerAuth: [] }] },
    },
  },
};

module.exports = { swaggerDocument };
