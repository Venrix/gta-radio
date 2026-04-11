import './style.css';
import './components/radial-menu/radial-menu.js';
import './components/radial-button/radial-button.js';
import { stations } from './stations.js';
import { play, stop, setVolume, getVolume, onStationEnded } from './player.js';
import {
  start as startVisualizer,
  stop as stopVisualizer
} from './visualizer.js';

const EPOCH = 1700000000000;

const DEBUG = false;

const menu = document.querySelector('radial-menu')!;

for (const station of stations) {
  if (station.disabled) continue;
  const button = document.createElement('radial-button');
  button.setAttribute('title', station.title);
  button.setAttribute('data-url', station.url);
  menu.appendChild(button);
}

const hudStation = document.getElementById('hud-station')!;
const hudVolume = document.getElementById('hud-volume')!;
const hudHint = document.getElementById('hud-hint')!;

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
hudHint.textContent = isTouchDevice
  ? 'Long-press to switch Radio  ·  Two-finger swipe to adjust volume'
  : 'Hold Q to switch Radio  ·  Scroll to adjust volume';

hudVolume.textContent = `Volume: ${getVolume()}%`;

let volumeHideTimeout: ReturnType<typeof setTimeout> | null = null;

document.addEventListener(
  'wheel',
  (e) => {
    const next = getVolume() - Math.sign(e.deltaY) * 5;
    setVolume(next);
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

document.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    twoFingerStartY = avgTouchY(e.touches);
    volumeAtGestureStart = getVolume();
    hudVolume.classList.add('visible');
    if (volumeHideTimeout !== null) clearTimeout(volumeHideTimeout);
  }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (e.touches.length !== 2 || twoFingerStartY === null) return;
  // Swipe up = louder, swipe down = quieter
  const deltaY = twoFingerStartY - avgTouchY(e.touches);
  // Map ~200px of travel to full 0-100 range
  const volumeDelta = Math.round(deltaY / 2);
  setVolume(volumeAtGestureStart + volumeDelta);
  hudVolume.textContent = `Volume: ${getVolume()}%`;
  hudVolume.classList.add('visible');
  if (volumeHideTimeout !== null) clearTimeout(volumeHideTimeout);
}, { passive: true });

document.addEventListener('touchend', () => {
  if (twoFingerStartY === null) return;
  twoFingerStartY = null;
  volumeHideTimeout = setTimeout(() => {
    hudVolume.classList.remove('visible');
    volumeHideTimeout = null;
  }, 1500);
}, { passive: true });

menu.addEventListener('activate', (e) => {
  const el = (e as CustomEvent<{ element: Element }>).detail.element;
  const url = el.getAttribute('data-url');
  const title = el.getAttribute('title') ?? 'Unknown';
  if (url) {
    const station = stations.find((s) => s.url === url);
    const offset = station ? ((Date.now() - EPOCH) % (station.duration * 60 * 1000)) / 1000 : 0;
    play(url, offset);
    startVisualizer();
    hudStation.textContent = title;
  } else {
    stop();
    stopVisualizer();
    hudStation.textContent = 'No Station';
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

  // Prevent native context menu on long-press (mobile)
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  document.addEventListener('keydown', (e) => {
    if (e.key === 'q' && !e.repeat) menu.style.display = '';
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'q') menu.style.display = 'none';
  });

  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  let touchStartX = 0;
  let touchStartY = 0;
  const LONG_PRESS_MOVE_THRESHOLD = 15; // px – ignore small finger jitter

  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    touchStartX = e.clientX;
    touchStartY = e.clientY;
    longPressTimer = setTimeout(() => {
      longPressTimer = null;
      menu.style.display = '';
    }, 300);
  });

  const cancelLongPress = () => {
    if (longPressTimer === null) return;
    clearTimeout(longPressTimer);
    longPressTimer = null;
  };

  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'touch') return;
    // Only cancel the long-press timer if the finger moved far enough
    const dx = e.clientX - touchStartX;
    const dy = e.clientY - touchStartY;
    if (dx * dx + dy * dy > LONG_PRESS_MOVE_THRESHOLD * LONG_PRESS_MOVE_THRESHOLD) {
      cancelLongPress();
    }
  });
  document.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'touch') return;
    cancelLongPress();
    menu.style.display = 'none';
  });
  document.addEventListener('pointercancel', (e) => {
    if (e.pointerType !== 'touch') return;
    cancelLongPress();
    menu.style.display = 'none';
  });
}
