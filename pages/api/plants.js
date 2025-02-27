import axios from "axios";

export default async function handler(req, res) {
  try {
    const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;

    const response = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
      {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      }
    );

    res.status(200).json(response.data.records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch plant data" });
  }
}