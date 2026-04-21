/**
 * Teste de carga k6 — Sistema Restaurante
 *
 * Fluxo por VU:
 *   1. Login (obtém token)
 *   2. Cria pedido
 *   3. Adiciona 3 itens ao pedido
 *
 * Meta: ~10.000 pedidos criados com 3 itens cada
 *
 * Como rodar:
 *   k6 run test-de-carga.js
 *
 * Variáveis de ambiente (opcional):
 *   k6 run -e BASE_URL=http://localhost:3000 \
 *           -e USERNAME=admin \
 *           -e PASSWORD=123456 \
 *           -e PRODUCT_ID=SEU_PRODUCT_ID \
 *           test-de-carga.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

// ──────────────────────────────────────────
// Métricas customizadas
// ──────────────────────────────────────────
const pedidosCriados     = new Counter("pedidos_criados");
const itensAdicionados   = new Counter("itens_adicionados");
const errosCriacao       = new Counter("erros_criacao");
const errosItens         = new Counter("erros_itens");
const taxaErros          = new Rate("taxa_erros");
const duracaoCriar       = new Trend("duracao_criar_pedido_ms", true);
const duracaoAdicionarItem = new Trend("duracao_adicionar_item_ms", true);

// ──────────────────────────────────────────
// Configuração da carga
// Ramping progressivo para gerar 10k+ pedidos
// ──────────────────────────────────────────
export const options = {
  scenarios: {
    carga_pedidos: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m",  target: 20  },   // aquecimento
        { duration: "3m",  target: 50  },   // carga moderada
        { duration: "5m",  target: 100 },   // carga alta → ~10k pedidos
        { duration: "2m",  target: 50  },   // resfriamento
        { duration: "1m",  target: 0   },   // encerramento
      ],
    },
  },
  thresholds: {
    // Metas de qualidade
    http_req_duration:        ["p(95)<2000"],  // 95% das req em menos de 2s
    http_req_failed:          ["rate<0.05"],   // menos de 5% de erros HTTP
    taxa_erros:               ["rate<0.05"],
    duracao_criar_pedido_ms:  ["p(95)<1500"],
    duracao_adicionar_item_ms: ["p(95)<1500"],
  },
};

// ──────────────────────────────────────────
// Configuração
// ──────────────────────────────────────────
const BASE_URL   = __ENV.BASE_URL   || "http://localhost:3000";
const USERNAME   = __ENV.USERNAME   || "admin";
const PASSWORD   = __ENV.PASSWORD   || "123456";
const PRODUCT_ID = __ENV.PRODUCT_ID || "SUBSTITUA_PELO_ID_DO_PRODUTO";
const PRODUCT_IDS = (__ENV.PRODUCT_IDS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const HEADERS_JSON = { "Content-Type": "application/json" };

const ORDER_TYPES     = ["mesa", "balcao", "retirada", "delivery"];
const NOMES           = ["Ana", "Bruno", "Carlos", "Diana", "Eduardo", "Fernanda", "Gabriel"];
const NOTAS_ITEM      = ["sem sal", "bem passado", "ponto", "sem cebola", "extra queijo", ""];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ──────────────────────────────────────────
// Setup: valida conectividade antes de começar
// ──────────────────────────────────────────
export function setup() {
  if (!PRODUCT_ID && PRODUCT_IDS.length === 0) {
    console.error("Defina PRODUCT_ID ou PRODUCT_IDS para o teste de carga.");
  }

  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ userName: USERNAME, password: PASSWORD }),
    { headers: HEADERS_JSON }
  );

  check(res, { "login setup OK": (r) => r.status === 200 });

  if (res.status !== 200) {
    console.error(`[SETUP] Login falhou: ${res.status} — ${res.body}`);
    return { token: null };
  }

  return { token: res.json("token") };
}

// ──────────────────────────────────────────
// Função principal — executada por cada VU em loop
// ──────────────────────────────────────────
export default function (data) {
  if (!data?.token) {
    taxaErros.add(1);
    errosCriacao.add(1);
    sleep(1);
    return;
  }

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.token}`,
  };

  // ── 2. Criar pedido ───────────────────
  const tipo  = randomItem(ORDER_TYPES);
  const nome  = randomItem(NOMES);
  const mesa  = tipo === "mesa" ? `${randomInt(1, 20)}` : undefined;

  const orderBody = {
    type: tipo,
    customerName: nome,
    ...(tipo === "delivery" && {
      customerPhone: `21${randomInt(900000000, 999999999)}`,
      customerAddress: `Rua Teste ${randomInt(1, 999)}, nº ${randomInt(1, 100)}`,
    }),
    ...(tipo === "mesa" && { tableNumber: mesa }),
    notes: randomItem(["urgente", "cliente vip", "", "", ""]) || undefined,
  };

  const tCriarInicio = Date.now();
  const createRes = http.post(
    `${BASE_URL}/orders`,
    JSON.stringify(orderBody),
    { headers: authHeaders }
  );
  duracaoCriar.add(Date.now() - tCriarInicio);

  const createOk = check(createRes, {
    "pedido criado 201": (r) => r.status === 201,
    "pedido tem _id":    (r) => r.json("_id") !== undefined,
  });

  if (!createOk) {
    taxaErros.add(1);
    errosCriacao.add(1);
    console.error(`[CREATE] ${createRes.status}: ${createRes.body.substring(0, 200)}`);
    sleep(0.5);
    return;
  }

  pedidosCriados.add(1);
  const orderId = createRes.json("_id");

  // ── 3. Adicionar 3 itens ──────────────
  const itensDoPedido = PRODUCT_IDS.length > 0
    ? [
        PRODUCT_IDS[0],
        PRODUCT_IDS[1] || PRODUCT_IDS[0],
        PRODUCT_IDS[2] || PRODUCT_IDS[0],
      ]
    : [PRODUCT_ID, PRODUCT_ID, PRODUCT_ID];

  for (let i = 0; i < 3; i++) {
    const qty   = randomInt(1, 4);
    const price = randomItem([20, 22, 25, 26, 27]);
    const nota = randomItem(NOTAS_ITEM);

    const tAdicionarInicio = Date.now();
    const itemRes = http.post(
      `${BASE_URL}/orders/${orderId}/items`,
      JSON.stringify({
        productId: itensDoPedido[i],
        quantity:  qty,
        unitPrice: price,
        ...(nota && { notes: nota }),
      }),
      { headers: authHeaders }
    );
    duracaoAdicionarItem.add(Date.now() - tAdicionarInicio);

    check(itemRes, { "item adicionado 200": (r) => r.status === 200 });

    if (itemRes.status !== 200) {
      taxaErros.add(1);
      errosItens.add(1);
      console.error(`[ITEM] ${itemRes.status}: ${itemRes.body.substring(0, 200)}`);
    } else {
      itensAdicionados.add(1);
    }

    sleep(0.1);
  }

  taxaErros.add(0);

  sleep(randomInt(1, 3));
}

// ──────────────────────────────────────────
// Teardown: aviso final
// ──────────────────────────────────────────
export function teardown() {
  console.log("=== Teste de carga finalizado ===");
  console.log("Verifique as metricas: pedidos_criados e itens_adicionados");
}
