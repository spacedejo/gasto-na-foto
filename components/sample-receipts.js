const SAMPLE_RECEIPTS = Object.freeze([
  { id: "mercado-spaced", estabelecimento: "Mercado SpaceD", arquivo: "assets/samples/nota-001-mercado-spaced.webp", valorEsperado: 91.6 },
  { id: "padaria-spaced", estabelecimento: "Padaria SpaceD", arquivo: "assets/samples/nota-002-padaria-spaced.webp", valorEsperado: 56.4 },
  { id: "posto-spaced", estabelecimento: "Posto SpaceD", arquivo: "assets/samples/nota-003-posto-spaced.webp", valorEsperado: 285 },
  { id: "farmacia-spaced", estabelecimento: "Farmácia SpaceD", arquivo: "assets/samples/nota-004-farmacia-spaced.webp", valorEsperado: 129.5 },
  { id: "cafe-spaced", estabelecimento: "Café SpaceD", arquivo: "assets/samples/nota-005-cafe-spaced.webp", valorEsperado: 70 },
]);

class SampleReceipts extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="information-panel" aria-labelledby="samples-title">
        <p class="section-heading__eyebrow">Demonstração segura</p>
        <h1 class="information-panel__title" id="samples-title">Comprovantes para teste</h1>
        <p class="information-panel__lead">Não possui um comprovante agora? Utilize uma das amostras fictícias da SpaceD para experimentar a análise com IA.</p>
        <div class="information-panel__notice">
          <svg class="information-panel__notice-icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5"></path><path d="M12 8h.01"></path></svg>
          <p>Todos os comprovantes desta área são fictícios e criados exclusivamente para demonstração e testes. Não contêm dados pessoais reais.</p>
        </div>
        <div class="sample-catalog" data-sample-catalog></div>
      </section>
      <dialog class="sample-preview-dialog" data-sample-dialog aria-labelledby="sample-preview-title">
        <div class="sample-preview-dialog__content">
          <div class="sample-preview-dialog__header">
            <div><p class="section-heading__eyebrow">Amostra fictícia</p><h2 class="sample-preview-dialog__title" id="sample-preview-title" data-preview-title></h2></div>
            <button class="sample-preview-dialog__close" type="button" data-close-preview aria-label="Fechar visualização">×</button>
          </div>
          <div class="sample-preview-dialog__viewport"><img data-preview-image alt="" /></div>
        </div>
      </dialog>
    `;

    this.catalog = this.querySelector("[data-sample-catalog]");
    this.dialog = this.querySelector("[data-sample-dialog]");
    this.previewTitle = this.querySelector("[data-preview-title]");
    this.previewImage = this.querySelector("[data-preview-image]");
    this.catalog.addEventListener("click", this.handleCatalogClick);
    this.querySelector("[data-close-preview]").addEventListener("click", this.closePreview);
    this.renderCatalog();
  }

  disconnectedCallback() {
    this.catalog?.removeEventListener("click", this.handleCatalogClick);
    this.querySelector("[data-close-preview]")?.removeEventListener("click", this.closePreview);
  }

  renderCatalog() {
    const fragment = document.createDocumentFragment();
    SAMPLE_RECEIPTS.forEach((sample) => fragment.append(this.createSampleCard(sample)));
    this.catalog.replaceChildren(fragment);
  }

  createSampleCard(sample) {
    const card = document.createElement("article");
    const preview = document.createElement("div");
    const image = document.createElement("img");
    const body = document.createElement("div");
    const label = document.createElement("p");
    const title = document.createElement("h2");
    const expected = document.createElement("p");
    const actions = document.createElement("div");
    const viewButton = document.createElement("button");
    const downloadLink = document.createElement("a");

    card.className = "sample-card";
    preview.className = "sample-card__preview";
    image.src = sample.arquivo;
    image.alt = `Prévia do comprovante fictício de ${sample.estabelecimento}`;
    image.loading = "lazy";
    body.className = "sample-card__body";
    label.className = "sample-card__label";
    label.textContent = "Amostra fictícia";
    title.className = "sample-card__title";
    title.textContent = sample.estabelecimento;
    expected.className = "sample-card__expected";
    expected.textContent = `Valor esperado: ${this.formatMoney(sample.valorEsperado)}`;
    actions.className = "sample-card__actions";
    viewButton.className = "sample-card__button";
    viewButton.type = "button";
    viewButton.dataset.viewSample = sample.id;
    viewButton.textContent = "Visualizar";
    downloadLink.className = "sample-card__button sample-card__button--primary";
    downloadLink.href = sample.arquivo;
    downloadLink.download = sample.arquivo.split("/").pop();
    downloadLink.textContent = "Baixar";
    downloadLink.setAttribute("aria-label", `Baixar comprovante fictício de ${sample.estabelecimento}`);

    preview.append(image);
    actions.append(viewButton, downloadLink);
    body.append(label, title, expected, actions);
    card.append(preview, body);
    return card;
  }

  handleCatalogClick = (event) => {
    const button = event.target.closest("[data-view-sample]");
    if (!button) return;

    const sample = SAMPLE_RECEIPTS.find((item) => item.id === button.dataset.viewSample);
    if (!sample) return;

    this.previewTitle.textContent = sample.estabelecimento;
    this.previewImage.src = sample.arquivo;
    this.previewImage.alt = `Comprovante fictício ampliado de ${sample.estabelecimento}`;
    this.dialog.showModal();
  };

  closePreview = () => this.dialog.close();

  formatMoney(value) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  }
}

customElements.define("sample-receipts", SampleReceipts);
