export default async function handler(req, res) {
  const { query } = req.query;
  console.log("Image fetch query:", query);

  if (!query) {
    return res.status(400).json({ error: "Missing search query" });
  }

  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const GOOGLE_CX = process.env.GOOGLE_CX;

  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    return res.status(500).json({ error: "Missing Google API credentials" });
  }

  // Create fallback queries: full, then partials
  const parts = query.split(" ").filter(Boolean);
  const searchTerms = [
    query,                                  // full string first
    parts.slice(0, -1).join(" "),           // drop last word (likely cultivar)
    parts[0]                                // just the first word (likely genus)
  ].filter((q, i, arr) => q && arr.indexOf(q) === i); // remove empty/duplicates

  const trySearch = async (term) => {
    const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(term)}&cx=${GOOGLE_CX}&searchType=image&key=${GOOGLE_API_KEY}`;
    const response = await fetch(searchUrl);

    if (!response.ok) {
      console.warn(`Search failed for "${term}" with status ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log(`✅ Search for "${term}" returned ${data.items?.length || 0} images.`);
    return data.items ? data.items.map((item) => item.link) : [];
  };

  try {
    for (const term of searchTerms) {
      const images = await trySearch(term);
      if (images.length) {
        return res.status(200).json({ images });
      }
    }

    // No results for any fallback
    return res.status(404).json({ error: "No images found for any query variation." });
  } catch (error) {
    console.error("Image Fetch Error:", error);
    return res.status(500).json({ error: error.message });
  }
}