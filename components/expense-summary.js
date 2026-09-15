class ExpenseSummary extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="summary-grid" aria-label="Resumo dos gastos">
        <article class="metric-card metric-card--primary">
          <span class="metric-card__icon" aria-hidden="true">R$</span>
          <div><p class="metric-card__label">Total gasto</p><p class="metric-card__value" data-summary="total">R$ 0,00</p></div>
        </article>
        <article class="metric-card">
          <span class="metric-card__icon" aria-hidden="true">🧾</span>
          <div><p class="metric-card__label">Comprovantes</p><p class="metric-card__value" data-summary="count">0</p></div>
        </article>
        <article class="metric-card">
          <span class="metric-card__icon" aria-hidden="true">↗</span>
          <div><p class="metric-card__label">Média</p><p class="metric-card__value" data-summary="average">R$ 0,00</p></div>
        </article>
      </section>
    `;

    document.addEventListener(window.receiptStorage.UPDATED_EVENT, this.renderSummary);
    this.renderSummary();
  }

  disconnectedCallback() {
    document.removeEventListener(window.receiptStorage.UPDATED_EVENT, this.renderSummary);
  }

  renderSummary = () => {
    const receipts = window.receiptStorage.readReceipts();
    const count = receipts.length;
    const total = receipts.reduce((sum, receipt) => sum + receipt.valorTotal, 0);
    const average = count > 0 ? total / count : 0;

    this.querySelector('[data-summary="total"]').textContent = this.formatMoney(total);
    this.querySelector('[data-summary="count"]').textContent = String(count);
    this.querySelector('[data-summary="average"]').textContent = this.formatMoney(average);
  };

  formatMoney(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }
}

customElements.define("expense-summary", ExpenseSummary);
