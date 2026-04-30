import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://dev-suq.ranasalem.io',
  outDir: './dist',
  build: {
    assets: '_assets'
  }
});
