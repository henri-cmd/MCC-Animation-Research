import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// On GitHub Pages the site is served from /MCC-Animation-Research/; the deploy
// workflow sets GH_PAGES=true. Local dev, previews and root-hosted deploys
// (e.g. Cloudflare Pages / a custom domain) keep the base at '/'.
export default defineConfig({
  base: process.env.GH_PAGES ? '/MCC-Animation-Research/' : '/',
  plugins: [react()],
  build: {
    target: 'es2020',
  },
})
