(function initializeReceiptStorage(global) {
  const STORAGE_KEY = "gastoNaFoto:receipts";
  const UPDATED_EVENT = "receipts-updated";

  function isValidReceipt(receipt) {
    return receipt
      && typeof receipt === "object"
      && !Array.isArray(receipt)
      && typeof receipt.id === "string"
      && receipt.id.length > 0
      && typeof receipt.criadoEm === "string"
      && !Number.isNaN(Date.parse(receipt.criadoEm))
      && typeof receipt.valorTotal === "number"
      && Number.isFinite(receipt.valorTotal)
      && receipt.valorTotal >= 0;
  }

  function readReceipts() {
    const storedValue = global.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) return [];

    try {
      const receipts = JSON.parse(storedValue);
      return Array.isArray(receipts) ? receipts.filter(isValidReceipt) : [];
    } catch {
      return [];
    }
  }

  function createId() {
    if (typeof global.crypto?.randomUUID === "function") {
      return global.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function addReceipt(analysis) {
    const record = {
      id: createId(),
      estabelecimento: analysis.estabelecimento ?? null,
      data: analysis.data ?? null,
      valorTotal: analysis.valorTotal ?? null,
      moeda: analysis.moeda ?? null,
      criadoEm: new Date().toISOString(),
    };
    const receipts = readReceipts();

    receipts.push(record);
    global.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
    notifyUpdated({ action: "added", record });

    return record;
  }

  function removeReceipt(id) {
    if (typeof id !== "string" || !id) return false;

    const receipts = readReceipts();
    const remainingReceipts = receipts.filter((receipt) => receipt.id !== id);

    if (remainingReceipts.length === receipts.length) return false;

    global.localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingReceipts));
    notifyUpdated({ action: "removed", id });
    return true;
  }

  function clearReceipts() {
    if (global.localStorage.getItem(STORAGE_KEY) === null) return false;

    global.localStorage.removeItem(STORAGE_KEY);
    notifyUpdated({ action: "cleared" });
    return true;
  }

  function notifyUpdated(detail) {
    global.document.dispatchEvent(new CustomEvent(UPDATED_EVENT, { detail }));
  }

  global.receiptStorage = Object.freeze({
    STORAGE_KEY,
    UPDATED_EVENT,
    readReceipts,
    addReceipt,
    removeReceipt,
    clearReceipts,
  });
})(window);
