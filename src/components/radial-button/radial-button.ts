import sheet from './radial-button.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(sheet);

export class RadialButton extends HTMLElement {
  static observedAttributes: string[] = ['title', 'icon'];

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
    this.#loadIcon(this.getAttribute('icon'));
  }

  disconnectedCallback(): void {}

  attributeChangedCallback(
    name: string,
    _old: string | null,
    next: string | null
  ): void {
    if (name === 'title') {
      this.#label.textContent = next ?? '';
    } else if (name === 'icon') {
      this.#loadIcon(next);
    }
  }

  #loadIcon(src: string | null): void {
    if (!src) {
      this.style.backgroundImage = '';
      this.classList.remove('has-icon');
      return;
    }
    const img = new Image();
    img.onload = () => {
      this.style.backgroundImage = `url(${src})`;
      this.classList.add('has-icon');
    };
    img.onerror = () => {
      this.style.backgroundImage = '';
      this.classList.remove('has-icon');
    };
    img.src = src;
  }
}

customElements.define('radial-button', RadialButton);

declare global {
  interface HTMLElementTagNameMap {
    'radial-button': RadialButton;
  }
}
