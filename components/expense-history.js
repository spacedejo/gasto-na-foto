class ExpenseHistory extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="history-panel" id="ultimas-analises" aria-labelledby="history-title">
        <div class="section-heading">
          <div>
            <p class="section-heading__eyebrow">Atividade recente</p>
            <h2 class="section-heading__title" id="history-title">Últimas análises</h2>
          </div>
          <span class="section-heading__badge" data-history-count>0 registros</span>
        </div>
        <div data-history-content></div>
      </section>
    `;

    document.addEventListener(window.receiptStorage.UPDATED_EVENT, this.renderHistory);
    this.renderHistory();
  }

  disconnectedCallback() {
    document.removeEventListener(window.receiptStorage.UPDATED_EVENT, this.renderHistory);
  }

  renderHistory = () => {
    const receipts = window.receiptStorage.readReceipts();
    const recentReceipts = [...receipts]
      .sort((first, second) => Date.parse(second.criadoEm) - Date.parse(first.criadoEm))
      .slice(0, 5);
    const content = this.querySelector("[data-history-content]");
    const badge = this.querySelector("[data-history-count]");

    badge.textContent = `${receipts.length} ${receipts.length === 1 ? "registro" : "registros"}`;
    content.replaceChildren();

    if (recentReceipts.length === 0) {
      content.innerHTML = `
        <div class="history-panel__empty">
          <span class="history-panel__icon" aria-hidden="true">⌁</span>
          <div>
            <p class="history-panel__title">Nenhum comprovante analisado ainda.</p>
            <p class="history-panel__description">Suas futuras análises aparecerão organizadas neste espaço.</p>
          </div>
        </div>
      `;
      return;
    }

    const list = document.createElement("ol");
    list.className = "history-list";

    recentReceipts.forEach((receipt) => {
      const item = document.createElement("li");
      const details = document.createElement("div");
      const establishment = document.createElement("p");
      const date = document.createElement("p");
      const total = document.createElement("strong");

      item.className = "history-list__item";
      details.className = "history-list__details";
      establishment.className = "history-list__establishment";
      date.className = "history-list__date";
      total.className = "history-list__value";
      establishment.textContent = receipt.estabelecimento || "Estabelecimento não identificado";
      date.textContent = this.formatDate(receipt.data);
      total.textContent = this.formatMoney(receipt.valorTotal);

      details.append(establishment, date);
      item.append(details, total);
      list.append(item);
    });

    content.append(list);
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

customElements.define("expense-history", ExpenseHistory);
