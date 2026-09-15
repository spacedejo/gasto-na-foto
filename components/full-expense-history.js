class FullExpenseHistory extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="history-panel full-history-panel" id="historico" aria-labelledby="full-history-title">
        <div class="section-heading">
          <div>
            <p class="section-heading__eyebrow">Arquivo local</p>
            <h1 class="full-history-panel__title" id="full-history-title">Histórico</h1>
            <p class="full-history-panel__description">Todos os comprovantes analisados neste navegador.</p>
          </div>
          <div class="full-history-panel__actions">
            <span class="section-heading__badge" data-full-history-count>0 registros</span>
            <button class="history-clear-button" type="button" data-clear-history>Limpar histórico</button>
          </div>
        </div>
        <div data-full-history-content></div>
      </section>
      <dialog class="confirmation-dialog" data-confirmation-dialog aria-labelledby="confirmation-title">
        <form method="dialog" class="confirmation-dialog__content">
          <p class="section-heading__eyebrow">Confirmação</p>
          <h2 class="confirmation-dialog__title" id="confirmation-title">Confirmar exclusão</h2>
          <p class="confirmation-dialog__message" data-confirmation-message></p>
          <div class="confirmation-dialog__actions">
            <button class="confirmation-dialog__button" type="button" data-cancel-action>Cancelar</button>
            <button class="confirmation-dialog__button confirmation-dialog__button--danger" type="button" data-confirm-action>Excluir</button>
          </div>
        </form>
      </dialog>
    `;

    this.content = this.querySelector("[data-full-history-content]");
    this.clearButton = this.querySelector("[data-clear-history]");
    this.dialog = this.querySelector("[data-confirmation-dialog]");
    this.confirmationMessage = this.querySelector("[data-confirmation-message]");
    this.confirmButton = this.querySelector("[data-confirm-action]");
    document.addEventListener(window.receiptStorage.UPDATED_EVENT, this.renderHistory);
    this.content.addEventListener("click", this.handleContentClick);
    this.clearButton.addEventListener("click", this.handleClearRequest);
    this.querySelector("[data-cancel-action]").addEventListener("click", this.closeConfirmation);
    this.confirmButton.addEventListener("click", this.handleConfirm);
    this.dialog.addEventListener("cancel", this.resetPendingAction);
    this.renderHistory();
  }

  disconnectedCallback() {
    document.removeEventListener(window.receiptStorage.UPDATED_EVENT, this.renderHistory);
    this.content?.removeEventListener("click", this.handleContentClick);
    this.clearButton?.removeEventListener("click", this.handleClearRequest);
    this.querySelector("[data-cancel-action]")?.removeEventListener("click", this.closeConfirmation);
    this.confirmButton?.removeEventListener("click", this.handleConfirm);
    this.dialog?.removeEventListener("cancel", this.resetPendingAction);
  }

  renderHistory = () => {
    const receipts = [...window.receiptStorage.readReceipts()]
      .sort((first, second) => Date.parse(second.criadoEm) - Date.parse(first.criadoEm));
    const content = this.querySelector("[data-full-history-content]");
    const badge = this.querySelector("[data-full-history-count]");

    badge.textContent = `${receipts.length} ${receipts.length === 1 ? "registro" : "registros"}`;
    this.clearButton.hidden = receipts.length === 0;
    content.replaceChildren();

    if (receipts.length === 0) {
      content.innerHTML = `
        <div class="history-panel__empty">
          <span class="history-panel__icon" aria-hidden="true">⌁</span>
          <div>
            <p class="history-panel__title">Ainda não existem comprovantes analisados.</p>
            <p class="history-panel__description">As análises concluídas aparecerão neste histórico.</p>
          </div>
        </div>
      `;
      return;
    }

    const list = document.createElement("ol");
    list.className = "history-list history-list--full";

    receipts.forEach((receipt) => list.append(this.createHistoryItem(receipt)));
    content.append(list);
  };

  createHistoryItem(receipt) {
    const item = document.createElement("li");
    const details = document.createElement("div");
    const establishment = document.createElement("p");
    const metadata = document.createElement("p");
    const total = document.createElement("strong");
    const actions = document.createElement("div");
    const removeButton = document.createElement("button");

    item.className = "history-list__item";
    details.className = "history-list__details";
    establishment.className = "history-list__establishment";
    metadata.className = "history-list__date";
    total.className = "history-list__value";
    actions.className = "history-list__actions";
    removeButton.className = "history-list__remove";
    removeButton.type = "button";
    removeButton.dataset.receiptId = receipt.id;
    removeButton.setAttribute(
      "aria-label",
      `Excluir registro de ${receipt.estabelecimento || "estabelecimento não identificado"}`,
    );
    removeButton.innerHTML = `
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M3 6h18"></path>
        <path d="M8 6V4h8v2"></path>
        <path d="M19 6l-1 14H6L5 6"></path>
        <path d="M10 11v5M14 11v5"></path>
      </svg>
    `;
    establishment.textContent = receipt.estabelecimento || "Estabelecimento não identificado";
    metadata.textContent = `${this.formatDate(receipt.data)} · ${receipt.moeda || "BRL"}`;
    total.textContent = this.formatMoney(receipt.valorTotal);

    details.append(establishment, metadata);
    actions.append(total, removeButton);
    item.append(details, actions);
    return item;
  }

  handleContentClick = (event) => {
    const button = event.target.closest("[data-receipt-id]");

    if (!button) return;

    const receipt = window.receiptStorage.readReceipts()
      .find((item) => item.id === button.dataset.receiptId);

    if (!receipt) return;

    this.pendingAction = { type: "remove", id: receipt.id };
    this.confirmationMessage.textContent = `Excluir o registro de ${receipt.estabelecimento || "estabelecimento não identificado"}? Esta ação não poderá ser desfeita.`;
    this.confirmButton.textContent = "Excluir registro";
    this.dialog.showModal();
  };

  handleClearRequest = () => {
    this.pendingAction = { type: "clear" };
    this.confirmationMessage.textContent = "Todos os registros armazenados neste navegador serão removidos. Esta ação não poderá ser desfeita.";
    this.confirmButton.textContent = "Limpar histórico";
    this.dialog.showModal();
  };

  handleConfirm = () => {
    if (this.pendingAction?.type === "remove") {
      window.receiptStorage.removeReceipt(this.pendingAction.id);
    } else if (this.pendingAction?.type === "clear") {
      window.receiptStorage.clearReceipts();
    }

    this.dialog.close();
    this.pendingAction = null;
  };

  closeConfirmation = () => {
    this.dialog.close();
    this.pendingAction = null;
  };

  resetPendingAction = () => {
    this.pendingAction = null;
  };

  formatDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return "Data não identificada";

    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  formatMoney(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }
}

customElements.define("full-expense-history", FullExpenseHistory);
