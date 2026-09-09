const { z } = require("zod");

const VisualSchema = z.object({
  type: z.enum([
    "none",
    "stock_image",
    "illustration",
    "icon",
    "chart",
    "diagram"
  ]),

  searchQuery: z.string().optional(),

  concept: z.string().optional(),

  reason: z.string().optional()
});

const SlideSchema = z.object({
  id: z.string(),

  order: z.number().int().positive(),

  type: z.string(),

  layout: z.string(),

  title: z.string(),

  subtitle: z.string().optional(),

  content: z.array(z.string()).default([]),

  visual: VisualSchema.optional()
});

const DeckSchema = z.object({
  title: z.string(),

  type: z.string(),

  language: z.string().default("id-ID"),

  slides: z.array(SlideSchema).min(1)
});

module.exports = {
  DeckSchema,
  SlideSchema,
  VisualSchema
};
