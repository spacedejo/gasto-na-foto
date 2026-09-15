const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { handleHealthRoute } = require("./routes/health-routes");
const { handleReceiptRoute } = require("./routes/receipt-routes");

const PORT = Number(process.env.PORT) || 3000;
const PROJECT_ROOT = path.resolve(__dirname, "..");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function sendJson(response, statusCode, data) {
  const body = JSON.stringify(data);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function serveFrontend(request, response) {
  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Método não permitido" });
    return;
  }

  let pathname;

  try {
    pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  } catch {
    sendJson(response, 400, { error: "Endereço inválido" });
    return;
  }

  const requestedPath = pathname === "/" ? "/inde.html" : pathname;
  const filePath = path.resolve(PROJECT_ROOT, `.${requestedPath}`);
  const relativePath = path.relative(PROJECT_ROOT, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    sendJson(response, 403, { error: "Acesso negado" });
    return;
  }

  fs.readFile(filePath, (error, file) => {
    if (error) {
      sendJson(response, error.code === "ENOENT" ? 404 : 500, {
        error: error.code === "ENOENT" ? "Arquivo não encontrado" : "Erro interno",
      });
      return;
    }

    const contentType = contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    response.end(file);
  });
}

const server = http.createServer((request, response) => {
  console.log(`[Backend recebeu] ${request.method} ${request.url}`);

  if (handleHealthRoute(request, response)) {
    console.log("[Backend respondeu] 200", {
      status: "ok",
      service: "Gasto na Foto API",
    });
    return;
  }

  if (handleReceiptRoute(request, response)) {
    return;
  }

  serveFrontend(request, response);
});

server.listen(PORT, () => {
  console.log(`Gasto na Foto disponível em http://localhost:${PORT}`);
});
