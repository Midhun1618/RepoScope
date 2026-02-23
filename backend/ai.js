import axios from "axios";

export async function interpretWithAI(summary) {
  console.log("AI Key Present:", !!process.env.OPENAI_API_KEY);
  const prompt = `
Analyze this repository summary:

${JSON.stringify(summary)}

Provide:
- Development pattern
- Maintainability outlook
- 3 improvement suggestions

Return JSON only.
`;

  const response = await axios.post(
  "https://openrouter.ai/api/v1/chat/completions",
  {
    model: "openai/gpt-oss-120b",
    messages: [
      { role: "system", content: "You are a senior software architect." },
      { role: "user", content: prompt }
    ]
  },
  {
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "RepoScope"
    }
  }
);

try {
  return JSON.parse(response.data.choices[0].message.content);
} catch (err) {
  console.warn("AI returned invalid JSON");
  return {
    development_pattern: "AI output formatting issue.",
    maintainability_outlook: "Unavailable.",
    improvement_suggestions: []
  };
}
}