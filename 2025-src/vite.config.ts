import '@dotenvx/dotenvx/config'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { websocketProxyPlugin } from './src/plugins/vite-plugin-ws-proxy.ts'
import { fileURLToPath, URL } from 'node:url'

const PROXY_TARGET = process.env.PROXY_TARGET
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), ,
  websocketProxyPlugin({
    target: `ws://${PROXY_TARGET}`, wsPathFilter: (url) => {
      return !url.includes('?token=')
    }
  })],
  server: {
    allowedHosts: [process.env.HOSTNAME],
    port: process.env.CLIENT_PORT ? parseInt(process.env.CLIENT_PORT) : 3000,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },

})
