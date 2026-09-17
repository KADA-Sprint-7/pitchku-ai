const OllamaProvider = require("./ollama.provider");

function createAIProvider() {
  const provider =
    process.env.AI_PROVIDER || "ollama";

  if (provider === "ollama") {
    return new OllamaProvider();
  }

  throw new Error(
    `Unsupported AI provider: ${provider}`
  );
}

module.exports = {
  createAIProvider
};