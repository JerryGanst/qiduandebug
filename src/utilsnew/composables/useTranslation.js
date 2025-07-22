/**
 * 翻译功能状态管理
 * 处理翻译相关的状态和逻辑
 */

import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { TRANSLATION_CONFIG, STORAGE_KEYS } from '../config/constants.js'

// 翻译状态
const selectedLanguage = ref(TRANSLATION_CONFIG.DEFAULT_LANGUAGE)
const translationData = ref('')
const currentTranslationData = ref('')
const translationQuestion = ref('')
const finalData = ref({ title: '', data: [] })
const finalQuest = ref('')

// 加载状态
const isTranslating = ref(false)
const isFinalLoading = ref(false)
const isTranslationStop = ref(false)

// 限制状态
const limitTranslationId = ref('')
const limitQueryId = ref('')
const limitTranslationLoading = ref(false)
const limitQueryLoading = ref(false)

// 容器引用
const messageContainerTranslation = ref(null)

/**
 * 翻译文本
 * @param {string} text 要翻译的文本
 * @param {string} targetLanguage 目标语言
 * @param {string} sourceLanguage 源语言（可选）
 */
const translateText = async (text, targetLanguage = selectedLanguage.value, sourceLanguage = 'auto') => {
  if (!text.trim()) {
    ElMessage.warning('请输入要翻译的内容')
    return
  }

  try {
    isTranslating.value = true
    isTranslationStop.value = false

    const request = (await import('../services/request.js')).default
    const response = await request.post('/translation/translate', {
      text,
      targetLanguage,
      sourceLanguage
    })

    if (response.code === 200) {
      translationData.value = response.data.translatedText || response.data.text
      currentTranslationData.value = translationData.value
      
      ElMessage.success('翻译完成')
      return translationData.value
    } else {
      throw new Error(response.message || '翻译失败')
    }
  } catch (error) {
    console.error('翻译失败:', error)
    ElMessage.error(error.message || '翻译服务暂时不可用')
    return null
  } finally {
    isTranslating.value = false
  }
}

/**
 * 批量翻译
 * @param {string[]} texts 要翻译的文本数组
 * @param {string} targetLanguage 目标语言
 */
const batchTranslate = async (texts, targetLanguage = selectedLanguage.value) => {
  if (!texts || texts.length === 0) {
    ElMessage.warning('没有要翻译的内容')
    return []
  }

  try {
    isTranslating.value = true
    const results = []

    // 分批处理，避免单次请求过大
    const batchSize = TRANSLATION_CONFIG.BATCH_SIZE
    for (let i = 0; i < texts.length; i += batchSize) {
      if (isTranslationStop.value) {
        break
      }

      const batch = texts.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(text => translateText(text, targetLanguage))
      )
      
      results.push(...batchResults)
    }

    return results.filter(result => result !== null)
  } catch (error) {
    console.error('批量翻译失败:', error)
    ElMessage.error('批量翻译失败')
    return []
  } finally {
    isTranslating.value = false
  }
}

/**
 * 检测语言
 * @param {string} text 要检测的文本
 */
const detectLanguage = async (text) => {
  try {
    const request = (await import('../services/request.js')).default
    const response = await request.post('/translation/detect', { text })

    if (response.code === 200) {
      return response.data.language || 'unknown'
    }
  } catch (error) {
    console.error('语言检测失败:', error)
  }
  
  return 'unknown'
}

/**
 * 获取支持的语言列表
 */
const getSupportedLanguages = async () => {
  try {
    const request = (await import('../services/request.js')).default
    const response = await request.get('/translation/languages')

    if (response.code === 200) {
      return response.data.languages || TRANSLATION_CONFIG.SUPPORTED_LANGUAGES
    }
  } catch (error) {
    console.error('获取语言列表失败:', error)
  }
  
  return TRANSLATION_CONFIG.SUPPORTED_LANGUAGES
}

/**
 * 切换目标语言
 * @param {string} language 语言代码
 */
const changeTargetLanguage = (language) => {
  selectedLanguage.value = language
  localStorage.setItem(STORAGE_KEYS.SELECTED_LANGUAGE, language)
}

/**
 * 停止翻译
 */
