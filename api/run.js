const RAILWAY_URL = “https://zafiro-agent-production.up.railway.app”;

export default async function handler(req, res) {
if (req.method !== “POST”) {
return res.status(405).json({ error: “Method not allowed” });
}

try {
const { filename, data } = req.body;

if (!filename || !data) {
  return res.status(400).json({ error: "filename and data required" });
}

const pdfBuffer = Buffer.from(data, "base64");
const boundary = "ZafiroAgentBoundary" + Date.now();
const CRLF = "\r\n";

const header =
  "--" + boundary + CRLF +
  "Content-Disposition: form-data; name=\"file\"; filename=\"" + filename + "\"" + CRLF +
  "Content-Type: application/pdf" + CRLF + CRLF;

const footer = CRLF + "--" + boundary + "--" + CRLF;

const headerBuf = Buffer.from(header, "utf-8");
const footerBuf = Buffer.from(footer, "utf-8");
const body = Buffer.concat([headerBuf, pdfBuffer, footerBuf]);

const response = await fetch(RAILWAY_URL + "/pipeline/run", {
  method: "POST",
  headers: {
    "Content-Type": "multipart/form-data; boundary=" + boundary,
    "Content-Length": body.length.toString(),
  },
  body: body,
});

const result = await response.json();
return res.status(response.status).json(result);

} catch (err) {
return res.status(500).json({
error: “Proxy error”,
detail: err.message
});
}
}
