// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://134nkns.github.io',
  base: '/134NK-PORTFOLIO',
  integrations: [react()],
});
