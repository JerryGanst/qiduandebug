/**
 * 聊天功能状态管理
 * 管理聊天消息、历史记录、加载状态等
 */

import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { MESSAGE_CONFIG, MODE_MAPPING, STORAGE_KEYS } from '../config/constants.js'
import { useAuth } from './useAuth.js'

// --- 基础状态 ---
const currentQuestion = ref('')
const newQuestion = ref('')
const pageType = ref('sample')
const selectedMode = ref('通用模式')
const activeIndex = ref('')
const currentId = ref('')

// --- 加载与停止状态 ---
const isLoading = ref(false)
const isStopping = ref(false)
const isSampleStop = ref(false)
const isQueryStop = ref(false)
const loadingId = ref('')

// --- 消息容器引用 ---
const messageContainer = ref(null)

// --- 历史记录 ---
const questions = ref([])
const answerList = ref([])
const queryTypes = ref([])

// --- 聊天数据 ---
const chatQuery = reactive({ messages: [] })
const chatCurrent = reactive({ messages: [] })
const limitSample = ref({ messages: [] })

// --- 专栏模式特定状态 ---
const deepType = ref(false) // DeepSeek模式
const tipQuery = ref('')    // 专栏模式问题标题
const currentObj = ref({    // 专栏模式当前对话对象
  list: {},
  messages: {},
  messageList: []
})

// --- 计算属性 ---
const hasMessages = computed(() => chatQuery.messages.length > 0)
const currentModeKey = computed(() => MODE_MAPPING.get(selectedMode.value) || 'sample')
const canSendMessage = computed(() => {
  const { isLogin } = useAuth()
  return isLogin.value && newQuestion.value.trim() && !isLoading.value
})

// --- 核心方法 ---

/**
 * 发送消息
 * @param {string} message 消息内容
 * @param {string} type 消息类型
 */
const sendMessage = async (message, type = 'user') => {
  if (!message.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }

  const { validateUserInput } = useAuth()
  if (!validateUserInput(message)) {
    return
  }

  try {
    isLoading.value = true
    isStopping.value = false

    // 添加用户消息
    const userMessage = {
      id: generateMessageId(),
      content: message,
      type: 'user',
      timestamp: new Date().toISOString(),
      status: 'sent'
    }

    chatQuery.messages.push(userMessage)

    // 添加助手消息占位符
    const assistantMessage = {
      id: generateMessageId(),
      content: '',
      type: 'assistant',
      timestamp: new Date().toISOString(),
      status: 'loading'
    }

    chatQuery.messages.push(assistantMessage)
    loadingId.value = assistantMessage.id

    // 清空输入框
    newQuestion.value = ''

    // 滚动到底部
    await scrollToBottom()

    // 调用真实API
    await callRealAPI(assistantMessage, message)

  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败，请重试')
  } finally {
    isLoading.value = false
    loadingId.value = ''
  }
}

/**
 * 调用真实API获取响应
 * @param {Object} message 消息对象
 * @param {string} userMessage 用户消息内容
 */
const callRealAPI = async (message, userMessage) => {
  try {
    // 这里需要导入真实的request服务
    const request = (await import('../services/request.js')).default
    
    // 根据当前模式选择不同的API端点
    const apiEndpoint = '/AI/query' // 使用原有的API端点
    
    // 构建请求数据
    const requestData = {
      message: userMessage,
      mode: selectedMode.value,
      chatId: currentId.value,
      history: chatQuery.messages.slice(0, -1) // 排除当前正在响应的消息
    }

    // 发起请求
    const response = await request.post(apiEndpoint, requestData)
    
    if (response.status === 200) {
      // 处理流式响应或普通响应
      if (response.headers['content-type']?.includes('text/event-stream')) {
        // 处理流式响应
        await handleStreamResponse(response, message)
      } else {
        // 处理普通响应
        message.content = response.data.content || response.data.message || '抱歉，服务暂时不可用'
        message.status = 'completed'
      }
    } else {
      throw new Error(response.data?.message || '请求失败')
    }
  } catch (error) {
    console.error('API调用失败:', error)
    message.content = '抱歉，服务暂时不可用，请稍后重试'
    message.status = 'error'
    
    // 显示错误提示
    ElMessage.error(error.message || '请求失败，请稍后重试')
  }
}

/**
 * 处理流式响应
 * @param {Object} response 响应对象
 * @param {Object} message 消息对象
 */
const handleStreamResponse = async (response, message) => {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let currentContent = ''

  try {
    while (true) {
      if (isStopping.value) {
        message.status = 'stopped'
        await reader.cancel()
        break
      }

      const { done, value } = await reader.read()
      
      if (done) {
        message.status = 'completed'
        break
      }

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.content) {
              currentContent += data.content
              message.content = currentContent
            }
            if (data.finished) {
              message.status = 'completed'
              return
            }
          } catch (e) {
            // 忽略解析错误，继续处理下一行
          }
        }
      }
    }
  } catch (error) {
    console.error('处理流式响应时出错:', error)
    message.status = 'error'
    message.content = currentContent || '响应处理出错'
  }
}

/**
 * 停止当前响应
 */
const stopResponse = () => {
  isStopping.value = true
  isLoading.value = false
  loadingId.value = ''
}

