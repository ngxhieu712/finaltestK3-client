import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/teacher': 'http://localhost:8080',
      '/teacher-position': 'http://localhost:8080',
      // nếu sau này thêm API khác, thêm dòng tương ứng ở đây
    },
  },
});