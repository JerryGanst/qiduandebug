import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // 监听所有网络接口
    port: 5173, // 指定端口号（可选）
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
