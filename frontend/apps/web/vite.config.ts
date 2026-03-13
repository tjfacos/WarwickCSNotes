import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: path.resolve(__dirname, "../../../Data"),
  server: {
    port: 5000,
    proxy: {
      '/api': 'http://localhost:5001',
      '/notes': {
        target: 'http://localhost:5001',
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) return req.url;
        },
      },
    },
    historyApiFallback: {
      disableDotRule: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
