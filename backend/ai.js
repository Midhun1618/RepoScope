import axios from "axios";

export async function interpretWithAI(summary) {
  console.log("AI Key Present:", !!process.env.OPENAI_API_KEY);

  const prompt = `
You are a senior software architect.

Return ONLY valid JSON.
Do NOT include markdown.
Do NOT include explanations.
Do NOT include code fences.

Return exactly this structure:

{
  "development_pattern": "string",
  "maintainability_outlook": "string",
  "improvement_suggestions": ["string", "string", "string"]
}

Repository Summary:
${JSON.stringify(summary)}
`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: "You strictly output valid JSON only." },
          { role: "user", content: prompt }
        ],
        temperature: 0.4
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "RepoScope"
        },
        timeout: 20000
      }
    );

    const raw = response.data.choices[0].message.content.trim();

    console.log("AI Raw Output:", raw);

    // Extract JSON safely even if extra text appears
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No JSON object found in AI response.");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return parsed;

  } catch (err) {
    console.warn("AI Processing Error:", err.message);

    return {
      development_pattern: "AI response formatting issue.",
      maintainability_outlook: "Unable to evaluate.",
      improvement_suggestions: [
        "Ensure consistent commit patterns.",
        "Increase refactoring activity.",
        "Consider adding collaborative reviews."
      ]
    };
  }
}