const express = require("express");

const router = express.Router();

function createDeckRoutes(deckController) {
  router.post("/generate", deckController.generate);

  return router;
}

module.exports = createDeckRoutes;