/**
 * 清理聊天状态
 */
const clearChatState = () => {
  chatQuery.messages = []
  chatCurrent.messages = []
  currentQuestion.value = ''
  newQuestion.value = ''
  currentId.value = ''
  activeIndex.value = ''
  tipQuery.value = ''
  currentObj.value = { list: {}, messages: {}, messageList: [] }
}

/**
 * 清空聊天记录
 */
const clearChat = () => {
  chatQuery.messages = []
  chatCurrent.messages = []
  currentQuestion.value = ''
  newQuestion.value = ''
  currentId.value = ''
  activeIndex.value = ''
}

/**
 * 保存聊天记录
 */
const saveChat = () => {
  try {
    const chatData = {
      id: generateChatId(),
      title: generateChatTitle(),
      messages: chatQuery.messages,
      timestamp: new Date().toISOString(),
      mode: selectedMode.value
    }

    // 保存到历史记录
    questions.value.unshift(chatData)
    
    // 限制历史记录数量
    if (questions.value.length > MESSAGE_CONFIG.MAX_HISTORY) {
      questions.value = questions.value.slice(0, MESSAGE_CONFIG.MAX_HISTORY)
    }

    // 保存到本地存储
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(questions.value))
    
    ElMessage.success('聊天记录已保存')
  } catch (error) {
    console.error('保存聊天记录失败:', error)
    ElMessage.error('保存聊天记录失败')
  }
}

/**
 * 加载聊天记录
 * @param {string} chatId 聊天记录ID
 */
const loadChat = (chatId) => {
  const chat = questions.value.find(q => q.id === chatId)
  if (chat) {
    chatQuery.messages = [...chat.messages]
    currentId.value = chatId
    currentQuestion.value = chat.title
    
    nextTick(() => {
      scrollToBottom()
    })
  }
}

/**
 * 删除聊天记录
 * @param {string} chatId 聊天记录ID
 */
const deleteChat = (chatId) => {
  const index = questions.value.findIndex(q => q.id === chatId)
  if (index > -1) {
    questions.value.splice(index, 1)
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(questions.value))
    
    // 如果删除的是当前聊天，清空当前聊天
    if (currentId.value === chatId) {
      clearChat()
    }
    
    ElMessage.success('聊天记录已删除')
  }
}

/**
 * 切换专栏模式类型
 */
const toggleDeepType = () => {
  if (isLoading.value) {
    ElMessage.warning('有问题正在回答中，请稍后再切换')
    return
  }
  deepType.value = !deepType.value
}

/**
 * 切换模式
 * @param {string} newMode 新模式
 */
const changeMode = (newMode) => {
  if (isLoading.value) {
    ElMessage.warning('有问题正在回答中，请稍后再切换')
    return
  }
  selectedMode.value = newMode
  pageType.value = MODE_MAPPING.get(newMode) || 'sample'
  clearChatState()
  localStorage.setItem(STORAGE_KEYS.LAST_MODE, newMode)
}

/**
 * 滚动到底部
 */
const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

/**
 * 生成消息ID
 */
const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 生成聊天ID
 */
const generateChatId = () => {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 生成聊天标题
 */
const generateChatTitle = () => {
  if (chatQuery.messages.length > 0) {
    const firstUserMessage = chatQuery.messages.find(m => m.type === 'user')
    if (firstUserMessage) {
      const title = firstUserMessage.content.substring(0, 20)
      return title.length < firstUserMessage.content.length ? title + '...' : title
    }
  }
  return `新对话 ${new Date().toLocaleString()}`
}

/**
 * 初始化聊天数据
 */
const initializeChat = () => {
  try {
    // 加载历史记录
    const savedHistory = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY)
    if (savedHistory) {
      questions.value = JSON.parse(savedHistory)
    }
    
    // 加载最后使用的模式
    const lastMode = localStorage.getItem(STORAGE_KEYS.LAST_MODE)
    if (lastMode) {
      selectedMode.value = lastMode
      pageType.value = MODE_MAPPING.get(lastMode) || 'sample'
    }
  } catch (error) {
    console.error('初始化聊天数据失败:', error)
  }
}

/**
 * 监听新问题变化，自动保存草稿
 */
watch(
  newQuestion,
  (newVal) => {
    if (!newVal.trim()) {
      newQuestion.value = ''
    }
  },
  { deep: true }
)

// 初始化
initializeChat()

export function useChat() {
  return {
    // 基础状态
    currentQuestion,
    newQuestion,
    pageType,
    selectedMode,
    activeIndex,
    currentId,
    
    // 加载状态
    isLoading,
    isStopping,
    isSampleStop,
    isQueryStop,
    loadingId,
    
    // 引用
    messageContainer,
    
    // 数据
    questions,
    answerList,
    queryTypes,
    chatQuery,
    chatCurrent,
    limitSample,
    
    // 专栏模式状态
    deepType,
    tipQuery,
    currentObj,
    
    // 计算属性
    hasMessages,
    currentModeKey,
    canSendMessage,
    
    // 方法
    sendMessage,
    stopResponse,
    clearChat,
    saveChat,
    loadChat,
    deleteChat,
    changeMode,
    toggleDeepType,

    // 为保持兼容性提供的旧变量名
    checkDeepType: toggleDeepType
  }
} 