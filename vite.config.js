import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'https://proxstream.online',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add headers that the server might expect
            proxyReq.setHeader('Origin', 'https://proxstream.online');
            proxyReq.setHeader('Referer', 'https://proxstream.online/');
          });
        }
      },
      '/api': {
        target: 'https://proxstream.online',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add headers that the server might expect
            proxyReq.setHeader('Origin', 'https://proxstream.online');
            proxyReq.setHeader('Referer', 'https://proxstream.online/');
          });
        }
      },
      '/commission': {
        target: 'https://proxstream.online',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Origin', 'https://proxstream.online');
            proxyReq.setHeader('Referer', 'https://proxstream.online/');
          });
        }
      }
    }
  }
})
