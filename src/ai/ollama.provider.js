const AIProvider = require("./ai.provider");

class OllamaProvider extends AIProvider {
  constructor() {
    super();

    this.baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    this.model = process.env.OLLAMA_MODEL || "qwen3:8b";
  }

  async generate({ system, prompt }) {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        model: this.model,

        messages: [
          {
            role: "system",
            content: system
          },
          {
            role: "user",
            content: prompt
          }
        ],

        stream: false,

        format: "json"
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    const data = await response.json();

    return data.message.content;
  }
}

module.exports = OllamaProvider;
