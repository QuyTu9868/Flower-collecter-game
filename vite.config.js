import { defineConfig } from 'vite';

// Luc chay thu (npm run dev), chuyen cac lenh /api sang server Express o cong 3000
export default defineConfig({
  server: {
    proxy: { '/api': 'http://localhost:3000' },
  },
});
