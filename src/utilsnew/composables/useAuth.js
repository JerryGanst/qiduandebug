/**
 * 用户认证状态管理
 * 负责用户登录状态、权限管理、用户信息等
 */

import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { STORAGE_KEYS, ERROR_MESSAGES } from '../config/constants.js'

// --- 全局状态 ---
const isLogin = ref(false)
const userInfo = ref({
  department: '',
  id: '',
  name: '',
  url: ''
})
const isNetworkUser = ref(false)
const permissions = ref({
  isLaw: false,
  enableBoardOffice: false
})

// --- 计算属性 ---
const hasPermission = computed(() => isLogin.value && userInfo.value.id)
const userDisplayName = computed(() => userInfo.value.name || '未登录用户')
const userAvatar = computed(() => userInfo.value.url || '/images/default-avatar.png')
const isLawEnabled = computed(() => permissions.value.isLaw)
const isBoardOfficeEnabled = computed(() => permissions.value.enableBoardOffice)

// --- 内部辅助函数 ---
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    console.error(`Failed to set item in localStorage: ${key}`, e)
  }
}

function safeGetItem(key) {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    console.error(`Failed to get item from localStorage: ${key}`, e)
    return null
  }
}

function safeJSONParse(jsonString) {
  try {
    return JSON.parse(jsonString)
  } catch (e) {
    console.error('Failed to parse JSON from localStorage', e)
    return null
  }
}

// --- 核心方法 ---

/**
 * 登录函数
 * @param {Object} credentials 登录凭据
 * @returns {Promise<boolean>} 登录是否成功
 */
const login = async (credentials) => {
  try {
    // 调用真实的登录API
    const request = (await import('../services/request.js')).default
    
    const response = await request.post('/auth/login', {
      username: credentials.username,
      password: credentials.password
    })
    
    if (response.code === 200 && response.data) {
      // 保存token
      const token = response.data.token
      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      
      // 设置用户信息
      const userData = response.data.userInfo || response.data
      userInfo.value = {
        id: userData.id,
        name: userData.name || userData.username,
        department: userData.department || '',
        url: userData.avatar || userData.url || ''
      }
      
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo.value))
      
      isLogin.value = true
      
      ElMessage.success('登录成功')
      return true
    } else {
      throw new Error(response.message || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || ERROR_MESSAGES.AUTH.LOGIN_REQUIRED)
    return false
  }
}

/**
 * 退出登录
 */
const logout = async () => {
  try {
    // 调用真实的退出API
    const request = (await import('../services/request.js')).default
    
    try {
      await request.post('/auth/logout')
    } catch (apiError) {
      // 即使API调用失败，也要继续清理本地状态
      console.warn('退出API调用失败:', apiError)
    }
    
    // 清除本地存储
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    localStorage.removeItem(STORAGE_KEYS.IS_NETWORK)
    
    // 重置状态
    isLogin.value = false
    userInfo.value = {
      department: '',
      id: '',
      name: '',
      url: ''
    }
    isNetworkUser.value = false
    
    ElMessage.success('已退出登录')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败')
  }
}

/**
 * 检查并加载本地认证状态
 */
const checkAuthStatus = () => {
  const token = safeGetItem(STORAGE_KEYS.TOKEN)
  const storedUserInfo = safeGetItem(STORAGE_KEYS.USER_INFO)
  const storedNetworkStatus = safeGetItem(STORAGE_KEYS.IS_NETWORK)
  const storedPermissions = safeGetItem('powerList') // 使用旧的key保持兼容

  if (token && storedUserInfo) {
    const parsedInfo = safeJSONParse(storedUserInfo)
    if (parsedInfo) {
      userInfo.value = parsedInfo
      isLogin.value = true
      isNetworkUser.value = storedNetworkStatus === 'true'
    } else {
      logout()
    }
  }

  if (storedPermissions) {
    const parsedPermissions = safeJSONParse(storedPermissions)
    if (parsedPermissions) {
      permissions.value = {
        isLaw: parsedPermissions.enableLaw === 'true',
        enableBoardOffice: parsedPermissions.enableBoardOffice === 'true'
      }
    }
  }
}

