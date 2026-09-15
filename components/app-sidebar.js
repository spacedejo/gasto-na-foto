class AppSidebar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <aside class="app-sidebar" aria-label="Navegação principal">
        <nav class="app-sidebar__nav">
          <a class="app-sidebar__link is-active" href="#visao-geral">
            <svg class="app-sidebar__icon" aria-hidden="true" viewBox="0 0 24 24">
              <rect width="7" height="9" x="3" y="3" rx="1"></rect>
              <rect width="7" height="5" x="14" y="3" rx="1"></rect>
              <rect width="7" height="9" x="14" y="12" rx="1"></rect>
              <rect width="7" height="5" x="3" y="16" rx="1"></rect>
            </svg>
            Visão geral
          </a>
          <a class="app-sidebar__link" href="#historico">
            <svg class="app-sidebar__icon" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path>
              <path d="M3 3v5h5"></path>
              <path d="M12 7v5l3 2"></path>
            </svg>
            Histórico
          </a>
          <a class="app-sidebar__link" href="#comprovantes-teste">
            <svg class="app-sidebar__icon" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"></path>
              <path d="M9 8h6M9 12h6"></path>
            </svg>
            Comprovantes para teste
          </a>
          <a class="app-sidebar__link" href="#sobre">
            <svg class="app-sidebar__icon" aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 11v5"></path>
              <path d="M12 8h.01"></path>
            </svg>
            Sobre
          </a>
        </nav>
        <div class="app-sidebar__note">
          <span class="app-sidebar__note-icon" aria-hidden="true">✦</span>
          <p>Uma experiência educacional criada pela SpaceD.</p>
        </div>
      </aside>
      <button class="sidebar-backdrop" type="button" aria-label="Fechar menu"></button>
    `;

    this.sidebar = this.querySelector(".app-sidebar");
    this.backdrop = this.querySelector(".sidebar-backdrop");
    this.links = [...this.querySelectorAll(".app-sidebar__link")];
    document.addEventListener("toggle-sidebar", this.handleToggle);
    window.addEventListener("hashchange", this.updateActiveLink);
    this.backdrop.addEventListener("click", this.close);
    this.links.forEach((link) => link.addEventListener("click", this.handleLinkClick));
    this.updateActiveLink();
  }

  disconnectedCallback() {
    document.removeEventListener("toggle-sidebar", this.handleToggle);
    window.removeEventListener("hashchange", this.updateActiveLink);
    this.backdrop?.removeEventListener("click", this.close);
    this.links?.forEach((link) => link.removeEventListener("click", this.handleLinkClick));
  }

  handleToggle = () => this.setOpen(!this.sidebar.classList.contains("is-open"));

  handleLinkClick = (event) => {
    this.setActiveLink(event.currentTarget.getAttribute("href"));
    this.close();
  };

  updateActiveLink = () => {
    const hash = window.location.hash || "#visao-geral";
    this.setActiveLink(hash);
  };

  setActiveLink(hash) {
    this.links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === hash);
    });
  }

  close = () => this.setOpen(false);

  setOpen(isOpen) {
    this.sidebar.classList.toggle("is-open", isOpen);
    this.backdrop.classList.toggle("is-visible", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    document.dispatchEvent(new CustomEvent("sidebar-state-change", { detail: { isOpen } }));
  }
}

customElements.define("app-sidebar", AppSidebar);
