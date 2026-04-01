import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // ✅ importante para publicar em https://SEU_IP/dashboard
base: "/elogios/dashboard/",

  plugins: [react(), runtimeErrorOverlay()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },

  root: path.resolve(__dirname, "client"),

  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },

server: {
    host: true,
    port: 8443,
    proxy: {
      '/api': {
        // Use o IP da rede em vez de localhost ou 127.0.0.1
        // Verifique se o seu backend está mesmo na porta 443 (HTTPS)
        target: 'https://192.168.10.25:443', 
        changeOrigin: true,
        secure: false, // Ignora erro de certificado (importante!)
        timeout: 20000, // Aumenta o tempo limite para evitar o erro 504 rápido
      },
    },
  },
});