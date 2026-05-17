import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        funzionalita: resolve(__dirname, 'funzionalita.html'),
        prezzi: resolve(__dirname, 'prezzi.html'),
        vetrina: resolve(__dirname, 'vetrina.html')
      },
      output: {
        manualChunks: {
          gsap: ['gsap'],
          lenis: ['lenis']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
})
