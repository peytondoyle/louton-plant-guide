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
          { role: "system", content: "You are a plant expert. Respond only in JSON format." },
          {
            role: "user",
            content: `Provide detailed plant pruning information for \"${query}\". 
              The pruning details must be clear, useful, and fit within 30-40 characters. 
              Respond ONLY in valid JSON:
              {
                \"Type\": \"Perennial/Annual/Other\",
                \"Growth\": \"Slow/Moderate/Fast\",
                \"Width\": 0,
                \"Height\": 0,
                \"Spacing\": 0,
                \"Pruning\": \"Best time and method in one sentence\"
              }`,
          },
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

    let responseText = openAIResponse.data.choices?.[0]?.message?.content || "";
    responseText = responseText.replace(/```json|```/g, "").trim();

    let plantData;
    try {
      plantData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON Parsing Error:", parseError);
      return res.status(500).json({ error: "Invalid JSON from OpenAI" });
    }

    const convertToFeet = (value) => {
      if (!value) return value;
      const converted = value > 12 ? (value / 12).toFixed(1) : value;
      return Number(converted);
    };

    if (plantData.Width) plantData.Width = convertToFeet(plantData.Width);
    if (plantData.Height) plantData.Height = convertToFeet(plantData.Height);
    if (plantData.Spacing) plantData.Spacing = convertToFeet(plantData.Spacing);

    const airtableFields = {
      Type: plantData.Type,
      Growth: plantData.Growth,
      "Width in inches": plantData.Width,
      "Height in inches": plantData.Height,
      "Space in inches": plantData.Spacing,
      Pruning: plantData.Pruning,
    };

    const airtableResponse = await axios.patch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_NAME}`,
      {
        records: [
          {
            id: recordId,
            fields: airtableFields,
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
    console.error("API Error:", error.response?.data || error.message);
    return res.status(500).json({ error: error.response?.data || error.message });
  }
}