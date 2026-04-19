const { z } = require("zod");

const periodQuerySchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
  }),
});

module.exports = { periodQuerySchema };
