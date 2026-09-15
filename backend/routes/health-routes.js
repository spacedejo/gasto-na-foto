function handleHealthRoute(request, response) {
  if (request.method !== "GET" || request.url !== "/api/health") {
    return false;
  }

  const body = JSON.stringify({
    status: "ok",
    service: "Gasto na Foto API",
  });

  response.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);

  return true;
}

module.exports = { handleHealthRoute };
