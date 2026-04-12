import './style.css';
import './components/radial-menu/radial-menu.js';
import './components/radial-button/radial-button.js';
import { stations } from './stations.js';
import {
  play,
  stop,
  setVolume,
  getVolume,
  onStationEnded,
  onStationPlaying,
  onStationError
} from './player.js';
import {
  start as startVisualizer,
  stop as stopVisualizer,
  setVolumeScale
} from './visualizer.js';

const EPOCH = 1700000000000;

const DEBUG = false;

const menu = document.querySelector('radial-menu')!;

for (const station of stations) {
  if (station.disabled) continue;
  const button = document.createElement('radial-button');
  button.setAttribute('title', station.title);
  button.setAttribute('data-url', station.url);
  button.setAttribute('data-id', station.id);
  button.setAttribute('icon', station.icon);
  menu.appendChild(button);
}

const hudStation = document.getElementById('hud-station')!;
const hudVolume = document.getElementById('hud-volume')!;
const hudHint = document.getElementById('hud-hint')!;

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
hudHint.textContent = isTouchDevice
  ? 'Tap station name to switch Radio  ·  Two-finger swipe to adjust volume'
  : 'Hold Q to switch Radio  ·  Scroll to adjust volume';

hudVolume.textContent = `Volume: ${getVolume()}%`;
setVolumeScale(getVolume() / 100);

let volumeHideTimeout: ReturnType<typeof setTimeout> | null = null;

document.addEventListener(
  'wheel',
  (e) => {
    const next = getVolume() - Math.sign(e.deltaY) * 5;
    setVolume(next);
    setVolumeScale(getVolume() / 100);
    hudVolume.textContent = `Volume: ${getVolume()}%`;
    hudVolume.classList.add('visible');
    if (volumeHideTimeout !== null) clearTimeout(volumeHideTimeout);
    volumeHideTimeout = setTimeout(() => {
      hudVolume.classList.remove('visible');
      volumeHideTimeout = null;
    }, 1500);
  },
  { passive: true }
);

// ── Mobile volume: two-finger vertical swipe ──
let twoFingerStartY: number | null = null;
let volumeAtGestureStart = 0;

function avgTouchY(touches: TouchList): number {
  let sum = 0;
  for (let i = 0; i < touches.length; i++) sum += touches[i].clientY;
  return sum / touches.length;
}

document.addEventListener(
  'touchstart',
  (e) => {
    if (e.touches.length === 2) {
      twoFingerStartY = avgTouchY(e.touches);
      volumeAtGestureStart = getVolume();
      hudVolume.classList.add('visible');
      if (volumeHideTimeout !== null) clearTimeout(volumeHideTimeout);
    }
  },
  { passive: true }
);

document.addEventListener(
  'touchmove',
  (e) => {
    if (e.touches.length !== 2 || twoFingerStartY === null) return;
    // Swipe up = louder, swipe down = quieter
    const deltaY = twoFingerStartY - avgTouchY(e.touches);
    // Map ~200px of travel to full 0-100 range
    const volumeDelta = Math.round(deltaY / 2);
    setVolume(volumeAtGestureStart + volumeDelta);
    setVolumeScale(getVolume() / 100);
    hudVolume.textContent = `Volume: ${getVolume()}%`;
    hudVolume.classList.add('visible');
    if (volumeHideTimeout !== null) clearTimeout(volumeHideTimeout);
  },
  { passive: true }
);

document.addEventListener(
  'touchend',
  () => {
    if (twoFingerStartY === null) return;
    twoFingerStartY = null;
    volumeHideTimeout = setTimeout(() => {
      hudVolume.classList.remove('visible');
      volumeHideTimeout = null;
    }, 1500);
  },
  { passive: true }
);

let pendingTitle: string | null = null;

onStationPlaying(() => {
  if (pendingTitle !== null) {
    hudStation.classList.remove('error');
    hudStation.textContent = pendingTitle;
    pendingTitle = null;
    startVisualizer();
  }
});

onStationError(() => {
  if (pendingTitle !== null) {
    hudStation.textContent = 'Playback Failed';
    hudStation.classList.add('error');
    pendingTitle = null;
    stopVisualizer();
  }
});

function playStation(station: (typeof stations)[number]): void {
  const offset =
    ((Date.now() - EPOCH) % (station.duration * 60 * 1000)) / 1000;
  pendingTitle = station.title;
  hudStation.classList.remove('error');
  hudStation.textContent = 'Loading...';
  stopVisualizer();
  play(station.url, offset);
}

function stopStation(): void {
  pendingTitle = null;
  stop();
  stopVisualizer();
  hudStation.textContent = 'No Station';
}

menu.addEventListener('activate', (e) => {
  const el = (e as CustomEvent<{ element: Element }>).detail.element;
  const id = el.getAttribute('data-id');
  const station = id ? stations.find((s) => s.id === id) : null;
  if (station) {
    playStation(station);
    history.pushState(null, '', `/${station.id}`);
  } else {
    stopStation();
    history.pushState(null, '', '/');
  }
});

onStationEnded((url) => {
  const station = stations.find((s) => s.url === url);
  if (!station) return;
  const offset = ((Date.now() - EPOCH) % (station.duration * 60 * 1000)) / 1000;
  play(url, offset);
});

if (!DEBUG) {
  menu.style.display = 'none';

  // ── Desktop: hold Q (hover mode) ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'q' && !e.repeat) {
      menu.setAttribute('mode', 'hover');
      menu.style.display = '';
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'q') menu.style.display = 'none';
  });

  // ── Click mode: tap station name to toggle wheel ──
  hudStation.addEventListener('click', () => {
    const isOpen = menu.style.display !== 'none';
    if (isOpen) {
      menu.style.display = 'none';
    } else {
      menu.setAttribute('mode', 'click');
      menu.style.display = '';
    }
  });

  // Close menu after a station is activated (click mode only)
  menu.addEventListener('activate', () => {
    if (menu.getAttribute('mode') === 'click') {
      menu.style.display = 'none';
    }
  });

  // ── Click-mode: direct tap on station buttons ──
  for (const btn of menu.querySelectorAll('radial-button')) {
    btn.addEventListener('click', () => {
      if (menu.getAttribute('mode') !== 'click') return;
      // Highlight the tapped button
      for (const b of menu.querySelectorAll('radial-button'))
        b.removeAttribute('selected');
      btn.setAttribute('selected', '');
      // Fire activation
      menu.dispatchEvent(
        new CustomEvent('activate', {
          detail: { element: btn },
          bubbles: true
        })
      );
    });
  }
}

// ── URL routing ──
window.addEventListener('popstate', () => {
  const id = location.pathname.slice(1);
  const station = id ? stations.find((s) => s.id === id) : null;
  if (station) {
    playStation(station);
  } else {
    stopStation();
  }
});

// Auto-play station from URL on initial load
const initialId = location.pathname.slice(1);
const initialStation = initialId
  ? stations.find((s) => s.id === initialId)
  : null;
if (initialStation) {
  hudStation.textContent = initialStation.title;
  hudHint.textContent = 'Click anywhere to start listening';
  const overlay = document.createElement('div');
  overlay.id = 'click-to-play';
  document.body.appendChild(overlay);
  const startOnInteraction = () => {
    overlay.remove();
    hudHint.textContent = isTouchDevice
      ? 'Tap station name to switch Radio  ·  Two-finger swipe to adjust volume'
      : 'Hold Q to switch Radio  ·  Scroll to adjust volume';
    playStation(initialStation);
  };
  overlay.addEventListener('click', startOnInteraction, { once: true });
}
