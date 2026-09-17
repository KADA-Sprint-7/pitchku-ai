const { z } = require("zod");

const VisualTypeSchema = z.enum([
  "none",
  "stock_image",
  "illustration",
  "icon",
  "chart",
  "diagram"
]);

const VisualSchema = z.object({
  type: VisualTypeSchema,
  description: z.string().default("")
});

const SlideSchema = z.object({
  title: z.string(),
  subtitle: z.string().default(""),
  content: z.array(z.string()).min(1),
  visual: VisualSchema
});

const DeckPayloadSchema = z.object({
  title: z.string(),
  type: z.string(),
  language: z.string(),
  slides: z.array(SlideSchema).min(1)
});

module.exports = {
  VisualTypeSchema,
  VisualSchema,
  SlideSchema,
  DeckPayloadSchema
};