# GTA Radio

A browser-based GTA radio player. Each station is a YouTube video playing through a hidden iframe. Hold Q (or long-press on mobile) to open the radial wheel, hover over a station, and it tunes in. All clients are synced so listeners all hear the same position in the broadcast.

## Features

- 24 GTA V / GTA Online stations (Blue Ark, FlyLo FM, Worldwide FM, Non-Stop-Pop FM, and more)
- Radial wheel UI modeled after the GTA radio wheel
- Clock-synced playback: all clients independently calculate the current offset from a shared epoch
- Stations auto-loop when the video ends
- 80-bar circular visualizer on a fullscreen canvas
- Volume control via scroll wheel, persisted in `localStorage`
- Mobile support via long-press

## How sync works

Each station has a `duration` (in minutes). A hardcoded `EPOCH` timestamp acts as the broadcast start time. When any client tunes into a station, it calculates:

```
offset = ((Date.now() - EPOCH) % (duration * 60 * 1000)) / 1000
```

## Development

```bash
npm install
npm run dev
```

```bash
npm run build   # type-check + bundle
npm run preview # preview production build
```

Set `DEBUG = true` in `main.ts` to keep the menu always visible without holding Q.

## License

MIT. Free to use, modify, and distribute with credit. See [LICENSE](LICENSE).
