/**
 * 内存管理辅助函数
 * 用于统一管理定时器、URL对象等资源的清理
 */

// 定时器管理
const timers = new Map()

/**
 * 创建并注册定时器
 * @param {string} id - 定时器唯一标识
 * @param {Function} callback - 回调函数
 * @param {number} delay - 延迟时间(ms)
 * @param {boolean} isInterval - 是否为interval
 * @returns {number} 定时器ID
 */
export function createTimer(id, callback, delay, isInterval = false) {
  // 清理已存在的同ID定时器
  clearTimer(id)
  
  const timerId = isInterval 
    ? setInterval(callback, delay)
    : setTimeout(callback, delay)
  
  timers.set(id, { id: timerId, type: isInterval ? 'interval' : 'timeout' })
  return timerId
}

/**
 * 清理指定定时器
 * @param {string} id - 定时器唯一标识
 */
export function clearTimer(id) {
  const timer = timers.get(id)
  if (timer) {
    if (timer.type === 'interval') {
      clearInterval(timer.id)
    } else {
      clearTimeout(timer.id)
    }
    timers.delete(id)
  }
}

/**
 * 清理所有定时器
 */
export function clearAllTimers() {
  timers.forEach((timer, id) => {
    clearTimer(id)
  })
}

// URL对象管理
const objectUrls = new Set()

/**
 * 创建并注册Object URL
 * @param {Blob|File} object - Blob或File对象
 * @returns {string} Object URL
 */
export function createObjectURL(object) {
  const url = URL.createObjectURL(object)
  objectUrls.add(url)
  return url
}

/**
 * 撤销指定的Object URL
 * @param {string} url - Object URL
 */
export function revokeObjectURL(url) {
  if (objectUrls.has(url)) {
    URL.revokeObjectURL(url)
    objectUrls.delete(url)
  }
}

/**
 * 撤销所有Object URL
 */
export function revokeAllObjectURLs() {
  objectUrls.forEach(url => {
    URL.revokeObjectURL(url)
  })
  objectUrls.clear()
}

// 事件监听器管理
const eventListeners = new Map()

/**
 * 添加事件监听器并注册
 * @param {EventTarget} target - 事件目标
 * @param {string} event - 事件名
 * @param {Function} handler - 事件处理函数
 * @param {Object} options - 事件选项
 */
export function addEventListener(target, event, handler, options) {
  const key = `${target.constructor.name}_${event}`
  
  // 移除已存在的同类监听器
  removeEventListener(target, event)
  
  target.addEventListener(event, handler, options)
  eventListeners.set(key, { target, event, handler, options })
}

/**
 * 移除事件监听器
 * @param {EventTarget} target - 事件目标
 * @param {string} event - 事件名
 */
export function removeEventListener(target, event) {
  const key = `${target.constructor.name}_${event}`
  const listener = eventListeners.get(key)
  
  if (listener) {
    listener.target.removeEventListener(listener.event, listener.handler, listener.options)
    eventListeners.delete(key)
  }
}

/**
 * 移除所有事件监听器
 */
export function removeAllEventListeners() {
  eventListeners.forEach((listener, key) => {
    listener.target.removeEventListener(listener.event, listener.handler, listener.options)
  })
  eventListeners.clear()
}

/**
 * 组件卸载时的统一清理函数
 */
export function cleanupOnUnmount() {
  clearAllTimers()
  revokeAllObjectURLs()
  removeAllEventListeners()
} 