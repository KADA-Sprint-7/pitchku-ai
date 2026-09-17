const {
  DeckPayloadSchema
} = require("../schemas/deck.schema");

const ALLOWED_VISUAL_TYPES = new Set([
  "none",
  "stock_image",
  "illustration",
  "icon",
  "chart",
  "diagram"
]);

class DeckService {
  constructor(aiProvider) {
    this.aiProvider = aiProvider;
  }

  async generateDeck({
    business,
    goal,
    language = "id-ID"
  }) {
    this.validateBusiness(business);
    this.validateGoal(goal);

    const prompt = this.buildPrompt({
      business,
      goal,
      language
    });

    const aiResponse = await this.callAI(prompt);

    const parsedResponse = this.parseAIResponse(aiResponse);

    console.log(
      "Parsed AI response:",
      JSON.stringify(parsedResponse, null, 2)
    );

    const normalizedResponse =
      this.normalizeDeck(parsedResponse, language);

    const validationResult =
      DeckPayloadSchema.safeParse(normalizedResponse);

    if (!validationResult.success) {
      console.error(
        "Deck validation failed:",
        JSON.stringify(
          validationResult.error.issues,
          null,
          2
        )
      );

      throw new Error(
        `AI returned an invalid DeckPayload structure: ${JSON.stringify(
          validationResult.error.issues
        )}`
      );
    }

    return validationResult.data;
  }

  validateBusiness(business) {
    if (
      !business ||
      typeof business !== "object" ||
      Array.isArray(business)
    ) {
      throw new Error(
        "Invalid business context: business must be an object."
      );
    }

    if (
      !business.name ||
      typeof business.name !== "string"
    ) {
      throw new Error(
        "Invalid business context: business.name is required."
      );
    }
  }

  validateGoal(goal) {
    if (!goal || typeof goal !== "string") {
      throw new Error(
        "Invalid goal: goal is required and must be a string."
      );
    }
  }

  buildPrompt({
    business,
    goal,
    language
  }) {
    const isIndonesian = language !== "en-US";

    const languageInstruction = isIndonesian
      ? `
Tulis seluruh presentasi dalam Bahasa Indonesia.
Gunakan Bahasa Indonesia yang natural, profesional,
jelas, dan cocok untuk pemilik usaha kecil di Indonesia.
`
      : `
Write the entire presentation in natural,
professional English.
`;

    return `
You are an expert business presentation designer.

Create a complete business presentation deck.

BUSINESS INFORMATION:
${JSON.stringify(business, null, 2)}

BUSINESS GOAL:
${goal}

LANGUAGE:
${language}

LANGUAGE INSTRUCTION:
${languageInstruction}

RETURN ONLY VALID JSON.
Do not return Markdown.
Do not return explanations.
Do not wrap the JSON in code fences.

The response MUST follow this exact structure:

{
  "title": "string",
  "type": "company_profile",
  "language": "${language}",
  "slides": [
    {
      "title": "string",
      "subtitle": "string",
      "content": ["string"],
      "visual": {
        "type": "none",
        "description": "string"
      }
    }
  ]
}

MANDATORY RULES:

1. The slides field MUST be an array.
2. The slides array MUST contain exactly 10 slides.
3. Never return an empty slides array.
4. Every slide MUST have:
   - title
   - subtitle
   - content
   - visual
5. content MUST be an array with at least 2 strings.
6. visual.type MUST be exactly one of:
   - none
   - stock_image
   - illustration
   - icon
   - chart
   - diagram
7. Never use:
   - image
   - photo
   - picture
   - graphic
   - infographic
   - photograph
8. If a visual is unnecessary, use:
   {
     "type": "none",
     "description": ""
   }

Create exactly these 10 slides:

1. Business overview
2. Business problem or opportunity
3. Target customers
4. Products or services
5. Current business situation
6. Unique selling proposition
7. Marketing strategy
8. Sales growth strategy
9. Action plan and expected results
10. Conclusion

Make every slide specific to the supplied business.
Do not leave slides empty.
Do not use placeholder text.
`;
  }

