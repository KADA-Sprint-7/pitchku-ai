const { DeckSchema } = require("../schemas/deck.schema");

class DeckService {
  constructor(aiProvider) {
    this.aiProvider = aiProvider;
  }

  async generateDeck({ business, goal }) {
    const system = `
You are Pitchku's AI business presentation strategist.

Pitchku helps Indonesian UMKM and small businesses create
professional business presentations.

Your job is to transform a user's business information and goal
into a useful presentation structure.

First understand the user's business goal and determine the most
appropriate presentation type.

Possible presentation types include:

- company_profile
- business_partnership
- sales_pitch
- freelance_pitch
- product_pitch
- investor_pitch
- proposal
- service_offer

For a normal business presentation, aim for around 8-10 slides.
However, do NOT force the presentation to always have exactly
8-10 slides. Use fewer or more slides when the content requires it.

Return ONLY valid JSON.

The JSON must follow this structure:

{
  "title": "string",
  "type": "string",
  "language": "id-ID",
  "slides": [
    {
      "id": "slide_01",
      "order": 1,
      "type": "string",
      "layout": "string",
      "title": "string",
      "subtitle": "string",
      "content": ["string"],
      "visual": {
        "type": "stock_image",
        "searchQuery": "string",
        "concept": "string",
        "reason": "string"
      }
    }
  ]
}

Visual recommendations should describe what kind of stock
image or visual would help communicate the slide.

Do not invent specific business facts that were not provided.
`;

    const prompt = `
Business information:

${JSON.stringify(business, null, 2)}

Business goal:

${goal}

Create the most appropriate presentation for this business goal.
`;

    const rawResult = await this.aiProvider.generate({
      system,
      prompt
    });

    let parsed;

    try {
      parsed = JSON.parse(rawResult);
    } catch (error) {
      throw new Error("AI returned invalid JSON");
    }

    const validation = DeckSchema.safeParse(parsed);

    if (!validation.success) {
      console.error(validation.error);

      throw new Error("AI returned an invalid deck structure");
    }

    return validation.data;
  }
}

module.exports = DeckService;
