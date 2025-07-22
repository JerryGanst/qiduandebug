/**
 * 验证工具函数
 * 提供常用的数据验证功能
 */

import { ERROR_MESSAGES } from '../config/constants.js'

/**
 * 验证邮箱格式
 * @param {string} email 邮箱地址
 * @returns {boolean} 是否有效
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号码
 * @param {string} phone 手机号码
 * @returns {boolean} 是否有效
 */
export function validatePhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证密码强度
 * @param {string} password 密码
 * @returns {Object} 验证结果
 */
export function validatePassword(password) {
  const result = {
    isValid: true,
    errors: [],
    strength: 0
  }

  if (!password) {
    result.isValid = false
    result.errors.push(ERROR_MESSAGES.VALIDATION.REQUIRED)
    return result
  }

  if (password.length < 6) {
    result.isValid = false
    result.errors.push('密码长度至少6位')
  }

  if (password.length > 20) {
    result.isValid = false
    result.errors.push('密码长度不能超过20位')
  }

  // 计算密码强度
  let strength = 0
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++

  result.strength = strength

  return result
}

/**
 * 验证URL格式
 * @param {string} url URL地址
 * @returns {boolean} 是否有效
 */
export function validateURL(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证身份证号码
 * @param {string} idCard 身份证号码
 * @returns {boolean} 是否有效
 */
export function validateIdCard(idCard) {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return idCardRegex.test(idCard)
}

/**
 * 验证文本长度
 * @param {string} text 文本内容
 * @param {number} min 最小长度
 * @param {number} max 最大长度
 * @returns {Object} 验证结果
 */
export function validateTextLength(text, min = 0, max = Infinity) {
  const length = text ? text.length : 0
  
  return {
    isValid: length >= min && length <= max,
    length,
    min,
    max,
    error: length < min ? ERROR_MESSAGES.VALIDATION.TOO_SHORT : 
           length > max ? ERROR_MESSAGES.VALIDATION.TOO_LONG : null
  }
}

/**
 * 验证数字范围
 * @param {number} value 数值
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {boolean} 是否有效
 */
export function validateNumberRange(value, min = -Infinity, max = Infinity) {
  const num = parseFloat(value)
  return !isNaN(num) && num >= min && num <= max
}

/**
 * 验证必填字段
 * @param {any} value 值
 * @returns {boolean} 是否有效
 */
export function validateRequired(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return Boolean(value)
}

/**
 * 验证文件类型
 * @param {File} file 文件对象
 * @param {string[]} allowedTypes 允许的文件类型
 * @returns {boolean} 是否有效
 */
export function validateFileType(file, allowedTypes) {
  if (!file || !file.name) return false
  
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
  return allowedTypes.includes(fileExtension)
}

/**
 * 验证文件大小
 * @param {File} file 文件对象
 * @param {number} maxSize 最大大小（字节）
 * @returns {boolean} 是否有效
 */
export function validateFileSize(file, maxSize) {
  return file && file.size <= maxSize
}

/**
 * 综合表单验证
 * @param {Object} data 表单数据
 * @param {Object} rules 验证规则
 * @returns {Object} 验证结果
 */
export function validateForm(data, rules) {
  const errors = {}
  let isValid = true

  for (const field in rules) {
    const value = data[field]
    const fieldRules = rules[field]
    const fieldErrors = []

    for (const rule of fieldRules) {
      try {
        const result = rule.validate(value)
        if (!result.isValid) {
          fieldErrors.push(result.message || rule.message)
        }
      } catch (error) {
        fieldErrors.push('验证规则执行错误')
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors
      isValid = false
    }
  }

  return {
    isValid,
    errors,
    hasErrors: !isValid
  }
}

/**
 * 创建验证规则
 */
export const validationRules = {
  required: (message = ERROR_MESSAGES.VALIDATION.REQUIRED) => ({
    validate: validateRequired,
    message
  }),

  email: (message = '请输入有效的邮箱地址') => ({
    validate: validateEmail,
    message
  }),

  phone: (message = '请输入有效的手机号码') => ({
    validate: validatePhone,
    message
  }),

  minLength: (min, message = `长度不能少于${min}个字符`) => ({
    validate: (value) => validateTextLength(value, min).isValid,
    message
  }),

  maxLength: (max, message = `长度不能超过${max}个字符`) => ({
    validate: (value) => validateTextLength(value, 0, max).isValid,
    message
  }),

  range: (min, max, message = `数值必须在${min}到${max}之间`) => ({
    validate: (value) => validateNumberRange(value, min, max),
    message
  })
} 