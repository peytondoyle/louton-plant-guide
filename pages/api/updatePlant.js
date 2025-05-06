export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;

  const { recordId, fields } = req.body;

  if (!recordId || !fields) {
    return res.status(400).json({ error: "Missing recordId or fields" });
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${recordId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      res.status(200).json({ updatedFields: result.fields });
    } else {
      res.status(response.status).json({ error: result.error });
    }
  } catch (error) {
    console.error("Error updating plant:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}