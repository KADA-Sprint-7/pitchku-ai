class OllamaProvider {
  constructor() {
    this.baseUrl =
      process.env.OLLAMA_BASE_URL ||
      "http://127.0.0.1:11434";

    this.model =
      process.env.OLLAMA_MODEL ||
      "llama3.1";
  }

  async generate(prompt) {
    const response = await fetch(
      `${this.baseUrl}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          format: "json",
          options: {
            temperature: 0.2,
            num_predict: 12000
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Ollama request failed: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error(
        "Ollama returned no response text."
      );
    }

    return data.response;
  }
}

module.exports = OllamaProvider;