  async callAI(prompt) {
    if (!this.aiProvider) {
      throw new Error("AI provider is not configured.");
    }

    if (typeof this.aiProvider.generate === "function") {
      return await this.aiProvider.generate(prompt);
    }

    if (typeof this.aiProvider.complete === "function") {
      return await this.aiProvider.complete(prompt);
    }

    if (typeof this.aiProvider.chat === "function") {
      return await this.aiProvider.chat(prompt);
    }

    throw new Error(
      "AI provider must implement generate(), complete(), or chat()."
    );
  }

  parseAIResponse(aiResponse) {
    if (!aiResponse) {
      throw new Error("AI returned an empty response.");
    }

    if (typeof aiResponse === "object") {
      if (aiResponse.message?.content) {
        return this.parseAIResponse(
          aiResponse.message.content
        );
      }

      if (aiResponse.response) {
        return this.parseAIResponse(
          aiResponse.response
        );
      }

      return aiResponse;
    }

    if (typeof aiResponse !== "string") {
      throw new Error(
        "AI response must be a string or object."
      );
    }

    let cleanedResponse = aiResponse.trim();

    cleanedResponse = cleanedResponse
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const firstBrace = cleanedResponse.indexOf("{");
    const lastBrace = cleanedResponse.lastIndexOf("}");

    if (
      firstBrace !== -1 &&
      lastBrace !== -1 &&
      lastBrace > firstBrace
    ) {
      cleanedResponse = cleanedResponse.slice(
        firstBrace,
        lastBrace + 1
      );
    }

    try {
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error(
        "Invalid raw AI response:",
        cleanedResponse
      );

      throw new Error("AI returned invalid JSON.");
    }
  }

  normalizeDeck(deck, requestedLanguage) {
    if (!deck || typeof deck !== "object") {
      throw new Error(
        "AI response must be a deck object."
      );
    }

    let slides = Array.isArray(deck.slides)
      ? deck.slides
      : [];

    /*
     * If the AI accidentally returns:
     *
     * {
     *   "deck": {
     *     "slides": [...]
     *   }
     * }
     *
     * support that structure too.
     */
    if (
      slides.length === 0 &&
      deck.deck &&
      Array.isArray(deck.deck.slides)
    ) {
      slides = deck.deck.slides;
    }

    if (slides.length === 0) {
      throw new Error(
        "AI returned no slides. The AI response must contain at least one slide."
      );
    }

    const normalizedSlides = slides.map(
      (slide, index) => {
        const safeSlide =
          slide &&
          typeof slide === "object"
            ? slide
            : {};

        const rawVisual =
          safeSlide.visual &&
          typeof safeSlide.visual === "object"
            ? safeSlide.visual
            : {};

        const rawVisualType =
          typeof rawVisual.type === "string"
            ? rawVisual.type.trim().toLowerCase()
            : "none";

        const visualType =
          ALLOWED_VISUAL_TYPES.has(rawVisualType)
            ? rawVisualType
            : "none";

        let content = [];

        if (Array.isArray(safeSlide.content)) {
          content = safeSlide.content
            .filter(
              (item) =>
                item !== null &&
                item !== undefined
            )
            .map((item) => String(item));
        } else if (
          safeSlide.content !== null &&
          safeSlide.content !== undefined
        ) {
          content = [String(safeSlide.content)];
        }

        if (content.length === 0) {
          content = [
            "Informasi bisnis akan dikembangkan berdasarkan konteks usaha.",
            "Strategi dapat disesuaikan dengan kebutuhan dan target pelanggan."
          ];
        }

        return {
          title:
            typeof safeSlide.title === "string" &&
            safeSlide.title.trim().length > 0
              ? safeSlide.title
              : `Slide ${index + 1}`,

          subtitle:
            typeof safeSlide.subtitle === "string"
              ? safeSlide.subtitle
              : "",

          content,

          visual: {
            type: visualType,
            description:
              typeof rawVisual.description === "string"
                ? rawVisual.description
                : ""
          }
        };
      }
    );

    return {
      title:
        typeof deck.title === "string" &&
        deck.title.trim().length > 0
          ? deck.title
          : "Business Presentation",

      type:
        typeof deck.type === "string" &&
        deck.type.trim().length > 0
          ? deck.type
          : "company_profile",

      language:
        typeof deck.language === "string" &&
        deck.language.trim().length > 0
          ? deck.language
          : requestedLanguage,

      slides: normalizedSlides
    };
  }
}

module.exports = DeckService;