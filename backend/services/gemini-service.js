const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const receiptSchema = {
  type: "object",
  properties: {
    estabelecimento: {
      type: ["string", "null"],
      description: "Nome do estabelecimento emissor do comprovante.",
    },
    data: {
      type: ["string", "null"],
      description: "Data do comprovante no formato AAAA-MM-DD.",
    },
    valorTotal: {
      type: ["number", "null"],
      description: "Valor total final da compra, sem símbolo monetário.",
    },
    moeda: {
      type: ["string", "null"],
      description: "Código ISO 4217 da moeda, como BRL, USD ou EUR.",
    },
  },
  required: ["estabelecimento", "data", "valorTotal", "moeda"],
  additionalProperties: false,
};

class GeminiServiceError extends Error {
  constructor(code, statusCode, publicMessage) {
    super(code);
    this.code = code;
    this.statusCode = statusCode;
    this.publicMessage = publicMessage;
  }
}

function normalizeText(value, maxLength) {
  if (typeof value !== "string") return null;

  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

function normalizeAnalysis(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new GeminiServiceError(
      "GEMINI_INVALID_RESPONSE",
      502,
      "A IA retornou uma resposta inválida",
    );
  }

  const estabelecimento = normalizeText(value.estabelecimento, 120);
  const rawDate = normalizeText(value.data, 10);
  const parsedDate = rawDate ? new Date(`${rawDate}T00:00:00Z`) : null;
  const data = rawDate
    && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    && !Number.isNaN(parsedDate.getTime())
    && parsedDate.toISOString().slice(0, 10) === rawDate
    ? rawDate
    : null;
  const numericTotal = typeof value.valorTotal === "number"
    ? value.valorTotal
    : Number.NaN;
  const valorTotal = Number.isFinite(numericTotal) && numericTotal >= 0
    ? Math.round(numericTotal * 100) / 100
    : null;
  const rawCurrency = normalizeText(value.moeda, 3)?.toUpperCase();
  const moeda = rawCurrency && /^[A-Z]{3}$/.test(rawCurrency) ? rawCurrency : null;

  return { estabelecimento, data, valorTotal, moeda };
}

async function analyzeReceipt({ buffer, mimeType, apiKey }) {
  if (!apiKey) {
    throw new GeminiServiceError(
      "GEMINI_KEY_MISSING",
      503,
      "Serviço de análise não configurado",
    );
  }

  let response;

  try {
    response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Analise este comprovante de compra. Extraia somente os dados visíveis. Se um campo não puder ser identificado com segurança, retorne null.",
              },
              {
                inlineData: {
                  mimeType,
                  data: buffer.toString("base64"),
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: receiptSchema,
          temperature: 0,
        },
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new GeminiServiceError(
      "GEMINI_REQUEST_FAILED",
      502,
      "Não foi possível consultar o serviço de análise",
    );
  }

  if (!response.ok) {
    throw new GeminiServiceError(
      `GEMINI_API_ERROR_${response.status}`,
      502,
      "O serviço de análise recusou a solicitação",
    );
  }

  let responseData;

  try {
    responseData = await response.json();
  } catch {
    throw new GeminiServiceError(
      "GEMINI_INVALID_RESPONSE",
      502,
      "A IA retornou uma resposta inválida",
    );
  }
  const responseText = responseData.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join("");

  if (!responseText) {
    throw new GeminiServiceError(
      "GEMINI_EMPTY_RESPONSE",
      502,
      "A IA não retornou uma análise",
    );
  }

  try {
    return normalizeAnalysis(JSON.parse(responseText));
  } catch (error) {
    if (error instanceof GeminiServiceError) throw error;

    throw new GeminiServiceError(
      "GEMINI_INVALID_JSON",
      502,
      "A IA retornou uma resposta inválida",
    );
  }
}

module.exports = { analyzeReceipt, GeminiServiceError, GEMINI_MODEL };
