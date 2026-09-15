async function checkBackendHealth() {
  try {
    console.log("[Frontend pediu] GET /api/health");

    const response = await fetch("/api/health", {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`O backend respondeu com HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("[Frontend recebeu o JSON]", data);
  } catch (error) {
    console.warn("[Frontend] Backend indisponível:", error.message);
  }
}

async function uploadReceipt(file) {
  const formData = new FormData();
  formData.append("receipt", file);

  document.dispatchEvent(new CustomEvent("receipt-analysis-clear"));
  document.dispatchEvent(
    new CustomEvent("receipt-upload-status", {
      detail: { message: "Analisando comprovante..." },
    }),
  );

  try {
    console.log("[Frontend pediu] POST /api/receipts/upload");

    const response = await fetch("/api/receipts/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `O backend respondeu com HTTP ${response.status}`);
    }

    console.log("[Frontend recebeu a análise normalizada]", data);

    try {
      window.receiptStorage.addReceipt(data.analysis);
    } catch (storageError) {
      console.warn("[Frontend] Não foi possível salvar a análise localmente:", storageError.message);
    }

    document.dispatchEvent(
      new CustomEvent("receipt-upload-status", {
        detail: { message: "Comprovante analisado ✓" },
      }),
    );
    document.dispatchEvent(
      new CustomEvent("receipt-analysis-result", {
        detail: { analysis: data.analysis },
      }),
    );
  } catch (error) {
    console.warn("[Frontend] Falha no upload:", error.message);
    document.dispatchEvent(
      new CustomEvent("receipt-upload-status", {
        detail: { message: "Não foi possível analisar o comprovante." },
      }),
    );
  }
}

document.addEventListener("receipt-selected", (event) => {
  uploadReceipt(event.detail.file);
});

checkBackendHealth();
