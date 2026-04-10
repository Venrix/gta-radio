const blipUrls = Object.values(
  import.meta.glob<string>('./assets/sounds/radio_blip_*.wav', { eager: true, query: '?url', import: 'default' })
);

function playRandomBlip(): Promise<void> {
  const url = blipUrls[Math.floor(Math.random() * blipUrls.length)];
  const audio = new Audio(url);
  return new Promise((resolve) => {
    audio.addEventListener('ended', resolve, { once: true });
    audio.addEventListener('error', resolve, { once: true });
    audio.play().catch(resolve);
  });
}

const timestamps = new Map<string, number>();

let player: YT.Player | null = null;
let currentUrl: string | null = null;
let volume = 50;

function extractVideoId(url: string): string | null {
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
      },
    });
  };
});

const script = document.createElement('script');
script.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(script);

export async function play(url: string): Promise<void> {
  const videoId = extractVideoId(url);
  if (!videoId) return;

  const p = await playerReady;

  if (currentUrl) {
    timestamps.set(currentUrl, p.getCurrentTime());
  }

  currentUrl = url;
  const startSeconds = timestamps.get(url) ?? 0;
  await playRandomBlip();
  p.loadVideoById({ videoId, startSeconds });
}

export function setVolume(v: number): void {
  volume = Math.max(0, Math.min(100, Math.round(v)));
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
