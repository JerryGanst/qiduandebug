/**
 * HTTP 请求服务
 * 基于原有request.js的改进版本，使用配置化管理
 */

import axios from 'axios'
import { ElMessage } from 'element-plus'
import { HTTP_CONFIG, REQUEST_CONFIG, RESPONSE_CONFIG, ENV_CONFIG } from '../config/constants.js'
import { API_ENDPOINTS } from '../config/api.js'

class RequestService {
  constructor(config) {
    this.instance = axios.create(config)
    this.abortControllerMap = new Map()
    this.requestCount = 0
    
    this.setupInterceptors()
  }

  /**
   * 设置请求和响应拦截器
   */
  setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        this.requestCount++
        
        // 创建取消控制器
        const controller = new AbortController()
        const url = config.url || ''
        config.signal = controller.signal
        this.abortControllerMap.set(url, controller)

        // 自动添加认证头
        if (config.needAuth !== false) {
          const token = localStorage.getItem('token')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }

        // 添加请求ID用于追踪
        config.headers['X-Request-ID'] = `req_${Date.now()}_${this.requestCount}`

        return config
      },
      (error) => {
        this.requestCount--
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        const url = response.config.url || ''
        this.abortControllerMap.delete(url)
        this.requestCount--

        // 特殊处理流式响应（AI查询）
        if (url === API_ENDPOINTS.CHAT.QUERY) {
          if (response.status !== 200) {
            return Promise.reject(new Error(response.statusText || 'Request failed'))
          }
          return response
        }

        // 处理正常响应
        const { data } = response
        
        // 检查业务状态码
        if (data.code !== undefined) {
          if (RESPONSE_CONFIG.SUCCESS_CODES.includes(data.code)) {
            return data
          } else if (data.code === HTTP_CONFIG.STATUS_CODES.TOO_MANY_REQUESTS) {
            this.handleTooManyRequests()
            return Promise.reject(new Error('请求过于频繁'))
          } else {
            // 业务错误
            return Promise.reject(new Error(data.message || '请求失败'))
          }
        }

        return data
      },
      (error) => {
        this.requestCount--
        return this.handleResponseError(error)
      }
    )
  }

  /**
   * 处理响应错误
   * @param {Error} error 错误对象
   */
  handleResponseError(error) {
    if (axios.isCancel(error)) {
      console.log('请求被取消:', error.message)
      return Promise.reject(error)
    }

    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case HTTP_CONFIG.STATUS_CODES.UNAUTHORIZED:
          this.handleUnauthorized()
          break
        case HTTP_CONFIG.STATUS_CODES.FORBIDDEN:
          ElMessage.error('权限不足')
          break
        case HTTP_CONFIG.STATUS_CODES.NOT_FOUND:
          ElMessage.error('请求的资源不存在')
          break
        case HTTP_CONFIG.STATUS_CODES.TOO_MANY_REQUESTS:
          this.handleTooManyRequests()
          break
        case HTTP_CONFIG.STATUS_CODES.INTERNAL_ERROR:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || `请求失败 (${status})`)
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请稍后重试')
    } else if (error.code === 'ERR_NETWORK') {
      ElMessage.error('网络连接错误，请检查网络')
    } else {
      ElMessage.error(error.message || '网络错误')
    }

    return Promise.reject(error)
  }

  /**
   * 处理未授权错误
   */
  handleUnauthorized() {
    // 清除本地token
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    
    // 可以触发重新登录或跳转到登录页
    ElMessage.error('登录已过期，请重新登录')
    
    // 这里可以发出事件通知其他组件
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }

  /**
   * 处理请求频繁错误
   */
  handleTooManyRequests() {
    ElMessage.error({
      message: '请求过于频繁，请稍后再试',
      duration: 3000
    })
  }

  /**
   * 获取当前待处理的请求URL列表
   */
  getPendingUrls() {
    return Array.from(this.abortControllerMap.keys())
  }

  /**
   * 取消指定URL的请求
   * @param {string|string[]} urls 要取消的URL
   */
  cancelRequest(urls) {
    const urlList = Array.isArray(urls) ? urls : [urls]
    
    urlList.forEach(url => {
      const controller = this.abortControllerMap.get(url)
      if (controller) {
        controller.abort()
        this.abortControllerMap.delete(url)
      }
    })
  }

  /**
   * 取消所有待处理的请求
   */
  cancelAllRequests() {
    this.abortControllerMap.forEach(controller => controller.abort())
    this.abortControllerMap.clear()
  }

  /**
   * 通用请求方法
   * @param {Object} config 请求配置
   */
  request(config) {
    return this.instance.request(config)
  }

  /**
   * GET请求
   * @param {string} url 请求URL
   * @param {Object} config 请求配置
   */
  get(url, config = {}) {
    return this.request({ 
      ...config, 
      method: 'GET', 
      url 
    })
  }

  /**
   * POST请求
   * @param {string} url 请求URL
   * @param {any} data 请求数据
   * @param {Object} config 请求配置
   */
  post(url, data, config = {}) {
    return this.request({ 
      method: 'POST', 
      url, 
      data, 
      ...config 
    })
  }

  /**
   * PUT请求
   * @param {string} url 请求URL
   * @param {any} data 请求数据
   * @param {Object} config 请求配置
   */
  put(url, data, config = {}) {
    return this.request({ 
      ...config, 
      method: 'PUT', 
      url, 
      data 
    })
  }

  /**
   * DELETE请求
   * @param {string} url 请求URL
   * @param {Object} config 请求配置
   */
  delete(url, config = {}) {
    return this.request({ 
      ...config, 
      method: 'DELETE', 
      url 
    })
  }

  /**
   * 获取当前请求统计
   */
  getStats() {
    return {
      pendingRequests: this.abortControllerMap.size,
      totalRequests: this.requestCount
    }
  }
}

// 创建默认实例
const request = new RequestService({
  baseURL: ENV_CONFIG.BASE_URL,
  timeout: HTTP_CONFIG.TIMEOUT,
  headers: REQUEST_CONFIG.DEFAULT_HEADERS
})

export default request
export { RequestService } 