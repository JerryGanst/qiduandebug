/**
 * 网络监控服务
 * 优化的网络状态检测，减少资源消耗
 */

import { ref, readonly } from 'vue'
import { NETWORK_CONFIG, STORAGE_KEYS } from '../config/constants.js'

class NetworkMonitor {
  constructor() {
    this.isOnline = ref(navigator.onLine)
    this.networkType = ref('unknown')
    this.isInternalNetwork = ref(false)
    
    this.checkInterval = null
    this.listeners = new Set()
    this.isMonitoring = false
    
    // 节流相关
    this.lastCheckTime = 0
    this.checkThrottle = 3000 // 3秒节流
    
    this.init()
  }

  /**
   * 初始化网络监控
   */
  init() {
    // 立即检查一次网络状态
    this.updateNetworkStatus()
    
    // 监听浏览器网络事件
    this.setupBrowserListeners()
  }

  /**
   * 设置浏览器网络事件监听
   */
  setupBrowserListeners() {
    const handleOnline = () => {
      this.isOnline.value = true
      this.updateNetworkStatus()
      this.notifyListeners('online')
    }

    const handleOffline = () => {
      this.isOnline.value = false
      this.networkType.value = 'offline'
      this.notifyListeners('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 页面可见性变化时检查网络
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.throttledNetworkCheck()
      }
    })
  }

  /**
   * 节流的网络检查
   */
  throttledNetworkCheck() {
    const now = Date.now()
    if (now - this.lastCheckTime > this.checkThrottle) {
      this.updateNetworkStatus()
      this.lastCheckTime = now
    }
  }

  /**
   * 检查是否为内网
   * @returns {boolean} 是否为内网
   */
  checkIsInternalNetwork() {
    const hostname = window.location.hostname
    
    // 检查内网模式
    return NETWORK_CONFIG.INTERNAL_NETWORK_PATTERNS.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(hostname)
      }
      return hostname.includes(pattern)
    })
  }

  /**
   * 更新网络状态
   */
  async updateNetworkStatus() {
    try {
      this.isOnline.value = navigator.onLine
      
      if (!this.isOnline.value) {
        this.networkType.value = 'offline'
        this.isInternalNetwork.value = false
        return
      }

      // 检查网络类型
      const isInternal = this.checkIsInternalNetwork()
      this.isInternalNetwork.value = isInternal
      this.networkType.value = isInternal ? 'internal' : 'external'

      // 获取用户网络权限（调用真实API）
      await this.getUserNetworkPermission()
      
    } catch (error) {
      console.error('更新网络状态失败:', error)
      this.networkType.value = 'error'
    }
  }

  /**
   * 获取用户网络权限
   */
  async getUserNetworkPermission() {
    try {
      const request = (await import('./request.js')).default
      
      const response = await request.get('/UserInfo/getUserIP', {
        timeout: NETWORK_CONFIG.PING_TIMEOUT
      })
      
      if (response.status) {
        const networkPermission = response.data
        localStorage.setItem(STORAGE_KEYS.IS_NETWORK, networkPermission.toString())
        
        // 通知其他模块网络权限已更新
        this.notifyListeners('permission', networkPermission)
      }
    } catch (error) {
      console.error('获取网络权限失败:', error)
      // 网络请求失败不影响基本的网络状态检测
    }
  }

  /**
   * 开始监控
   * @param {number} interval 检查间隔（毫秒）
   */
  startMonitoring(interval = NETWORK_CONFIG.CHECK_INTERVAL) {
    if (this.isMonitoring) {
      return
    }

    this.isMonitoring = true
    
    // 使用较长的间隔进行定期检查
    this.checkInterval = setInterval(() => {
      this.throttledNetworkCheck()
    }, interval)

    console.log(`网络监控已启动，检查间隔: ${interval}ms`)
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    
    this.isMonitoring = false
    console.log('网络监控已停止')
  }

  /**
   * 添加网络状态监听器
   * @param {Function} listener 监听函数
   */
  addListener(listener) {
    this.listeners.add(listener)
  }

  /**
   * 移除网络状态监听器
   * @param {Function} listener 监听函数
   */
  removeListener(listener) {
    this.listeners.delete(listener)
  }

  /**
   * 通知所有监听器
   * @param {string} event 事件类型
   * @param {any} data 事件数据
   */
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data, {
          isOnline: this.isOnline.value,
          networkType: this.networkType.value,
          isInternalNetwork: this.isInternalNetwork.value
        })
      } catch (error) {
        console.error('网络监听器执行失败:', error)
      }
    })
  }

  /**
   * 手动触发网络检查
   */
  forceCheck() {
    this.updateNetworkStatus()
  }

  /**
   * 获取网络状态
   */
  getNetworkState() {
    return readonly({
      isOnline: this.isOnline,
      networkType: this.networkType,
      isInternalNetwork: this.isInternalNetwork
    })
  }

  /**
   * 销毁监控器
   */
  destroy() {
    this.stopMonitoring()
    this.listeners.clear()
    
    // 移除事件监听器
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  }
}

// 创建单例实例
const networkMonitor = new NetworkMonitor()

// 设置自动启动监控的函数
export function setupNetworkListener() {
  networkMonitor.startMonitoring()
}

// 导出网络状态
export const networkState = networkMonitor.getNetworkState()

// 导出监控器实例
export default networkMonitor 