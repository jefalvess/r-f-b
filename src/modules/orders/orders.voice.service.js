const { ZodError } = require("zod");

const { AppError } = require("../../common/AppError");
const { registerLog } = require("../../common/logService");
const { Product } = require("../../models");
const { parseVoiceOrderAudio } = require("./orders.ai.gateway");
const { aiParsedOrderSchema, voiceParseResponseSchema, voiceUploadFileSchema } = require("./orders.voice.schema");

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function removeEmptyFields(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    })
  );
}

function findBestProductMatch(spokenName, products) {
  const normalizedSpoken = normalizeText(spokenName);
  if (!normalizedSpoken) return null;

  const exact = products.find((product) => normalizeText(product.name) === normalizedSpoken);
  if (exact) return exact;

  const includes = products.find((product) => {
    const normalizedProduct = normalizeText(product.name);
    return normalizedProduct.includes(normalizedSpoken) || normalizedSpoken.includes(normalizedProduct);
  });

  return includes || null;
}

async function parseOrderFromVoice(file, userId) {
  try {
    if (!file) {
      throw new AppError("Arquivo de audio obrigatorio no campo file", 400);
    }

    voiceUploadFileSchema.parse(file);

    const aiRaw = await parseVoiceOrderAudio({
      audioBuffer: file.buffer,
      mimeType: file.mimetype,
      fileName: file.originalname,
    });

    const aiParsed = aiParsedOrderSchema.parse(aiRaw);
    const products = await Product.find({ active: true }).select("_id name price").lean();

    const items = aiParsed.items.map((item) => {
      const matchedProduct = findBestProductMatch(item.productName, products);
      const quantity = Number(item.quantity || 1);

      if (!matchedProduct) {
        return removeEmptyFields({
          productName: item.productName,
          quantity,
          notes: item.notes,
        });
      }

      const unitPrice = Number(matchedProduct.price);
      const total = Number((unitPrice * quantity).toFixed(2));

      return removeEmptyFields({
        productId: matchedProduct._id.toString(),
        productName: matchedProduct.name,
        quantity,
        unitPrice,
        total,
        notes: item.notes,
      });
    });

    const response = removeEmptyFields({
      type: aiParsed.type,
      customerName: aiParsed.customerName,
      customerPhone: aiParsed.customerPhone,
      customerAddress: aiParsed.customerAddress,
      items,
      transcript: aiParsed.transcript,
    });

    const safeResponse = voiceParseResponseSchema.parse(response);

    await registerLog({
      entity: "orders_voice_parse",
      entityId: null,
      action: "success",
      payload: {
        itemsCount: safeResponse.items.length,
        hasType: Boolean(safeResponse.type),
        hasCustomerName: Boolean(safeResponse.customerName),
      },
      userId,
    });

    return safeResponse;
  } catch (error) {
    await registerLog({
      entity: "orders_voice_parse",
      entityId: null,
      action: "error",
      payload: {
        message: error?.message,
        name: error?.name,
      },
      userId,
    });

    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof ZodError) {
      throw new AppError("Nao foi possivel interpretar o audio. Fale novamente com mais clareza.", 422);
    }

    throw new AppError("Falha ao processar audio do pedido. Tente novamente.", 500);
  }
}

module.exports = {
  parseOrderFromVoice,
};
