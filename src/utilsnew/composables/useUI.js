/**
 * UI状态管理
 * 管理页面布局、加载状态、模态框等UI相关状态
 */

import { ref, computed, nextTick } from 'vue'
import { TEXTAREA_CONFIG, LOADING_CONFIG } from '../config/ui.js'
import { useChat } from './useChat' // 引入 useChat 来获取 pageType

// 文本框引用
const textareaRefs = {
  query: ref(null),
  sample: ref(null),
  sampleCurrent: ref(null),
  translation: ref(null),
  final: ref(null),
  intel: ref(null)
}

// UI状态
const dynamicRows = ref(1)
const showFileTip = ref(false)
const showModelTip = ref(false)
const isDragOver = ref(false)
const currentTip = ref(false)
const showFileMenu = ref(false)

// 加载动画状态
const dots = ref(LOADING_CONFIG.DOTS.INITIAL)
let dotInterval = null

// 计算属性
const currentTextareaRef = computed(() => {
  const { pageType } = useChat()
  // 映射 pageType 到 textareaRefs 的 key
  const typeMap = {
    query: 'query',
    it: 'query', // IT专题也用query
    law: 'query', // 法务专题也用query
    board: 'query', // 董办专题也用query
    sample: 'sample',
    tran: 'translation',
    final: 'final',
    intel: 'intel'
  }
  const key = typeMap[pageType.value] || 'sample'
  return textareaRefs[key]
})

/**
 * 调整文本框高度
 * @param {string} textareaType 文本框类型
 */
const adjustTextareaHeight = (textareaType) => {
  const textareaRef = textareaRefs[textareaType]
  if (!textareaRef?.value?.textarea) return

  const textarea = textareaRef.value.textarea

  try {
    // 强制重置高度
    textarea.style.height = '0px'
    
    const computedStyle = window.getComputedStyle(textarea)
    const lineHeight = parseFloat(computedStyle.lineHeight) || TEXTAREA_CONFIG.DEFAULT_LINE_HEIGHT
    const padding = TEXTAREA_CONFIG.PADDING.TOP + TEXTAREA_CONFIG.PADDING.BOTTOM

    // 计算实际内容高度
    const scrollHeight = textarea.scrollHeight

    // 计算行数
    const rows = Math.round((scrollHeight - padding) / lineHeight)
    const clampedRows = Math.min(Math.max(rows, TEXTAREA_CONFIG.MIN_ROWS), TEXTAREA_CONFIG.MAX_ROWS)

    // 设置高度
    textarea.style.height = `${lineHeight * clampedRows + padding}px`

    // 滚动条逻辑
    textarea.style.overflowY = rows > TEXTAREA_CONFIG.MAX_ROWS ? 'auto' : 'hidden'

    // 更新动态行数
    dynamicRows.value = clampedRows
  } catch (error) {
    console.error('调整文本框高度失败:', error)
  }
}

/**
 * 处理Shift+Enter事件
 * @param {string} textareaType 文本框类型
 */
const handleShiftEnter = (textareaType) => {
  const textareaRef = textareaRefs[textareaType]
  if (!textareaRef?.value?.textarea) return

  const textarea = textareaRef.value.textarea

  try {
    const startPos = textarea.selectionStart
    const endPos = textarea.selectionEnd

    // 插入换行符
    textarea.value = textarea.value.substring(0, startPos) + '\n' + textarea.value.substring(endPos)

    // 调整光标位置
    const newPos = startPos + 1
    nextTick(() => {
      textarea.setSelectionRange(newPos, newPos)
      adjustTextareaHeight(textareaType)
    })
  } catch (error) {
    console.error('处理Shift+Enter事件失败:', error)
  }
}

/**
 * 显示文件提示
 * @param {boolean} show 是否显示
 */
const toggleFileTip = (show = true) => {
  showFileTip.value = show
}

/**
 * 显示模型提示
 * @param {boolean} show 是否显示
 */
const toggleModelTip = (show = true) => {
  showModelTip.value = show
}

/**
 * 设置拖拽状态
 * @param {boolean} isDragging 是否正在拖拽
 */
const setDragState = (isDragging) => {
  isDragOver.value = isDragging
}

/**
 * 显示当前提示
 * @param {boolean} show 是否显示
 */
const toggleCurrentTip = (show = true) => {
  currentTip.value = show
}

/**
 * 开始加载动画
 */
const startLoadingAnimation = () => {
  dots.value = LOADING_CONFIG.DOTS.INITIAL
  
  dotInterval = setInterval(() => {
    if (dots.value.length >= LOADING_CONFIG.DOTS.MAX_DOTS) {
      dots.value = LOADING_CONFIG.DOTS.INITIAL
    } else {
      dots.value += '.'
    }
  }, LOADING_CONFIG.DOTS.ANIMATION_INTERVAL)
}

/**
 * 停止加载动画
 */
const stopLoadingAnimation = () => {
  if (dotInterval) {
    clearInterval(dotInterval)
    dotInterval = null
  }
  dots.value = LOADING_CONFIG.DOTS.INITIAL
}

/**
 * 重置UI状态
 */
const resetUIState = () => {
  dynamicRows.value = 1
  showFileTip.value = false
  showModelTip.value = false
  isDragOver.value = false
  currentTip.value = false
  stopLoadingAnimation()
}

/**
 * 获取文本框引用
 * @param {string} type 文本框类型
 * @param {Object} ref 引用对象
 */
const setTextareaRef = (type, ref) => {
  if (textareaRefs[type]) {
    textareaRefs[type].value = ref
  }
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} delay 延迟时间
 */
const debounce = (func, delay = TEXTAREA_CONFIG.RESIZE_DEBOUNCE) => {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

// 创建防抖的高度调整函数
const debouncedAdjustHeight = debounce(adjustTextareaHeight)

export function useUI() {
  return {
    // 状态
    dynamicRows,
    showFileTip,
    showModelTip,
    isDragOver,
    currentTip,
    dots,
    showFileMenu,
    
    // 引用
    textareaRefs,
    currentTextareaRef,
    
    // 方法
    adjustTextareaHeight,
    handleShiftEnter,
    toggleFileTip,
    toggleModelTip,
    setDragState,
    toggleCurrentTip,
    startLoadingAnimation,
    stopLoadingAnimation,
    resetUIState,
    setTextareaRef,
    debouncedAdjustHeight,
    
    // 兼容性更新方法
    updateDynamicRows: (value) => { dynamicRows.value = value },
    updateShowFileTip: (value) => { showFileTip.value = value },
    updateShowModelTip: (value) => { showModelTip.value = value },
    updateIsDragOver: (value) => { isDragOver.value = value },
    updateCurrentTip: (value) => { currentTip.value = value },
    updateDots: (value) => { dots.value = value }
  }
} 