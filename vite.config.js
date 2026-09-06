import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/teacher': 'https://finaltestk3-server.onrender.com',
      '/teacher-position': 'https://finaltestk3-server.onrender.com',
      // nếu sau này thêm API khác, thêm dòng tương ứng ở đây
    },
  },
});