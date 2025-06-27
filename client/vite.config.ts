
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { config } from 'dotenv'
import sitemap from 'vite-plugin-sitemap'

config()

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000/'

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: SITE_URL,
      routes: [
        '/new-post',
        '/terms-and-conditions',
        '/subscriptions',
        '/cancellation-policy',
        '/admin-panel',
      ],
      generateRobotsTxt: false, 
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': process.env,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    host: true,
  },
})
