import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lingo7realty.com',
  output: 'static',
  build: {
    format: 'directory'
  },
  integrations: [
    sitemap({
      // Keep noindex pages (contacts, terms, privacy) out of the sitemap so
      // Search Console doesn't flag "indexed, though blocked"/"excluded" noise.
      filter: (page) => {
        const seg = new URL(page).pathname.split('/').filter(Boolean);
        if (seg[0] === 'contacts' || seg[0] === 'terms' || seg[0] === 'privacy') return false;
        return true;
      },
    }),
  ],
});
