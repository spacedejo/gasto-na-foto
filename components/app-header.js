class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="app-header">
        <button class="app-header__menu-button" type="button" aria-label="Abrir menu" aria-expanded="false">
          <span aria-hidden="true">☰</span>
        </button>
        <a class="app-header__brand" href="#visao-geral" aria-label="SpaceD — Gasto na Foto">
          <span class="app-header__brand-mark" aria-hidden="true">S</span>
          <span class="app-header__brand-copy">
            <span class="app-header__space">SpaceD</span>
            <span class="app-header__divider" aria-hidden="true">/</span>
            <span class="app-header__product">📸 Gasto na Foto</span>
          </span>
        </a>
        <span class="ai-status" aria-label="Indicador visual de inteligência artificial">
          <span class="ai-status__dot" aria-hidden="true"></span> IA
        </span>
      </header>
    `;

    this.menuButton = this.querySelector(".app-header__menu-button");
    this.menuButton.addEventListener("click", this.handleMenuToggle);
    document.addEventListener("sidebar-state-change", this.handleSidebarState);
  }

  disconnectedCallback() {
    this.menuButton?.removeEventListener("click", this.handleMenuToggle);
    document.removeEventListener("sidebar-state-change", this.handleSidebarState);
  }

  handleMenuToggle = () => document.dispatchEvent(new CustomEvent("toggle-sidebar"));

  handleSidebarState = (event) => {
    const isOpen = Boolean(event.detail?.isOpen);
    this.menuButton.setAttribute("aria-expanded", String(isOpen));
    this.menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  };
}

customElements.define("app-header", AppHeader);
