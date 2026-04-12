const NUM_BARS = 80;
const VISUALIZER_RADIUS = 0.2;

const canvas = document.createElement('canvas');
canvas.style.cssText =
  'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d')!;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let rafId: number | null = null;
let startTime = 0;
let opacity = 0;
let targetOpacity = 0;
let volumeScale = 0.5; // 0 → 1, driven by player volume

export function setVolumeScale(v: number): void {
  volumeScale = Math.max(0, Math.min(1, v));
}

const PERM = new Uint8Array(512);
{
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  PERM.set(p);
  PERM.set(p, 256);
}

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function grad(hash: number, x: number): number {
  return hash & 1 ? -x : x;
}

function noise1d(x: number): number {
  const xi = Math.floor(x) & 255;
  const xf = x - Math.floor(x);
  const u = fade(xf);
  return (1 - u) * grad(PERM[xi], xf) + u * grad(PERM[xi + 1], xf - 1);
}

function fbm(x: number, octaves: number): number {
  let v = 0;
  let amp = 1;
  let freq = 1;
  let max = 0;
  for (let i = 0; i < octaves; i++) {
    v += noise1d(x * freq) * amp;
    max += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return v / max;
}

function kick(t: number, bpm: number): number {
  const beatSec = 60 / bpm;
  const phase = (t % beatSec) / beatSec;
  return Math.exp(-phase * 4) * 0.7;
}

function beatEnvelope(t: number): number {
  return (
    kick(t, 100) * 0.3 +
    kick(t + 0.13, 128) * 0.25 +
    kick(t + 0.07, 87) * 0.2 +
    kick(t + 0.31, 140) * 0.1
  );
}

function getBarValue(i: number, t: number): number {
  const p = i / NUM_BARS;

  const n = fbm(p * 4.0 + t * 0.8, 4) * 0.25 + fbm(p * 8.0 - t * 0.5, 3) * 0.15;

  const bass = Math.exp(-p * 4) * 0.2;

  const beat = beatEnvelope(t) * (0.18 + bass * 0.5);

  const treble =
    p > 0.5 ? Math.abs(noise1d(p * 20 + t * 2.5)) * 0.1 * (p - 0.5) * 2 : 0;

  const raw = 0.3 + n + bass + beat + treble;
  // Scale intensity by current volume (keep a small minimum so bars don't vanish at 0)
  const scaled = raw * (0.15 + volumeScale * 0.85);
  return Math.max(0, Math.min(1, scaled));
}

function draw(ts: number) {
  const t = (ts - startTime) / 1000;

  opacity += (targetOpacity - opacity) * 0.04;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (opacity > 0.005) {
    const cx = w / 2;
    const cy = h / 2;
    const minDim = Math.min(w, h);
    const innerR = minDim * VISUALIZER_RADIUS;
    const maxBarLen = minDim * 0.1;

    for (let i = 0; i < NUM_BARS; i++) {
      const angle = (i / NUM_BARS) * Math.PI * 2 - Math.PI / 2;
      const val = getBarValue(i, t);
      const barLen = val * maxBarLen;

      const x1 = cx + Math.cos(angle) * innerR;
      const y1 = cy + Math.sin(angle) * innerR;
      const x2 = cx + Math.cos(angle) * (innerR + barLen);
      const y2 = cy + Math.sin(angle) * (innerR + barLen);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * (0.3 + val * 0.7)})`;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  if (opacity > 0.005 || targetOpacity > 0) {
    rafId = requestAnimationFrame(draw);
  } else {
    rafId = null;
  }
}

export function start(): void {
  targetOpacity = 1;
  if (rafId === null) {
    startTime = performance.now();
    rafId = requestAnimationFrame(draw);
  }
}

export function stop(): void {
  targetOpacity = 0;
  if (rafId === null) {
    rafId = requestAnimationFrame(draw);
  }
}
