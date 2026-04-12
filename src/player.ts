const blipUrls = Object.values(
  import.meta.glob('./assets/sounds/radio_blip_*.wav', {
    eager: true,
    query: '?url',
    import: 'default'
  })
) as string[];

function playRandomBlip(): Promise<void> {
  const url = blipUrls[Math.floor(Math.random() * blipUrls.length)];
  const audio = new Audio(url);
  audio.volume = volume / 100;
  return new Promise((resolve) => {
    audio.addEventListener('ended', () => resolve(), { once: true });
    audio.addEventListener('error', () => resolve(), { once: true });
    audio.play().catch(() => resolve());
  });
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}

const timestamps = new Map<string, number>();

let player: YT.Player | null = null;
let currentUrl: string | null = null;
let volume = Number(localStorage.getItem('volume') ?? 50);
let endedCallback: ((url: string) => void) | null = null;
let playingCallback: (() => void) | null = null;
let errorCallback: (() => void) | null = null;

export function onStationEnded(cb: (url: string) => void): void {
  endedCallback = cb;
}

export function onStationPlaying(cb: () => void): void {
  playingCallback = cb;
}

export function onStationError(cb: () => void): void {
  errorCallback = cb;
}

export function extractVideoId(url: string): string | null {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

const playerReady = new Promise<YT.Player>((resolve) => {
  window.onYouTubeIframeAPIReady = () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    player = new YT.Player(div, {
      height: '0',
      width: '0',
      playerVars: { autoplay: 1 },
      events: {
        onReady: () => {
          player!.setVolume(volume);
          resolve(player!);
        },
        onStateChange: ({ data }) => {
          if (data === YT.PlayerState.PLAYING) {
            playingCallback?.();
          }
          if (data === YT.PlayerState.ENDED && currentUrl) {
            endedCallback?.(currentUrl);
          }
        },
        onError: () => {
          errorCallback?.();
        }
      }
    });
  };
});

const script = document.createElement('script');
script.src = 'https://www.youtube.com/iframe_api';
script.addEventListener('error', () => errorCallback?.());
document.head.appendChild(script);

// If the YouTube API never loads (e.g. blocked by VPN/firewall),
// fire the error callback so the UI doesn't stay on "Loading..." forever.
setTimeout(() => {
  if (!player) errorCallback?.();
}, 10000);

export async function play(url: string, startSeconds?: number): Promise<void> {
  const videoId = extractVideoId(url);
  if (!videoId) return;

  const p = await playerReady;

  if (currentUrl) {
    timestamps.set(currentUrl, p.getCurrentTime());
  }

  currentUrl = url;
  const offset = startSeconds ?? timestamps.get(url) ?? 0;
  await playRandomBlip();
  p.loadVideoById({ videoId, startSeconds: offset });
}

export function setVolume(v: number): void {
  volume = Math.max(0, Math.min(100, Math.round(v)));
  localStorage.setItem('volume', String(volume));
  player?.setVolume(volume);
}

export function getVolume(): number {
  return volume;
}

export function stop(): void {
  if (!player) return;
  if (currentUrl) {
    timestamps.set(currentUrl, player.getCurrentTime());
    currentUrl = null;
  }
  player.stopVideo();
}
