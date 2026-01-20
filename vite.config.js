import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  publicDir: 'public',
  plugins: [react()],
  server: {
    port: 6023,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`,
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ethers: ['ethers'],
          ui: ['lucide-react'],
          query: ['@tanstack/react-query'],
        },
      },
    },
    copyPublicDir: true,
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        toplevel: true,
      },
    },
    // BigInt is used by viem/wagmi/ethers. If we downlevel to es2015, BigInt
    // exponentiation may get transformed into Math.pow(BigInt, BigInt) which
    // hard-crashes at runtime ("Cannot convert a BigInt value to a number").
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'ethers', 'lucide-react'],
  },
})
