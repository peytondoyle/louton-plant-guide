export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { plantName, detailedName, yardLocation, image, yearPlanted } = req.body;

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    return res.status(500).json({ error: "Airtable API credentials are missing." });
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                "Plant name": plantName,
                "Detailed name": detailedName,
                ...(yardLocation ? { "Yard location": yardLocation } : {}),
                ...(image ? { Image: image } : {}),
                ...(Number(yearPlanted) ? { "Year planted": Number(yearPlanted) } : {}),
              },
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.records || data.records.length === 0) {
      console.error("Airtable Error:", data);
      return res.status(500).json({ error: "Failed to save plant to Airtable." });
    }

    res.status(200).json({ success: true, plant: data.records[0] });
  } catch (error) {
    console.error("Error adding plant:", error);
    res.status(500).json({ error: "Failed to add plant" });
  }
}