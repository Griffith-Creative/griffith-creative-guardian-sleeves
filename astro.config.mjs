// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://guardiansleeves.com',
  // Old Shopify storefront links: /pages/contact, /pages/about, etc.
  redirects: {
    '/pages/[slug]': { status: 301, destination: '/[slug]' },
  },

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel(),
  integrations: [sitemap({
    filter: (page) => !page.includes('/404'),
  })]
});
