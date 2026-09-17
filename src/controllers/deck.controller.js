class DeckController {
  constructor(deckService) {
    this.deckService = deckService;
  }

  generate = async (req, res) => {
    try {
      const { business, goal } = req.body;

      if (!business || typeof business !== "object") {
        return res.status(400).json({
          error: "Invalid business context",
          detail:
            "The business field is required and must be an object.",
        });
      }

      if (!goal || typeof goal !== "string") {
        return res.status(400).json({
          error: "Invalid goal",
          detail:
            "The goal field is required and must be a string.",
        });
      }

      const deck = await this.deckService.generateDeck({
        business,
        goal,
      });

      return res.status(200).json(deck);
    } catch (error) {
      console.error("Deck generation failed:");
      console.error(error);

      return res.status(500).json({
        error: "Failed to generate deck",
        detail: error.message,
      });
    }
  };
}

module.exports = DeckController;