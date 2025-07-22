// src/directives/disableDrag.js
const disableDrag = {
  mounted(el, { value }) {
    el._dragHandler = e => {
      if (value) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    // 捕获阶段拦截，确保优先级最高
    document.addEventListener('dragover', el._dragHandler, true)
    document.addEventListener('drop', el._dragHandler, true)
  },
  updated(el, { value }) {
    // 值更新时同步状态
    el._dragHandler = e => {
      if (value) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
  },
  unmounted(el) {
    // 清理监听器
    document.removeEventListener('dragover', el._dragHandler, true)
    document.removeEventListener('drop', el._dragHandler, true)
  }
}

export default disableDrag
