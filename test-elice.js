
require("dotenv").config();

const url =
  "https://mlapi.run/286e9158-d32e-436d-a23d-36b43fc8e68a/v1/chat/completions";

async function testElice() {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing from .env");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: `Bearer ${process.env.API_KEY}`
    },
    body: JSON.stringify({
      model: "openai/gpt-5.6-luna",
      messages: [
        {
          role: "user",
          content: "Reply with exactly: Hello from Pitchku AI"
        }
      ]
    })
  });

  const text = await response.text();

  console.log("HTTP status:", response.status);
  console.log("Response:", text);
}

testElice().catch((error) => {
  console.error("Test failed:", error.message);
});