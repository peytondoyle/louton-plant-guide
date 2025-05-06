import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { plantName, detailedName, recordId } = req.body;

  if (!plantName || !recordId) {
    return res.status(400).json({ error: "Missing plant name or Airtable record ID" });
  }

  try {
    const query = [plantName, detailedName].filter(Boolean).join(" ");

    const openAIResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
You are a plant encyclopedia. Given a plant name and optional cultivar, return estimated mature growth characteristics.

Respond with valid JSON only. Use approximate or average mature size values. Always use:
- inches for width and spacing
- feet (decimal ok) for height
- Only these three values for "Type": "Annual", "Perennial", or "Produce"
– For "Expected bloom" choose "Early", "Mid" or "Late" then a month

Units must be numeric and based on horticultural sources.

Example format:
{
  "Type": "Perennial",
  "Growth": "Moderate",
  "Width": 36,
  "Height": 5,
  "Spacing": 30,
  "Pruning": "Prune in late winter before new growth",
  "Expected bloom": "Mid June"
}
`.trim()
          },
          {
            role: "user",
            content: `Plant: "${query}"`
          }
        ],
        temperature: 0.6,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let raw = openAIResponse.data.choices?.[0]?.message?.content?.trim() || "";
    const cleanJSON = raw.replace(/```json|```/g, "").trim();

    let plantData;
    try {
      plantData = JSON.parse(cleanJSON);
    } catch (err) {
      console.error("❌ JSON parse failed:", err, "\nRaw response:", raw);
      return res.status(500).json({ error: "OpenAI returned invalid JSON." });
    }

    const convertToInches = (val) => {
      if (!val || isNaN(val)) return null;
      return Number(val > 12 ? val : (val * 12).toFixed(1));
    };

    const sanitizeType = (input) => {
      const lower = input?.toLowerCase() || "";
      if (lower.includes("annual")) return "Annual";
      if (lower.includes("perennial")) return "Perennial";
      if (lower.includes("vegetable") || lower.includes("produce") || lower.includes("fruit")) return "Produce";
      return "Other";
    };

    const fields = {
      Type: sanitizeType(plantData.Type),
      Growth: plantData.Growth || "Moderate",
      "Width in inches": convertToInches(plantData.Width),
      "Height in inches": convertToInches(plantData.Height),
      "Space in inches": convertToInches(plantData.Spacing),
      Pruning: plantData.Pruning || "N/A",
      "Expected bloom": plantData["Expected bloom"] || "Unknown",
    };

    const airtableResponse = await axios.patch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_NAME}`,
      {
        records: [
          {
            id: recordId,
            fields,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({ success: true, airtableData: airtableResponse.data });

  } catch (error) {
    console.error("🔥 Error in fillPlantData:", error.response?.data || error.message, error);
    return res.status(500).json({ error: error.response?.data || error.message });
  }
}