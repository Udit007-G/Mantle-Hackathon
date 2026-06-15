require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

console.log(
  "API KEY EXISTS:",
  !!process.env.GEMINI_API_KEY
);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

app.post("/analyze", async (req, res) => {
  try {

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: "Token is required"
      });
    }

    const prompt = `
You are a professional crypto alpha analyst.

Analyze ${token}.

Return ONLY valid JSON in exactly this format:

{
  "token":"${token}",
  "alphaScore":75,
  "risk":"Medium",
  "bullishFactors":["factor1","factor2"],
  "bearishFactors":["factor1","factor2"],
  "recommendation":"short recommendation"
}
`;

    let response;
    let lastError;

    for (let i = 0; i < 3; i++) {
      try {

        response =
          await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });

        break;

      } catch (err) {

        lastError = err;

        console.error(
          `Attempt ${i + 1} failed:`,
          err.message
        );

        await new Promise(resolve =>
          setTimeout(resolve, 2000)
        );
      }
    }

    if (!response) {
      throw lastError;
    }

    res.json({
      result: response.text,
    });

  } catch (err) {

    console.error(
      "ANALYZE ERROR:",
      err
    );

    res.status(500).json({
      error:
        err?.message ||
        "AI service temporarily unavailable"
    });
  }
});

module.exports = app;