require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { createAIProvider } = require("./ai");
const DeckService = require("./services/deck.service");
const DeckController = require("./controllers/deck.controller");
const createDeckRoutes = require("./routes/deck.routes");

const app = express();

app.use(cors());
app.use(express.json());

const aiProvider = createAIProvider();

const deckService = new DeckService(aiProvider);

const deckController = new DeckController(deckService);

app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    service: "pitchku-ai"
  });
});

app.use(
  "/api/v1/decks",
  createDeckRoutes(deckController)
);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Pitchku AI running on port ${PORT}`);
});
