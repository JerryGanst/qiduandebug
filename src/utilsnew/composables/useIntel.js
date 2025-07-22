/**
 * 智能体状态管理
 * 管理智能体相关的状态和操作
 */

import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { INTEL_CONFIG, STORAGE_KEYS } from '../config/constants.js'

// 智能体状态
const intelList = ref([])
const currentIntel = ref({ ...INTEL_CONFIG.DEFAULT_AGENT })
const currentIntelId = ref('')
const activeIndexIntel = ref('')
const recordId = ref('')
const selectType = ref(1)
const contentType = ref(1)
const isCreate = ref(false)

// 智能体问答状态
const intelQuestion = ref('')
const answerListIntel = ref([])
const intelQuery = reactive({ messages: [] })
const intelCurrent = reactive({ messages: [] })

// 容器引用
const messageContainerIntel = ref(null)

// 加载状态
const limitIntelLoading = ref(false)
const isIntelStop = ref(false)

/**
 * 创建智能体
 * @param {Object} agentData 智能体数据
 */
const createIntelAgent = async (agentData) => {
  try {
    // 验证数据
    if (!agentData.name || !agentData.role) {
      ElMessage.error('智能体名称和角色为必填项')
      return false
    }

    if (intelList.value.length >= INTEL_CONFIG.MAX_AGENTS) {
      ElMessage.error(`最多只能创建 ${INTEL_CONFIG.MAX_AGENTS} 个智能体`)
      return false
    }

    // 调用创建API
    const request = (await import('../services/request.js')).default
    const response = await request.post('/intel/create', agentData)

    if (response.code === 200) {
      const newAgent = response.data
      intelList.value.push(newAgent)
      
      // 保存到本地存储
      localStorage.setItem(STORAGE_KEYS.INTEL_LIST, JSON.stringify(intelList.value))
      
      ElMessage.success('智能体创建成功')
      return newAgent
    } else {
      throw new Error(response.message || '创建失败')
    }
  } catch (error) {
    console.error('创建智能体失败:', error)
    ElMessage.error(error.message || '创建智能体失败')
    return false
  }
}

/**
 * 更新智能体
 * @param {string} agentId 智能体ID
 * @param {Object} agentData 更新数据
 */
const updateIntelAgent = async (agentId, agentData) => {
  try {
    const request = (await import('../services/request.js')).default
    const response = await request.put(`/intel/update/${agentId}`, agentData)

    if (response.code === 200) {
      const updatedAgent = response.data
      const index = intelList.value.findIndex(agent => agent.id === agentId)
      
      if (index > -1) {
        intelList.value[index] = updatedAgent
        localStorage.setItem(STORAGE_KEYS.INTEL_LIST, JSON.stringify(intelList.value))
      }

      // 如果是当前选中的智能体，更新当前智能体信息
      if (currentIntelId.value === agentId) {
        currentIntel.value = updatedAgent
      }

      ElMessage.success('智能体更新成功')
      return updatedAgent
    } else {
      throw new Error(response.message || '更新失败')
    }
  } catch (error) {
    console.error('更新智能体失败:', error)
    ElMessage.error(error.message || '更新智能体失败')
    return false
  }
}

/**
 * 删除智能体
 * @param {string} agentId 智能体ID
 */
const deleteIntelAgent = async (agentId) => {
  try {
    const request = (await import('../services/request.js')).default
    await request.delete(`/intel/delete/${agentId}`)

    // 从列表中移除
    const index = intelList.value.findIndex(agent => agent.id === agentId)
    if (index > -1) {
      intelList.value.splice(index, 1)
      localStorage.setItem(STORAGE_KEYS.INTEL_LIST, JSON.stringify(intelList.value))
    }

    // 如果删除的是当前智能体，重置当前智能体
    if (currentIntelId.value === agentId) {
      resetCurrentIntel()
    }

    ElMessage.success('智能体删除成功')
  } catch (error) {
    console.error('删除智能体失败:', error)
    ElMessage.error('删除智能体失败')
  }
}

/**
 * 选择智能体
 * @param {Object} agent 智能体对象
 */
const selectIntelAgent = (agent) => {
  currentIntel.value = { ...agent }
  currentIntelId.value = agent.id
  
  // 清空当前对话
  intelQuery.messages = []
  intelCurrent.messages = []
  intelQuestion.value = ''
}

/**
 * 重置当前智能体
 */
