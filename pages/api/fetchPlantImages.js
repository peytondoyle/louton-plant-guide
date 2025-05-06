export default async function handler(req, res) {
    const { query } = req.query;
    console.log("Image fetch query:", query);
    
    if (!query) {
      return res.status(400).json({ error: "Missing search query" });
    }
  
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const GOOGLE_CX = process.env.GOOGLE_CX; // Your Custom Search Engine ID
  
    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
      return res.status(500).json({ error: "Missing Google API credentials" });
    }
  
    const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${GOOGLE_CX}&searchType=image&key=${GOOGLE_API_KEY}`;
  
    try {
      const response = await fetch(searchUrl);
  
      if (!response.ok) {
        throw new Error(`Google API Error: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Log API response for debugging
      console.log("Google API Response:", JSON.stringify(data, null, 2));
  
      const images = data.items ? data.items.map((item) => item.link) : [];
  
      res.status(200).json({ images });
    } catch (error) {
      console.error("Image Fetch Error:", error);
      res.status(500).json({ error: error.message });
    }
  }