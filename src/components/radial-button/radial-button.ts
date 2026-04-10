import sheet from './radial-button.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(sheet);

export class RadialButton extends HTMLElement {
  static observedAttributes: string[] = ['title'];

  readonly #shadow: ShadowRoot;
  readonly #label: HTMLSpanElement;

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.adoptedStyleSheets = [styles];
    this.#shadow.innerHTML = `
        <span class="title"></span>
    `;
    this.#label = this.#shadow.querySelector('.title')!;
  }

  connectedCallback(): void {
    this.#label.textContent = this.getAttribute('title') ?? '';
  }

  disconnectedCallback(): void {}

  attributeChangedCallback(
    name: string,
    _old: string | null,
    next: string | null
  ): void {
    if (name === 'title') {
      this.#label.textContent = next ?? '';
    }
  }
}

customElements.define('radial-button', RadialButton);

declare global {
  interface HTMLElementTagNameMap {
    'radial-button': RadialButton;
  }
}
