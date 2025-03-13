import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),

  ],
  server: {
    proxy: {
      // 代理所有以 `/api` 开头的请求
      '/AI': {
        target: 'http://10.180.248.140:8080', // 目标服务器地址
        changeOrigin: true, // 允许跨域
        rewrite: (path) => path.replace(/^\/AI/, ''), // 重写路径，去掉 `/api` 前缀
      },
    },
  },
})
