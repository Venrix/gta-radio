import './style.css';
import './components/radial-menu/radial-menu.js';
import './components/radial-button/radial-button.js';
import { stations } from './stations.js';
import { play, stop, setVolume, getVolume } from './player.js';
import {
  start as startVisualizer,
  stop as stopVisualizer
} from './visualizer.js';

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

menu.addEventListener('activate', (e) => {
  const el = (e as CustomEvent<{ element: Element }>).detail.element;
  const url = el.getAttribute('data-url');
  const title = el.getAttribute('title') ?? 'Unknown';
  if (url) {
    play(url);
    startVisualizer();
    hudStation.textContent = title;
  } else {
    stop();
    stopVisualizer();
    hudStation.textContent = 'No Station';
  }
});

if (!DEBUG) {
  menu.style.display = 'none';

  document.addEventListener('keydown', (e) => {
    if (e.key === 'q' && !e.repeat) menu.style.display = '';
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'q') menu.style.display = 'none';
  });
}
