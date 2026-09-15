const { parseSingleFile, UploadError } = require("../utils/multipart");
const { analyzeReceipt, GeminiServiceError } = require("../services/gemini-service");

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function sendJson(response, statusCode, data) {
  const body = JSON.stringify(data);

  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function handleReceiptRoute(request, response) {
  if (request.method !== "POST" || request.url !== "/api/receipts/upload") {
    return false;
  }

  parseSingleFile(request, {
    fieldName: "receipt",
    maxBytes: MAX_FILE_BYTES,
    allowedTypes: ALLOWED_IMAGE_TYPES,
  })
    .then(async (file) => {
      const analysis = await analyzeReceipt({
        buffer: file.buffer,
        mimeType: file.type,
        apiKey: process.env.GEMINI_API_KEY,
      });

      sendJson(response, 200, {
        status: "ok",
        message: "Comprovante analisado com sucesso",
        file: {
          type: file.type,
          size: file.buffer.length,
        },
        analysis,
      });
    })
    .catch((error) => {
      if (error instanceof UploadError) {
        sendJson(response, error.statusCode, { status: "error", error: error.message });
        return;
      }

      if (error instanceof GeminiServiceError) {
        console.error("Falha controlada na análise Gemini:", error.code);
        sendJson(response, error.statusCode, { status: "error", error: error.publicMessage });
        return;
      }

      console.error("Erro inesperado ao receber imagem:", error);
      sendJson(response, 500, { status: "error", error: "Erro inesperado no processamento" });
    });

  return true;
}

module.exports = { handleReceiptRoute };
