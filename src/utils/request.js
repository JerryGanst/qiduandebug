// src/utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus' //
class Request {
  constructor(config) {
    this.instance = axios.create(config)
    this.abortControllerMap = new Map()

    // 全局请求拦截
    this.instance.interceptors.request.use(
      config => {
        const controller = new AbortController()
        const url = config.url || ''
        config.signal = controller.signal
        this.abortControllerMap.set(url, controller)

        // 自动添加 token
        if (config.needAuth !== false) {
          const token = localStorage.getItem('token')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }

        return config
      },
      error => Promise.reject(error)
    )

    // 全局响应拦截
    this.instance.interceptors.response.use(
      response => {
        const url = response.config.url || ''
        this.abortControllerMap.delete(url)
        if (url === '/AI/query') {
          if (response.status !== 200) {
            return Promise.reject(new Error(response.statusText || 'Request failed'))
          }
          return response
        } else {
          if (response.data.code !== 200) {
            if (response.data.code === 429) {
              ElMessage.error({
                message: '服务器繁忙,请稍后再试',
                duration: 3000 // 显示3秒
              })
            } else {
              return Promise.reject(new Error(response.data.message || 'Request failed'))
            }
          }

          return response.data
        }
      },
      error => {
        if (error.response) {
          const status = error.response.status
          switch (status) {
            case 401:
              break
            case 403:
              // 处理禁止访问
              break
            case 404:
              // 处理资源不存在
              break
            case 429:
              ElMessage.error({
                message: '服务器繁忙,请稍后再试',
                duration: 2000 // 显示3秒
              })
              break
            default:
              console.error('HTTP Error:', error.message)
          }
        }
        if (error.code === 'ECONNABORTED') {
          ElMessage.error({
            message: '服务器繁忙,请稍后再试',
            duration: 2000 // 显示3秒
          })
        }
        return Promise.reject(error)
      }
    )
  }
  getPendingUrls() {
    return Array.from(this.abortControllerMap.keys())
  }
  request(config) {
    return this.instance.request(config)
  }

  get(url, config) {
    return this.request({ ...config, method: 'GET', url })
  }

  post(url, data, config) {
    return this.request({ method: 'POST', url, data, ...config })
  }

  put(url, data, config) {
    return this.request({ ...config, method: 'PUT', url, data })
  }

  delete(url, config) {
    return this.request({ ...config, method: 'DELETE', url })
  }

  cancelAllRequest() {
    this.abortControllerMap.forEach(controller => controller.abort())
    this.abortControllerMap.clear()
  }

  cancelRequest(url) {
    const urlList = Array.isArray(url) ? url : [url]
    urlList.forEach(u => {
      this.abortControllerMap.get(u)?.abort()
      this.abortControllerMap.delete(u)
    })
  }
}
// 正式服务器 10.180.248.140
// 测试服务器 10.180.248.141
// 金浩 10.180.16.84
const request = new Request({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default request
