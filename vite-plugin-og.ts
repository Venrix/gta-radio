import type { Plugin, ResolvedConfig } from 'vite';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { stationData } from './src/station-data.js';

const BASE_URL = 'https://radio.rreinhardt.dev';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

interface OgMeta {
  title: string;
  description: string;
  image: string;
  url: string;
}

function injectOgTags(html: string, meta: OgMeta): string {
  const tags = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:image" content="${meta.image}" />`,
    `<meta property="og:url" content="${meta.url}" />`,
    `<meta property="og:site_name" content="GTA Radio" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${meta.image}" />`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`
  ]
    .map((t) => `    ${t}`)
    .join('\n');

  let result = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(meta.title)}</title>`
  );
  result = result.replace('</head>', `${tags}\n  </head>`);
  return result;
}

export default function ogPlugin(): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'vite-plugin-og',
    apply: 'build',

    configResolved(resolved) {
      config = resolved;
    },

    closeBundle() {
      const distDir = resolve(config.root, 'dist');
      const template = readFileSync(resolve(distDir, 'index.html'), 'utf-8');

      // Copy station icons to dist/og/<id>.jpg — stable, unhashed URLs for og:image
      const ogDir = resolve(distDir, 'og');
      mkdirSync(ogDir, { recursive: true });

      // Use icon as the default OG image for the root page
      copyFileSync(
        resolve(config.root, 'src/assets/icon/icon.jpg'),
        resolve(ogDir, 'default.jpg')
      );

      for (const station of stationData) {
        if (station.disabled) continue;
        const src = resolve(
          config.root,
          'src/assets/station_icons',
          station.iconFile
        );
        const dest = resolve(ogDir, `${station.id}.jpg`);
        try {
          copyFileSync(src, dest);
        } catch {
          // icon missing — skip silently
        }
      }

      // Root page + 404 fallback — generic OG tags
      const rootMeta: OgMeta = {
        title: 'GTA Radio',
        description:
          'Listen to all GTA V & GTA Online radio stations in your browser.',
        image: `${BASE_URL}/og/default.jpg`,
        url: BASE_URL
      };
      const rootHtml = injectOgTags(template, rootMeta);
      writeFileSync(resolve(distDir, 'index.html'), rootHtml);
      writeFileSync(resolve(distDir, '404.html'), rootHtml);

      // Per-station pages
      for (const station of stationData) {
        if (station.disabled) continue;
        const stationMeta: OgMeta = {
          title: `${station.title} — GTA Radio`,
          description: `Listen to ${station.title} from GTA V & GTA Online.`,
          image: `${BASE_URL}/og/${station.id}.jpg`,
          url: `${BASE_URL}/${station.id}`
        };
        const stationDir = resolve(distDir, station.id);
        mkdirSync(stationDir, { recursive: true });
        writeFileSync(
          resolve(stationDir, 'index.html'),
          injectOgTags(template, stationMeta)
        );
      }

      const count = stationData.filter((s) => !s.disabled).length;
      console.log(`\x1b[32m✓\x1b[0m OG tags generated for ${count} stations`);
    }
  };
}
