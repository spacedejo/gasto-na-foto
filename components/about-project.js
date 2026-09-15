class AboutProject extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="information-panel" aria-labelledby="about-title">
        <p class="section-heading__eyebrow">Projeto educacional</p>
        <h1 class="information-panel__title" id="about-title">Sobre o Gasto na Foto</h1>
        <p class="information-panel__lead">
          Gasto na Foto é um projeto educacional criado pela SpaceD como evolução prática de um exercício de estudo sobre programação e inteligência artificial.
        </p>
        <div class="about-flow" aria-label="Como o projeto funciona">
          <article class="about-flow__item">
            <span class="about-flow__number">01</span>
            <div><h2>Envio</h2><p>O usuário seleciona uma imagem de comprovante para análise.</p></div>
          </article>
          <article class="about-flow__item">
            <span class="about-flow__number">02</span>
            <div><h2>Inteligência artificial</h2><p>O backend processa temporariamente a imagem com IA e devolve os dados reconhecidos.</p></div>
          </article>
          <article class="about-flow__item">
            <span class="about-flow__number">03</span>
            <div><h2>Organização</h2><p>Os dados alimentam o dashboard e, nesta V1, ficam armazenados localmente no navegador.</p></div>
          </article>
        </div>
        <p class="information-panel__privacy">As imagens analisadas não são persistidas.</p>
      </section>
    `;
  }
}

customElements.define("about-project", AboutProject);
