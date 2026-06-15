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

    const prompt = `
You are a professional crypto alpha analyst.

Analyze ${token}.

Return ONLY valid JSON.

{
  "token":"${token}",
  "alphaScore":0,
  "risk":"Low",
  "bullishFactors":["factor1","factor2"],
  "bearishFactors":["factor1","factor2"],
  "recommendation":"short recommendation"
}
`;

    let response;
    let retries = 3;

    while (retries > 0) {
    try {

        response =
        await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        break;

    } catch (err) {

        retries--;

        if (retries === 0) {
        throw err;
        }

        await new Promise(resolve =>
        setTimeout(resolve, 2000)
        );
    }
    }

    res.json({
      result: response.text,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
    error:
        "AI service temporarily busy. Please try again in a few seconds."
    });

  }
});

module.exports = app;