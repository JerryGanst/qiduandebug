import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue' // 引入所有图标
import disableDrag from '@/utils/directives.js'
const app = createApp(App)
// 添加全局事件监听
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'a') {
    e.preventDefault()
    e.stopPropagation()
    return false
  }
})

// 全局注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
app.directive('disable-drag', disableDrag) // 注册为全局指令
app.use(ElementPlus, {
  locale: zhCn
})
app.mount('#app')
