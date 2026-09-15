class AppFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="app-footer">
        <span>Projeto educacional • SpaceD</span>
        <span>Missão Programação do ZERO com IA</span>
      </footer>
    `;
  }
}

customElements.define("app-footer", AppFooter);
