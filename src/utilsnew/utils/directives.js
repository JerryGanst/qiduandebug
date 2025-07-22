/**
 * Vue 自定义指令
 * 改进版本，修复了内存泄漏问题
 */

// 禁用拖拽指令
const disableDrag = {
  mounted(el, { value }) {
    // 创建事件处理函数
    const dragHandler = (e) => {
      if (value) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    
    // 存储到元素上，便于后续清理
    el._dragHandler = dragHandler
    
    // 捕获阶段拦截，确保优先级最高
    document.addEventListener('dragover', dragHandler, true)
    document.addEventListener('drop', dragHandler, true)
    document.addEventListener('dragenter', dragHandler, true)
    document.addEventListener('dragleave', dragHandler, true)
  },
  
  updated(el, { value }) {
    // 更新时重新绑定处理函数
    if (el._dragHandler) {
      // 先移除旧的
      document.removeEventListener('dragover', el._dragHandler, true)
      document.removeEventListener('drop', el._dragHandler, true)
      document.removeEventListener('dragenter', el._dragHandler, true)
      document.removeEventListener('dragleave', el._dragHandler, true)
    }
    
    // 创建新的处理函数
    const dragHandler = (e) => {
      if (value) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    
    el._dragHandler = dragHandler
    
    // 重新绑定
    document.addEventListener('dragover', dragHandler, true)
    document.addEventListener('drop', dragHandler, true)
    document.addEventListener('dragenter', dragHandler, true)
    document.addEventListener('dragleave', dragHandler, true)
  },
  
  unmounted(el) {
    // 清理监听器，防止内存泄漏
    if (el._dragHandler) {
      document.removeEventListener('dragover', el._dragHandler, true)
      document.removeEventListener('drop', el._dragHandler, true)
      document.removeEventListener('dragenter', el._dragHandler, true)
      document.removeEventListener('dragleave', el._dragHandler, true)
      delete el._dragHandler
    }
  }
}

// 自动聚焦指令
const autoFocus = {
  mounted(el) {
    // 使用 nextTick 确保DOM已渲染
    setTimeout(() => {
      el.focus()
    }, 100)
  }
}

// 点击外部区域指令
const clickOutside = {
  mounted(el, { value }) {
    const handler = (e) => {
      if (!el.contains(e.target) && typeof value === 'function') {
        value(e)
      }
    }
    
    el._clickOutsideHandler = handler
    document.addEventListener('click', handler)
  },
  
  unmounted(el) {
    if (el._clickOutsideHandler) {
      document.removeEventListener('click', el._clickOutsideHandler)
      delete el._clickOutsideHandler
    }
  }
}

// 防抖指令
const debounce = {
  mounted(el, { value, arg }) {
    const delay = parseInt(arg) || 500
    let timer = null
    
    const handler = (e) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        if (typeof value === 'function') {
          value(e)
        }
      }, delay)
    }
    
    el._debounceHandler = handler
    el.addEventListener('input', handler)
  },
  
  unmounted(el) {
    if (el._debounceHandler) {
      el.removeEventListener('input', el._debounceHandler)
      delete el._debounceHandler
    }
  }
}

// 加载状态指令
const loading = {
  mounted(el, { value }) {
    if (value) {
      el.style.pointerEvents = 'none'
      el.style.opacity = '0.6'
      
      // 添加加载指示器
      const loader = document.createElement('div')
      loader.className = 'directive-loading'
      loader.innerHTML = '<div class="spinner"></div>'
      loader.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
      `
      
      el.style.position = 'relative'
      el.appendChild(loader)
      el._loadingElement = loader
    }
  },
  
  updated(el, { value }) {
    if (value) {
      if (!el._loadingElement) {
        // 添加加载状态
        el.style.pointerEvents = 'none'
        el.style.opacity = '0.6'
        
        const loader = document.createElement('div')
        loader.className = 'directive-loading'
        loader.innerHTML = '<div class="spinner"></div>'
        loader.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9999;
        `
        
        el.style.position = 'relative'
        el.appendChild(loader)
        el._loadingElement = loader
      }
    } else {
      // 移除加载状态
      el.style.pointerEvents = ''
      el.style.opacity = ''
      
      if (el._loadingElement) {
        el.removeChild(el._loadingElement)
        delete el._loadingElement
      }
    }
  },
  
  unmounted(el) {
    if (el._loadingElement) {
      el.removeChild(el._loadingElement)
      delete el._loadingElement
    }
  }
}

// 导出所有指令
export {
  disableDrag,
  autoFocus,
  clickOutside,
  debounce,
  loading
}

export default {
  disableDrag,
  autoFocus,
  clickOutside,
  debounce,
  loading
} 