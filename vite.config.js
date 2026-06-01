import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only: serve the Sveltia CMS at "/admin" and "/admin/" too. Without this,
// Vite's SPA fallback turns a directory request like "/admin/" into the main
// site app; only "/admin/index.html" would load the editor. (Production hosts
// like Vercel resolve the directory index correctly, so this is dev-only.)
const serveAdminIndex = {
  name: 'serve-admin-index',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/admin' || req.url === '/admin/') {
        req.url = '/admin/index.html'
      }
      next()
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveAdminIndex],
})
