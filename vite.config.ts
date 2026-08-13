import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist/public',
    },
    server: {
      port: 5173, // 前端默认端口
      proxy: {
        // 关键配置：将所有 /api 开头的请求转发到后端
        '/api': {
          target: 'http://localhost:3000', // 后端 Hono 服务的地址
          changeOrigin: true,
          // 如果后端路由没有 /api 前缀，需要重写路径；
          // 如果后端也是 /api/books，则不需要 rewrite。
          // rewrite: (path) => path.replace(/^\/api/, '') 
        }
      }
    },
  };
});
