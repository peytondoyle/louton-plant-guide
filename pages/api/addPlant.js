export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { plantName, detailedName, yardLocation, image, yearPlanted } = req.body;

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    return res.status(500).json({ error: "Airtable API credentials are missing." });
  }

  try {
    // Step 1: Create the plant record in Airtable
    const airtableResponse = await fetch(
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

    const airtableData = await airtableResponse.json();

    if (!airtableResponse.ok || !airtableData.records || airtableData.records.length === 0) {
      console.error("Airtable creation error:", airtableData);
      return res.status(500).json({ error: "Failed to create plant in Airtable." });
    }

    const newRecord = airtableData.records[0];

    // Step 2: Use ChatGPT to enrich the record with details
    const enrichResponse = await fetch(`${BASE_URL}/api/fillPlantData`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plantName,
        detailedName,
        recordId: newRecord.id,
      }),
    });

    const enrichData = await enrichResponse.json();

    if (!enrichResponse.ok || !enrichData.success) {
      console.warn("Plant added, but enrich failed:", enrichData.error || enrichData);
      return res.status(200).json({
        success: true,
        partial: true,
        message: "Plant added, but enrichment failed.",
        plant: {
          id: newRecord.id,
          fields: newRecord.fields,
        },
      });
    }

    const updatedFields = enrichData.airtableData?.records?.[0]?.fields || {};

    return res.status(200).json({
      success: true,
      plant: {
        id: newRecord.id,
        fields: {
          ...newRecord.fields,
          ...updatedFields,
        },
      },
    });
  } catch (error) {
    console.error("Unexpected error in addPlant:", error);
    return res.status(500).json({ error: "Unexpected error while adding plant." });
  }
}