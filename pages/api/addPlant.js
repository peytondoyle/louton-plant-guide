export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  
    const { plantName, image, detailedName = "Unknown", yardLocation = "Not specified" } = req.body;
  
    // Ensure all required environment variables exist
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME; // ✅ Uses existing env var
  
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
                  "Yard location": yardLocation,
                  Image: image,
                },
              },
            ],
          }),
        }
      );
  
      const data = await response.json();
  
      // ✅ Handle errors if `records` is missing
      if (!response.ok || !data.records || data.records.length === 0) {
        console.error("Airtable Error:", data);
        return res.status(500).json({ error: "Failed to save plant to Airtable." });
      }
  
      res.status(200).json({ success: true, plant: data.records[0].fields });
    } catch (error) {
      console.error("Error adding plant:", error);
      res.status(500).json({ error: "Failed to add plant" });
    }
  }