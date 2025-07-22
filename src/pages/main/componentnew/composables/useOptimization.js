/**
 * 性能优化 Composable
 * 提供防抖、节流、虚拟滚动等优化功能
 */
import { ref, computed, watchEffect, onUnmounted } from 'vue'

/**
 * 防抖 Hook
 */
export function useDebounce(fn, delay = 300) {
  let timeoutId = null
  
  const debounced = (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
  
  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  
  onUnmounted(() => {
    cancel()
  })
  
  return {
    run: debounced,
    cancel
  }
}

/**
 * 节流 Hook
 */
export function useThrottle(fn, delay = 300) {
  let lastTime = 0
  let timeoutId = null
  
  const throttled = (...args) => {
    const now = Date.now()
    const remaining = delay - (now - lastTime)
    
    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      
      lastTime = now
      fn(...args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now()
        timeoutId = null
        fn(...args)
      }, remaining)
    }
  }
  
  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  
  onUnmounted(() => {
    cancel()
  })
  
  return {
    run: throttled,
    cancel
  }
}

/**
 * 虚拟列表 Hook
 */
export function useVirtualList(options) {
  const {
    items,
    itemHeight,
    containerHeight,
    buffer = 5
  } = options
  
  const scrollTop = ref(0)
  const containerRef = ref(null)
  
  // 计算可见项
  const visibleItems = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight)
    const end = Math.ceil((scrollTop.value + containerHeight) / itemHeight)
    
    const startIndex = Math.max(0, start - buffer)
    const endIndex = Math.min(items.value.length - 1, end + buffer)
    
    return items.value.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute',
        top: `${(startIndex + index) * itemHeight}px`,
        height: `${itemHeight}px`,
        width: '100%'
      }
    }))
  })
  
  // 计算容器高度
  const totalHeight = computed(() => items.value.length * itemHeight)
  
  // 处理滚动
  const handleScroll = (e) => {
    scrollTop.value = e.target.scrollTop
  }
  
  return {
    containerRef,
    visibleItems,
    totalHeight,
    handleScroll,
    containerStyle: computed(() => ({
      height: `${containerHeight}px`,
      overflow: 'auto',
      position: 'relative'
    })),
    phantomStyle: computed(() => ({
      height: `${totalHeight.value}px`
    }))
  }
}

/**
 * 懒加载 Hook
 */
export function useLazyLoad(options = {}) {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0.1,
    onIntersect
  } = options
  
  const targets = ref([])
  let observer = null
  
  const observe = (el) => {
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            onIntersect?.(entry.target)
            observer.unobserve(entry.target)
          }
        })
      }, {
        root,
        rootMargin,
        threshold
      })
    }
    
    observer.observe(el)
    targets.value.push(el)
  }
  
  const unobserve = (el) => {
    observer?.unobserve(el)
    targets.value = targets.value.filter(t => t !== el)
  }
  
  const disconnect = () => {
    observer?.disconnect()
    targets.value = []
  }
  
  onUnmounted(() => {
    disconnect()
  })
  
  return {
    observe,
    unobserve,
    disconnect
  }
}

/**
 * RequestAnimationFrame Hook
 */
export function useRAF() {
  let rafId = null
  
  const run = (callback) => {
    if (rafId) {
      cancelAnimationFrame(rafId)
    }
    
    rafId = requestAnimationFrame(() => {
      callback()
      rafId = null
    })
  }
  
  const cancel = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }
  
  onUnmounted(() => {
    cancel()
  })
  
  return {
    run,
    cancel
  }
}

/**
 * 批量更新 Hook
 */
export function useBatchUpdate(updateFn, options = {}) {
  const { maxWait = 100, maxSize = 50 } = options
  
  let updates = []
  let timeoutId = null
  
  const flush = () => {
    if (updates.length > 0) {
      updateFn(updates)
      updates = []
    }
    
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  
  const add = (update) => {
    updates.push(update)
    
    if (updates.length >= maxSize) {
      flush()
    } else if (!timeoutId) {
      timeoutId = setTimeout(flush, maxWait)
    }
  }
  
  onUnmounted(() => {
    flush()
  })
  
  return {
    add,
    flush
  }
} 