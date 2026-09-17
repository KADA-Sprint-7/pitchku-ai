
const OllamaProvider = require("./ollama.provider");
const EliceProvider = require("./elice.provider");

function createAIProvider() {
  const provider =
    process.env.AI_PROVIDER || "ollama";

  if (provider === "ollama") {
    return new OllamaProvider();
  }

  if (provider === "elice") {
    return new EliceProvider();
  }

  throw new Error(
    `Unsupported AI provider: ${provider}`
  );
}

module.exports = {
  createAIProvider
};