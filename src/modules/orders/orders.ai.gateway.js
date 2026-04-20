const { AppError } = require("../../common/AppError");

const DEFAULT_TIMEOUT_MS = Number(process.env.VOICE_PARSE_AI_TIMEOUT_MS || 20000);
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_MODELS_FALLBACK = (
  process.env.GEMINI_MODELS_FALLBACK || "gemini-2.5-flash,gemini-2.0-flash,gemini-1.5-flash-latest,gemini-1.5-flash"
)
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);

function buildAbortSignal(timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(timeout) };
}

function parseJsonContent(raw) {
  if (!raw) return {};

  const clean = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(clean);
}

function buildOrderExtractionPrompt() {
  return [
    "Voce extrai dados de pedidos de restaurante.",
    "Responda SOMENTE JSON valido.",
    "Nunca invente itens.",
    "Formato esperado:",
    "{",
    '  "type": "delivery|retirada|balcao|mesa",',
    '  "customerName": "string opcional",',
    '  "customerPhone": "string opcional",',
    '  "customerAddress": "string opcional",',
    '  "items": [{ "productName": "string", "quantity": number, "notes": "string opcional" }],',
    '  "transcript": "texto transcrito opcional"',
    "}",
  ].join("\n");
}

async function fetchWithTimeout(url, options, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const { signal, clear } = buildAbortSignal(timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal,
    });

    return response;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new AppError("Tempo limite ao processar audio", 504);
    }
    throw error;
  } finally {
    clear();
  }
}

function extractGeminiText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts || [];
  const text = parts
    .map((part) => part?.text)
    .filter(Boolean)
    .join("\n")
    .trim();

  if (!text) {
    throw new AppError("Resposta invalida do provedor de IA", 502);
  }

  return text;
}

function buildGeminiBodies({ prompt, mimeType, base64Audio }) {
  const contentSnakeCase = {
    role: "user",
    parts: [
      { text: prompt },
      {
        inline_data: {
          mime_type: mimeType,
          data: base64Audio,
        },
      },
    ],
  };

  const contentCamelCase = {
    role: "user",
    parts: [
      { text: prompt },
      {
        inlineData: {
          mimeType,
          data: base64Audio,
        },
      },
    ],
  };

  return [
    {
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
      contents: [contentSnakeCase],
    },
    {
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
      contents: [contentCamelCase],
    },
    {
      generationConfig: {
        temperature: 0,
      },
      contents: [contentCamelCase],
    },
    {
      generationConfig: {
        temperature: 0,
      },
      contents: [contentSnakeCase],
    },
  ];
}

function buildGeminiModelCandidates() {
  const seen = new Set();
  const ordered = [GEMINI_MODEL, ...GEMINI_MODELS_FALLBACK];

  return ordered.filter((model) => {
    if (!model || seen.has(model)) return false;
    seen.add(model);
    return true;
  });
}

async function requestGeminiGenerateContent({ apiKey, body, model }) {
  const response = await fetchWithTimeout(`${GEMINI_BASE_URL}/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    return { ok: true, payload: await response.json() };
  }

  const errorText = await response.text();
  return {
    ok: false,
    status: response.status,
    model,
    errorText,
  };
}

async function parseVoiceOrderAudioWithGemini({ apiKey, audioBuffer, mimeType }) {
  const prompt = [
    buildOrderExtractionPrompt(),
    "Use o audio enviado para transcrever e preencher os campos.",
    "Se um campo nao for informado, omita.",
    "Se um produto aparecer mais de uma vez com observacoes diferentes, mantenha itens separados.",
  ].join("\n\n");

  const base64Audio = audioBuffer.toString("base64");
  const bodies = buildGeminiBodies({ prompt, mimeType, base64Audio });
  const modelCandidates = buildGeminiModelCandidates();
  let lastError = null;

  for (const model of modelCandidates) {
    for (const body of bodies) {
      const result = await requestGeminiGenerateContent({ apiKey, body, model });
      if (result.ok) {
        const content = extractGeminiText(result.payload);
        return parseJsonContent(content);
      }

      lastError = result;
    }
  }

  const safeErrorText = String(lastError?.errorText || "").slice(0, 500);
  // eslint-disable-next-line no-console
  console.error("Gemini generateContent falhou", {
    status: lastError?.status,
    model: lastError?.model || GEMINI_MODEL,
    modelsTried: modelCandidates,
    response: safeErrorText,
  });

  throw new AppError("Falha ao interpretar pedido por voz", 502);
}

async function parseVoiceOrderAudio({ audioBuffer, mimeType }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError("Servico de processamento de audio indisponivel", 503);
  }

  return parseVoiceOrderAudioWithGemini({
    apiKey,
    audioBuffer,
    mimeType,
  });
}

module.exports = {
  parseVoiceOrderAudio,
};
