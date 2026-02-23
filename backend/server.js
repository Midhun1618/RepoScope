import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { fetchRepositoryData } from "./github.js";
import { analyzeRepository } from "./analyzer.js";
import { interpretWithAI } from "./ai.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl)
      return res.status(400).json({ error: "Repository URL required." });

    const repoData = await fetchRepositoryData(repoUrl);
    const { metrics, scores } = analyzeRepository(repoData);

    const aiInsights = await interpretWithAI({
      ...metrics.summary,
      ...scores
    });

    res.json({
      overview: repoData.overview,
      owner: repoData.owner,
      metrics,
      scores,
      ai_insights: aiInsights
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});