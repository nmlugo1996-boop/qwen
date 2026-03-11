export const config = {
    api: {
      bodyParser: {
        sizeLimit: "2mb"
      }
    }
  };
  
  function sanitizeFilename(name) {
    const raw = String(name || "passport")
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "")
      .replace(/\s+/g, " ")
      .trim();
  
    if (!raw) return "passport";
    return raw;
  }
  
  function getDraftFromBody(body) {
    if (!body || typeof body !== "object") return {};
    if (body.draft && typeof body.draft === "object") return body.draft;
    return body;
  }
  
  export default async function handler(req, res) {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    try {
      const draft = getDraftFromBody(req.body);
  
      if (!draft || typeof draft !== "object") {
        return res.status(400).json({ error: "Draft is required" });
      }
  
      const mod = await import("../lib/passportDocx");
      const draftToDocxBinary = mod.draftToDocxBinary;
  
      if (typeof draftToDocxBinary !== "function") {
        return res.status(500).json({ error: "DOCX generator is not available" });
      }
  
      const binary = await draftToDocxBinary(draft);
      const productName =
        draft?.header?.name ||
        draft?.name ||
        "passport";
  
      const safeName = sanitizeFilename(productName);
      const fileName = `${safeName}.docx`;
  
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(fileName)}"`
      );
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
  
      return res.status(200).send(Buffer.from(binary));
    } catch (error) {
      console.error("[passport-docx]", error);
      return res.status(500).json({
        error: "Failed to generate DOCX",
        details: error?.message || "Unknown error"
      });
    }
  }