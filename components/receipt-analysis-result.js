class ReceiptAnalysisResult extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="analysis-result" aria-live="polite" hidden>
        <p class="analysis-result__eyebrow">Dados reconhecidos</p>
        <dl class="analysis-result__grid">
          <div><dt>Estabelecimento</dt><dd data-field="estabelecimento"></dd></div>
          <div><dt>Data</dt><dd data-field="data"></dd></div>
          <div><dt>Valor total</dt><dd data-field="valorTotal"></dd></div>
          <div><dt>Moeda</dt><dd data-field="moeda"></dd></div>
        </dl>
        <button class="analysis-result__new" type="button">+ Analisar outro comprovante</button>
      </section>
    `;

    this.panel = this.querySelector(".analysis-result");
    this.newAnalysisButton = this.querySelector(".analysis-result__new");
    this.newAnalysisButton.addEventListener("click", this.startNewAnalysis);
    document.addEventListener("receipt-analysis-result", this.showResult);
    document.addEventListener("receipt-analysis-clear", this.clearResult);
  }

  disconnectedCallback() {
    document.removeEventListener("receipt-analysis-result", this.showResult);
    document.removeEventListener("receipt-analysis-clear", this.clearResult);
    this.newAnalysisButton.removeEventListener("click", this.startNewAnalysis);
  }

  showResult = (event) => {
    const analysis = event.detail.analysis;

    this.setField("estabelecimento", analysis.estabelecimento);
    this.setField("data", this.formatDate(analysis.data));
    this.setField("valorTotal", this.formatMoney(analysis.valorTotal, analysis.moeda));
    this.setField("moeda", analysis.moeda);
    this.panel.hidden = false;
  };

  clearResult = () => {
    this.panel.hidden = true;
    this.querySelectorAll("[data-field]").forEach((field) => {
      field.textContent = "";
    });
  };

  startNewAnalysis = () => {
    this.clearResult();
    document.dispatchEvent(new CustomEvent("receipt-new-analysis"));
  };

  setField(field, value) {
    this.querySelector(`[data-field="${field}"]`).textContent = value ?? "Não identificado";
  }

  formatDate(value) {
    if (!value) return null;

    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  formatMoney(value, currency) {
    if (value === null || !currency) return null;

    try {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency,
      }).format(value);
    } catch {
      return `${value.toFixed(2)} ${currency}`;
    }
  }
}

customElements.define("receipt-analysis-result", ReceiptAnalysisResult);
