class ReceiptUploader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="receipt-uploader">
        <label class="receipt-uploader__label" for="receipt-image">
          <input
            class="visually-hidden"
            id="receipt-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
          />
          <span class="receipt-uploader__content">
            <span class="receipt-uploader__icon" aria-hidden="true">🧾</span>
            <span class="receipt-uploader__title">Clique para selecionar um comprovante</span>
            <span class="receipt-uploader__hint">A imagem ficará somente neste navegador</span>
          </span>
        </label>
      </section>
    `;

    const input = this.querySelector("input");
    const content = this.querySelector(".receipt-uploader__content");

    this.handleUploadStatus = (event) => {
      const hint = this.querySelector(".receipt-uploader__hint");

      if (hint) hint.textContent = event.detail.message;
    };

    document.addEventListener("receipt-upload-status", this.handleUploadStatus);

    input.addEventListener("change", () => {
      const [file] = input.files;

      if (!file) return;

      if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = URL.createObjectURL(file);

      content.innerHTML = `
        <img class="receipt-uploader__preview" alt="Prévia do comprovante selecionado" />
        <span class="receipt-uploader__title">${this.escapeHtml(file.name)}</span>
        <span class="receipt-uploader__hint">Clique para escolher outra imagem</span>
      `;

      content.querySelector("img").src = this.previewUrl;

      document.dispatchEvent(
        new CustomEvent("receipt-selected", { detail: { file } }),
      );
    });
  }

  disconnectedCallback() {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    document.removeEventListener("receipt-upload-status", this.handleUploadStatus);
  }

  escapeHtml(value) {
    const span = document.createElement("span");
    span.textContent = value;
    return span.innerHTML;
  }
}

customElements.define("receipt-uploader", ReceiptUploader);