/**
 * 更新用户信息
 * @param {Object} newUserInfo 新的用户信息
 */
const updateUserInfo = (newUserInfo) => {
  userInfo.value = { ...userInfo.value, ...newUserInfo }
  safeSetItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo.value))
}

/**
 * 获取并设置用户权限
 */
const fetchAndSetPermissions = async () => {
  if (!userInfo.value.id) return
  try {
    const request = (await import('../services/request.js')).default
    const response = await request.post(`/Files/permissionCheck?userId=${userInfo.value.id}`)
    if (response.status && response.data) {
      safeSetItem('powerList', JSON.stringify(response.data))
      permissions.value = {
        isLaw: response.data.enableLaw === 'true',
        enableBoardOffice: response.data.enableBoardOffice === 'true'
      }
    }
  } catch (error) {
    console.error('获取用户权限失败:', error)
  }
}

/**
 * 检查权限
 * @param {string} permission 权限名称
 * @returns {boolean} 是否有权限
 */
const checkPermission = (permission) => {
  if (!isLogin.value) {
    return false
  }
  
  // 这里可以添加具体的权限检查逻辑
  // 例如根据用户角色、部门等判断权限
  return true
}

/**
 * 验证用户输入
 * @param {any} value 用户输入值
 * @param {Event|null} event 事件对象（可选）
 * @returns {boolean} 验证是否通过
 */
const validateUserInput = (value, event = null) => {
  // 检查是否为事件对象
  const isEventObject = event && (
    Object.prototype.toString.call(event) === '[object PointerEvent]' ||
    Object.prototype.toString.call(event) === '[object KeyboardEvent]'
  )
  
  if (!isLogin.value) {
    ElMessage.warning(ERROR_MESSAGES.AUTH.LOGIN_REQUIRED)
    return false
  }
  
  // 如果是事件对象且没有实际输入值
  if (isEventObject && !value) {
    ElMessage.warning('请输入您的问题再发送')
    return false
  }
  
  // 如果有实际输入值，更新到相应的状态中
  if (value && !isEventObject) {
    // 这里可以设置具体的输入值
    // newQuestion.value = value
  }
  
  if (!value) {
    ElMessage.warning('请输入您的问题再发送')
    return false
  }
  
  return true
}

/**
 * 刷新token
 */
const refreshToken = async () => {
  try {
    // 调用真实的刷新token API
    const request = (await import('../services/request.js')).default
    const currentToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
    
    const response = await request.post('/auth/refresh', {
      token: currentToken
    })
    
    if (response.code === 200 && response.data?.token) {
      const newToken = response.data.token
      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken)
      
      // 如果有更新的用户信息，也要更新
      if (response.data.userInfo) {
        userInfo.value = { ...userInfo.value, ...response.data.userInfo }
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo.value))
      }
      
      return true
    } else {
      throw new Error(response.message || 'Token刷新失败')
    }
  } catch (error) {
    console.error('刷新token失败:', error)
    logout()
    return false
  }
}

/**
 * 检查是否可以发送消息
 * @returns {boolean}
 */
const checkCanSendMessage = () => {
  if (!isLogin.value) {
    ElMessage.warning(ERROR_MESSAGES.AUTH.LOGIN_REQUIRED)
    return false
  }
  return true
}

// 初始化时检查登录状态
checkAuthStatus()

export function useAuth() {
  return {
    // 状态
    isLogin,
    userInfo,
    isNetworkUser,
    permissions,

    // 计算属性
    hasPermission,
    userDisplayName,
    userAvatar,
    isLawEnabled,
    isBoardOfficeEnabled,

    // 方法
    login,
    logout,
    checkAuthStatus,
    updateUserInfo,
    fetchAndSetPermissions,
    checkCanSendMessage,
    
    // 为保持兼容性提供的旧变量名
    isLaw: isLawEnabled,
    enableBoardOffice: isBoardOfficeEnabled,
    isNet: isNetworkUser
  }
} 