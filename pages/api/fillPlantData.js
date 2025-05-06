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
            content: `You are a horticulturist. Respond ONLY in valid JSON.`
          },
          {
            role: "user",
            content: `For the plant "${query}", return:

{
  "Type": "Perennial/Annual/Other",
  "Growth": "Slow/Moderate/Fast",
  "Width": 0,
  "Height": 0,
  "Spacing": 0,
  "Pruning": "Best time and method in one sentence",
  "Expected bloom": "Early April" // use Early/Mid/Late + Month
}

No markdown, no comments — only the JSON block.`
          }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let raw = openAIResponse.data.choices?.[0]?.message?.content?.trim() || "";

    // Strip any wrapping code fences
    const cleanJSON = raw.replace(/```json|```/g, "").trim();

    let plantData;
    try {
      plantData = JSON.parse(cleanJSON);
    } catch (err) {
      console.error("❌ JSON parse failed:", err, "\nRaw response:", raw);
      return res.status(500).json({ error: "OpenAI returned invalid JSON." });
    }

    const convertToFeet = (val) => {
      if (!val || isNaN(val)) return null;
      return Number(val > 12 ? (val / 12).toFixed(1) : val);
    };

    const fields = {
      Type: plantData.Type || "Other",
      Growth: plantData.Growth || "Moderate",
      "Width in inches": convertToFeet(plantData.Width),
      "Height in inches": convertToFeet(plantData.Height),
      "Space in inches": convertToFeet(plantData.Spacing),
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
    console.error("🔥 Error in fillPlantData:", error.response?.data || error.message);
    return res.status(500).json({ error: error.response?.data || error.message });
  }
}