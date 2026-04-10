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

// Simulate a frequency spectrum using overlapping sine waves at different rates.
// Each bar gets a unique combination so adjacent bars move somewhat independently.
function getBarValue(i: number, t: number): number {
  const p = i / NUM_BARS;
  const v =
    Math.sin(t * 2.4 + p * 18.1) * 0.25 +
    Math.sin(t * 1.3 + p * 7.3) * 0.2 +
    Math.sin(t * 3.9 + p * 31.4) * 0.15 +
    Math.sin(t * 0.9 + p * 4.7) * 0.2 +
    // bass bump: taller bars toward i=0
    Math.exp(-p * 5) * Math.abs(Math.sin(t * 2.8)) * 0.2;
  return Math.max(0, v * 0.5 + 0.5);
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
    const maxBarLen = minDim * 0.07;

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
