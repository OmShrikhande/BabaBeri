import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://169.58.40.205:8004',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add headers that the server might expect
            proxyReq.setHeader('Origin', 'http://169.58.40.205:8004');
            proxyReq.setHeader('Referer', 'http://169.58.40.205:8004/');
          });
        }
      },
      '/api': {
        target: 'http://169.58.40.205:8004',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add headers that the server might expect
            proxyReq.setHeader('Origin', 'http://169.58.40.205:8004');
            proxyReq.setHeader('Referer', 'http://169.58.40.205:8004/');
          });
        }
      },
      '/commission': {
        target: 'http://169.58.40.205:8004',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Origin', 'http://169.58.40.205:8004');
            proxyReq.setHeader('Referer', 'http://169.58.40.205:8004/');
          });
        }
      },
      '/live': {
        target: 'http://169.58.40.205:8004',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'http://169.58.40.205:8004');
            proxyReq.setHeader('Referer', 'http://169.58.40.205:8004/');
          });
        }
      },
      '/gifts': {
        target: 'http://169.58.40.205:8004',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'http://169.58.40.205:8004');
            proxyReq.setHeader('Referer', 'http://169.58.40.205:8004/');
          });
        }
      },
      '/public': {
        target: 'http://169.58.40.205:8004',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'http://169.58.40.205:8004');
            proxyReq.setHeader('Referer', 'http://169.58.40.205:8004/');
          });
        }
      }
    }
  }
})
