class UploadError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function readRequestBody(request, maxRequestBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;
    let finished = false;

    request.on("data", (chunk) => {
      if (finished) return;

      totalBytes += chunk.length;

      if (totalBytes > maxRequestBytes) {
        finished = true;
        request.resume();
        reject(new UploadError(413, "A imagem deve ter no máximo 5 MB"));
        return;
      }

      chunks.push(chunk);
    });

    request.on("end", () => {
      if (!finished) resolve(Buffer.concat(chunks));
    });

    request.on("error", (error) => {
      if (!finished) reject(error);
    });
  });
}

function findPart(body, boundary, fieldName) {
  const delimiter = Buffer.from(`--${boundary}`);
  let cursor = 0;

  while (cursor < body.length) {
    const boundaryStart = body.indexOf(delimiter, cursor);

    if (boundaryStart === -1) break;

    let partStart = boundaryStart + delimiter.length;

    if (body.subarray(partStart, partStart + 2).toString() === "--") break;
    if (body.subarray(partStart, partStart + 2).toString() === "\r\n") partStart += 2;

    const nextBoundary = body.indexOf(delimiter, partStart);

    if (nextBoundary === -1) break;

    const headerEnd = body.indexOf(Buffer.from("\r\n\r\n"), partStart);

    if (headerEnd === -1 || headerEnd > nextBoundary) break;

    const headers = body.subarray(partStart, headerEnd).toString("utf8");
    const nameMatch = headers.match(/(?:^|;\s*)name=(?:"([^"]+)"|([^;\r\n]+))/i);
    const filenameMatch = headers.match(/(?:^|;\s*)filename=(?:"([^"]*)"|([^;\r\n]*))/i);
    const name = nameMatch?.slice(1).find((value) => value !== undefined);
    const filename = filenameMatch?.slice(1).find((value) => value !== undefined);
    const type = headers.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim().toLowerCase();

    if (name === fieldName && filename !== undefined) {
      let contentEnd = nextBoundary;

      if (body.subarray(contentEnd - 2, contentEnd).toString() === "\r\n") {
        contentEnd -= 2;
      }

      return {
        type,
        buffer: body.subarray(headerEnd + 4, contentEnd),
      };
    }

    cursor = nextBoundary;
  }

  return null;
}

async function parseSingleFile(request, options) {
  const contentType = request.headers["content-type"] || "";
  const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i)?.slice(1).find(Boolean);

  if (!contentType.toLowerCase().startsWith("multipart/form-data") || !boundary) {
    throw new UploadError(400, "Envie a imagem usando multipart/form-data");
  }

  const maxRequestBytes = options.maxBytes + 512 * 1024;
  const body = await readRequestBody(request, maxRequestBytes);
  const file = findPart(body, boundary, options.fieldName);

  if (!file || file.buffer.length === 0) {
    throw new UploadError(400, "Nenhuma imagem foi enviada");
  }

  if (!options.allowedTypes.includes(file.type)) {
    throw new UploadError(415, "Formato não permitido. Use JPEG, PNG ou WEBP");
  }

  if (file.buffer.length > options.maxBytes) {
    throw new UploadError(413, "A imagem deve ter no máximo 5 MB");
  }

  return file;
}

module.exports = { parseSingleFile, UploadError };
