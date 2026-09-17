
class EliceProvider {
  constructor() {
    this.apiKey = process.env.API_KEY;

    this.baseUrl =
      "https://mlapi.run/286e9158-d32e-436d-a23d-36b43fc8e68a";

    this.model = "gpt-5.6-luna";
  }

  async generate(prompt) {
    if (!this.apiKey) {
      throw new Error(
        "API_KEY is missing from environment variables."
      );
    }

    const response = await fetch(
      `${this.baseUrl}/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Elice API request failed: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();

    const content =
      data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(
        "Elice API returned no response content."
      );
    }

    return content;
  }
}

module.exports = EliceProvider;