const stopTranslation = () => {
  isTranslationStop.value = true
  isTranslating.value = false
  limitTranslationLoading.value = false
}

/**
 * 清空翻译数据
 */
const clearTranslationData = () => {
  translationData.value = ''
  currentTranslationData.value = ''
  translationQuestion.value = ''
  finalData.value = { title: '', data: [] }
  finalQuest.value = ''
}

/**
 * 保存翻译历史
 * @param {Object} translationRecord 翻译记录
 */
const saveTranslationHistory = (translationRecord) => {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSLATION_HISTORY) || '[]')
    
    const record = {
      id: Date.now(),
      sourceText: translationRecord.sourceText,
      translatedText: translationRecord.translatedText,
      sourceLanguage: translationRecord.sourceLanguage,
      targetLanguage: translationRecord.targetLanguage,
      timestamp: new Date().toISOString()
    }
    
    history.unshift(record)
    
    // 限制历史记录数量
    if (history.length > 100) {
      history.splice(100)
    }
    
    localStorage.setItem(STORAGE_KEYS.TRANSLATION_HISTORY, JSON.stringify(history))
  } catch (error) {
    console.error('保存翻译历史失败:', error)
  }
}

/**
 * 获取翻译历史
 */
const getTranslationHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSLATION_HISTORY) || '[]')
  } catch (error) {
    console.error('获取翻译历史失败:', error)
    return []
  }
}

/**
 * 总结功能
 * @param {string} content 要总结的内容
 */
const summarizeContent = async (content) => {
  if (!content.trim()) {
    ElMessage.warning('请输入要总结的内容')
    return
  }

  try {
    isFinalLoading.value = true
    
    const request = (await import('../services/request.js')).default
    const response = await request.post('/translation/summarize', { content })

    if (response.code === 200) {
      finalData.value = {
        title: response.data.title || '内容总结',
        data: response.data.summary || response.data.data || []
      }
      
      ElMessage.success('总结完成')
      return finalData.value
    } else {
      throw new Error(response.message || '总结失败')
    }
  } catch (error) {
    console.error('总结失败:', error)
    ElMessage.error(error.message || '总结服务暂时不可用')
    return null
  } finally {
    isFinalLoading.value = false
  }
}

/**
 * 初始化翻译设置
 */
const initializeTranslation = () => {
  const savedLanguage = localStorage.getItem(STORAGE_KEYS.SELECTED_LANGUAGE)
  if (savedLanguage) {
    selectedLanguage.value = savedLanguage
  }
}

// 初始化
initializeTranslation()

export function useTranslation() {
  return {
    // 状态
    selectedLanguage,
    translationData,
    currentTranslationData,
    translationQuestion,
    finalData,
    finalQuest,
    isTranslating,
    isFinalLoading,
    isTranslationStop,
    limitTranslationId,
    limitQueryId,
    limitTranslationLoading,
    limitQueryLoading,
    messageContainerTranslation,

    // 方法
    translateText,
    batchTranslate,
    detectLanguage,
    getSupportedLanguages,
    changeTargetLanguage,
    stopTranslation,
    clearTranslationData,
    saveTranslationHistory,
    getTranslationHistory,
    summarizeContent,

    // 兼容性更新方法
    updateSelectedLanguage: (value) => { selectedLanguage.value = value },
    updateTranslationData: (value) => { translationData.value = value },
    updateCurrentTranslationData: (value) => { currentTranslationData.value = value },
    updateTranslationQuestion: (value) => { translationQuestion.value = value },
    updateFinalData: (value) => { finalData.value.data = value },
    updateFinalTitle: (value) => { finalData.value.title = value },
    updateFinalQuest: (value) => { finalQuest.value = value },
    updateFinalLoading: (value) => { isFinalLoading.value = value },
    updateIsTranslationStop: (value) => { isTranslationStop.value = value },
    updateLimitTranslationId: (value) => { limitTranslationId.value = value },
    updateLimitQueryId: (value) => { limitQueryId.value = value },
    updateLimitTranslationLoading: (value) => { limitTranslationLoading.value = value },
    updateLimitQueryLoading: (value) => { limitQueryLoading.value = value },
    updateMessageContainerTranslation: (value) => { messageContainerTranslation.value = value }
  }
} 