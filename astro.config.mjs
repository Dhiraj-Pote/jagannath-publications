import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  image: {
    // Use Sharp for image optimization (default, but explicit)
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  build: {
    // Inline small assets for faster loads
    inlineStylesheets: 'auto',
  },
  // Compress HTML output
  compressHTML: true,
});
