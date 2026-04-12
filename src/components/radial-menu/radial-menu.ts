import sheet from './radial-menu.css?inline';
import selectionUrl from '../../assets/sounds/selection.wav';

const styles = new CSSStyleSheet();
styles.replaceSync(sheet);

const selectionSound = new Audio(selectionUrl);

export class RadialMenu extends HTMLElement {
  static observedAttributes: string[] = [];

  readonly #shadow: ShadowRoot;

  readonly #slot: HTMLSlotElement;

  #angles: number[] = [];

  #selectedIndex = -1;

  #hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  #activateTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly #resizeObserver = new ResizeObserver(() => this.#arrange());

  #hoverDelay = 8;

  #deadzone = 0.18;

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.adoptedStyleSheets = [styles];
    this.#shadow.innerHTML = `
      <div class="radial-menu-wrapper">
        <slot></slot>
      </div>
    `;
    this.#slot = this.#shadow.querySelector('slot')!;
  }

  connectedCallback(): void {
    if (!this.querySelector('[data-radio-off]')) {
      const radioOff = document.createElement('radial-button');
      radioOff.setAttribute('title', 'Radio Off');
      radioOff.setAttribute('data-radio-off', '');
      radioOff.setAttribute('selected', '');
      this.appendChild(radioOff);
    }
    this.#slot.addEventListener('slotchange', this.#arrange);
    this.#resizeObserver.observe(this);
    document.addEventListener('pointermove', this.#handleHover);
  }

  disconnectedCallback(): void {
    this.querySelector('[data-radio-off]')?.remove();
    this.#slot.removeEventListener('slotchange', this.#arrange);
    this.#resizeObserver.disconnect();
    document.removeEventListener('pointermove', this.#handleHover);
  }

  readonly #handleHover = (e: PointerEvent): void => {
    if (!this.checkVisibility()) return;
    if (this.getAttribute('mode') === 'click') return;

    const items = this.#slot.assignedElements();
    if (items.length === 0) return;

    const rect = this.getBoundingClientRect();
    const dx = e.clientX - rect.left - rect.width / 2;
    const dy = e.clientY - rect.top - rect.height / 2;

    const deadzoneRadius = Math.min(rect.width, rect.height) * this.#deadzone;
    if (dx * dx + dy * dy < deadzoneRadius * deadzoneRadius) {
      if (this.#hoverTimeout !== null) clearTimeout(this.#hoverTimeout);
      if (this.#activateTimeout !== null) clearTimeout(this.#activateTimeout);
      this.#hoverTimeout = null;
      this.#activateTimeout = null;
      if (this.#selectedIndex !== -1) {
        this.#selectedIndex = -1;
        for (const item of items) item.removeAttribute('selected');
      }
      return;
    }

    const cursorAngle = Math.atan2(dy, dx);

    let nearestIndex = 0;
    let minDist = Infinity;
    this.#angles.forEach((angle, i) => {
      const dist = Math.abs(
        ((cursorAngle - angle + 3 * Math.PI) % (2 * Math.PI)) - Math.PI
      );
      if (dist < minDist) {
        minDist = dist;
        nearestIndex = i;
      }
    });

    if (nearestIndex === this.#selectedIndex) return;

    if (this.#hoverTimeout !== null) clearTimeout(this.#hoverTimeout);
    if (this.#activateTimeout !== null) clearTimeout(this.#activateTimeout);
    this.#hoverTimeout = setTimeout(() => {
      this.#hoverTimeout = null;
      this.#selectedIndex = nearestIndex;

      for (const item of items) {
        item.removeAttribute('selected');
      }
      items[nearestIndex].setAttribute('selected', '');

      selectionSound.currentTime = 0;
      selectionSound.play();

      const delay = items[nearestIndex].hasAttribute('data-radio-off')
        ? 0
        : 2000;
      this.#activateTimeout = setTimeout(() => {
        this.#activateTimeout = null;
        this.dispatchEvent(
          new CustomEvent('activate', {
            detail: { element: items[nearestIndex] },
            bubbles: true
          })
        );
      }, delay);
    }, this.#hoverDelay);
  };

  readonly #arrange = (): void => {
    const items = this.#slot.assignedElements();
    const n = items.length;
    if (n === 0) return;

    const containerSize = Math.min(this.clientWidth, this.clientHeight);
    const fontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    const buttonSize = 5 * fontSize; // matches 5rem in radial-button.css
    const minRadius = (buttonSize * 1.1) / (2 * Math.sin(Math.PI / n));
    const radius = Math.min(containerSize * 0.45, minRadius);
    const cx = this.clientWidth / 2;
    const cy = this.clientHeight / 2;

    const radioOffIndex = items.findIndex((el) =>
      el.hasAttribute('data-radio-off')
    );
    const step = (2 * Math.PI) / n;
    let regularCounter = 0;

    this.#angles = items.map((el, i) => {
      let angle: number;
      if (i === radioOffIndex) {
        angle = Math.PI / 2;
      } else {
        angle = Math.PI / 2 + step * (regularCounter + 1);
        regularCounter++;
      }

      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      const item = el as HTMLElement;
      item.style.position = 'absolute';
      item.style.left = `${x}px`;
      item.style.top = `${y}px`;
      item.style.transform = 'translate(-50%, -50%)';
      return angle;
    });
  };

  attributeChangedCallback(
    _name: string,
    _old: string | null,
    _next: string | null
  ): void {}
}

customElements.define('radial-menu', RadialMenu);

declare global {
  interface HTMLElementTagNameMap {
    'radial-menu': RadialMenu;
  }
}
