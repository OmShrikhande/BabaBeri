import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'https://proxstreamapi.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add headers that the server might expect
            proxyReq.setHeader('Origin', 'https://proxstreamapi.in');
            proxyReq.setHeader('Referer', 'https://proxstreamapi.in/');
          });
        }
      },
      '/api': {
        target: 'https://proxstreamapi.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add headers that the server might expect
            proxyReq.setHeader('Origin', 'https://proxstreamapi.in');
            proxyReq.setHeader('Referer', 'https://proxstreamapi.in/');
          });
        }
      },
      '/commission': {
        target: 'https://proxstreamapi.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Origin', 'https://proxstreamapi.in');
            proxyReq.setHeader('Referer', 'https://proxstreamapi.in/');
          });
        }
      },
      '/live': {
        target: 'https://proxstreamapi.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://proxstreamapi.in');
            proxyReq.setHeader('Referer', 'https://proxstreamapi.in/');
          });
        }
      },
      '/gifts': {
        target: 'https://proxstreamapi.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://proxstreamapi.in');
            proxyReq.setHeader('Referer', 'https://proxstreamapi.in/');
          });
        }
      },
      '/public': {
        target: 'https://proxstreamapi.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://proxstreamapi.in');
            proxyReq.setHeader('Referer', 'https://proxstreamapi.in/');
          });
        }
      }
    }
  }
})
