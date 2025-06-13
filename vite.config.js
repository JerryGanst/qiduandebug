import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { resolve } from 'path'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      '@': resolve(__dirname, './src'), // 将 @ 映射到 src 目录
      '*': resolve('') // 可选：处理其他路径
    }
  },
  server: {
    host: '0.0.0.0', // 监听所有网络接口
    proxy: {
      // 代理所有以 `/api` 开头的请求
      '/Files': {
        target: 'https://10.180.8.215:8443', // 目标服务器地址
        changeOrigin: true, // 允许跨域
        secure: false, // 禁用 HTTPS 校验
        rewrite: path => path.replace(/^\/Files/, '') // 重写路径，去掉 `/api` 前缀
      }
    }
  }
})
