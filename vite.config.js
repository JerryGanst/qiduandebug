import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver({ importStyle: 'css' })] // 确保图标解析器生效
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ],
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      '@': resolve(__dirname, './src'), // 将 @ 映射到 src 目录
      '*': resolve('') // 可选：处理其他路径
    }
  },
  server: {
    host: '0.0.0.0', // 监听所有网络接口
    port: 5173, // 指定端口号（可选）
    proxy: {
      // 代理所有以 `/api` 开头的请求
      '/AI': {
        target: 'http://10.180.248.140:8080', // 目标服务器地址
        changeOrigin: true, // 允许跨域
        rewrite: path => path.replace(/^\/AI/, '') // 重写路径，去掉 `/api` 前缀
      }
    }
  }
})
