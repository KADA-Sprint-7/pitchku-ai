const OllamaProvider = require("./ollama.provider");

function createAIProvider() {
  const provider = process.env.AI_PROVIDER || "ollama";

  switch (provider) {
    case "ollama":
      return new OllamaProvider();

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

module.exports = {
  createAIProvider
};
