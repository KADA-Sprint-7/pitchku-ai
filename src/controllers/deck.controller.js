class DeckController {
  constructor(deckService) {
    this.deckService = deckService;
  }

  generate = async (req, res) => {
    try {
      const { business, goal } = req.body;

      if (!business || !goal) {
        return res.status(400).json({
          error: "business and goal are required"
        });
      }

      const deck = await this.deckService.generateDeck({
        business,
        goal
      });

      res.json(deck);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to generate deck"
      });
    }
  };
}

module.exports = DeckController;
