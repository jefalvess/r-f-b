const ORDER_STATUS_FLOW = {
  aberto: ["enviado_cozinha", "cancelado"],
  enviado_cozinha: ["preparando", "cancelado"],
  preparando: ["pronto", "cancelado"],
  pronto: ["saiu_entrega", "entregue", "cancelado"],
  saiu_entrega: ["entregue", "cancelado"],
  entregue: ["pago", "cancelado"],
  pago: [],
  cancelado: [],
};

module.exports = {
  ORDER_STATUS_FLOW,
};