const resetCurrentIntel = () => {
  currentIntel.value = { ...INTEL_CONFIG.DEFAULT_AGENT }
  currentIntelId.value = ''
  intelQuery.messages = []
  intelCurrent.messages = []
  intelQuestion.value = ''
}

/**
 * 发送智能体消息
 * @param {string} message 消息内容
 */
const sendIntelMessage = async (message) => {
  if (!message.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }

  if (!currentIntelId.value) {
    ElMessage.warning('请先选择一个智能体')
    return
  }

  try {
    limitIntelLoading.value = true
    isIntelStop.value = false

    // 添加用户消息
    const userMessage = {
      id: generateMessageId(),
      content: message,
      type: 'user',
      timestamp: new Date().toISOString()
    }

    intelQuery.messages.push(userMessage)

    // 添加智能体响应占位符
    const agentMessage = {
      id: generateMessageId(),
      content: '',
      type: 'assistant',
      timestamp: new Date().toISOString(),
      status: 'loading'
    }

    intelQuery.messages.push(agentMessage)

    // 调用智能体API
    const request = (await import('../services/request.js')).default
    const response = await request.post('/intel/chat', {
      message,
      agentId: currentIntelId.value,
      history: intelQuery.messages.slice(0, -1)
    })

    if (response.code === 200) {
      agentMessage.content = response.data.content || response.data.message
      agentMessage.status = 'completed'
    } else {
      throw new Error(response.message || '智能体响应失败')
    }

    // 清空输入框
    intelQuestion.value = ''

  } catch (error) {
    console.error('智能体消息发送失败:', error)
    ElMessage.error(error.message || '智能体响应失败')
  } finally {
    limitIntelLoading.value = false
  }
}

/**
 * 停止智能体响应
 */
const stopIntelResponse = () => {
  isIntelStop.value = true
  limitIntelLoading.value = false
}

/**
 * 加载智能体列表
 */
const loadIntelList = async () => {
  try {
    const request = (await import('../services/request.js')).default
    const response = await request.get('/intel/list')

    if (response.code === 200) {
      intelList.value = response.data || []
      localStorage.setItem(STORAGE_KEYS.INTEL_LIST, JSON.stringify(intelList.value))
    }
  } catch (error) {
    console.error('加载智能体列表失败:', error)
    
    // 尝试从本地存储加载
    const savedList = localStorage.getItem(STORAGE_KEYS.INTEL_LIST)
    if (savedList) {
      try {
        intelList.value = JSON.parse(savedList)
      } catch (parseError) {
        console.error('解析本地智能体列表失败:', parseError)
      }
    }
  }
}

/**
 * 生成消息ID
 */
const generateMessageId = () => {
  return `intel_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 初始化智能体数据
 */
const initializeIntel = () => {
  loadIntelList()
}

// 初始化
initializeIntel()

export function useIntel() {
  return {
    // 状态
    intelList,
    currentIntel,
    currentIntelId,
    activeIndexIntel,
    recordId,
    selectType,
    contentType,
    isCreate,
    intelQuestion,
    answerListIntel,
    intelQuery,
    intelCurrent,
    messageContainerIntel,
    limitIntelLoading,
    isIntelStop,

    // 方法
    createIntelAgent,
    updateIntelAgent,
    deleteIntelAgent,
    selectIntelAgent,
    resetCurrentIntel,
    sendIntelMessage,
    stopIntelResponse,
    loadIntelList,

    // 兼容性更新方法
    updateIntelList: (value) => { intelList.value = value },
    updateCurrentIntel: (value) => { currentIntel.value = value },
    updateCurrentIntelId: (value) => { currentIntelId.value = value },
    updateActiveIndexIntel: (value) => { activeIndexIntel.value = value },
    updateRecordId: (value) => { recordId.value = value },
    updateSelectType: (value) => { selectType.value = value },
    updateContentType: (value) => { contentType.value = value },
    updateIsCreate: (value) => { isCreate.value = value },
    updateIntelQuestion: (value) => { intelQuestion.value = value },
    updateAnswerListIntel: (value) => { answerListIntel.value = value },
    updateIntelQuery: (value) => { intelQuery.messages = value },
    updateIntelCurrent: (value) => { intelCurrent.messages = value },
    updateMessageContainerIntel: (value) => { messageContainerIntel.value = value },
    updateLimitIntelLoading: (value) => { limitIntelLoading.value = value },
    updateIsIntelStop: (value) => { isIntelStop.value = value }
  }
} 