const { z } = require("zod");

const { ACCEPTED_AUDIO_MIME_TYPES, MAX_AUDIO_FILE_SIZE } = require("./orders.voice.upload");

const orderTypes = ["mesa", "balcao", "retirada", "delivery"];

const voiceUploadFileSchema = z.object({
  fieldname: z.literal("file"),
  originalname: z.string().min(1),
  mimetype: z.enum(ACCEPTED_AUDIO_MIME_TYPES),
  size: z.number().int().positive().max(MAX_AUDIO_FILE_SIZE),
  buffer: z.instanceof(Buffer),
});

const aiParsedItemSchema = z.object({
  productName: z.string().trim().min(1),
  quantity: z.coerce.number().int().positive().default(1),
  notes: z.string().trim().optional(),
});

const aiParsedOrderSchema = z.object({
  type: z.enum(orderTypes).optional(),
  customerName: z.string().trim().optional(),
  customerPhone: z.string().trim().optional(),
  customerAddress: z.string().trim().optional(),
  items: z.array(aiParsedItemSchema).default([]),
  transcript: z.string().trim().optional(),
});

const voiceParseItemSchema = z.object({
  productId: z.string().trim().min(1).optional(),
  productName: z.string().trim().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive().optional(),
  total: z.number().positive().optional(),
  notes: z.string().trim().optional(),
});

const voiceParseResponseSchema = z.object({
  type: z.enum(orderTypes).optional(),
  customerName: z.string().trim().optional(),
  customerPhone: z.string().trim().optional(),
  customerAddress: z.string().trim().optional(),
  items: z.array(voiceParseItemSchema),
  transcript: z.string().trim().optional(),
});

module.exports = {
  voiceUploadFileSchema,
  aiParsedOrderSchema,
  voiceParseResponseSchema,
};
