// /api/sheet.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ضع هنا رابط Google Apps Script (الذي نسخته من Deploy)
    const scriptUrl = "https://script.google.com/macros/s/AKfycbygwQh2rYz_zJQvoJOoqx-GaUYQjSqmBFqwENasG4PIqghllFpDBGwkkfZGAAlw9CjLcw/exec";

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    return res.status(200).json({ ok: true, result: text });

  } catch (error) {
    console.error("Error calling Google Script:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
