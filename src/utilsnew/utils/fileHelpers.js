/**
 * 文件处理工具函数
 */

import { FILE_CONFIG, FILE_ICON_MAP } from '../config/constants'

// 文件图标资源导入
import word from '@/assets/w.png'
import text from '@/assets/text.png'
import pdf from '@/assets/pdf.png'
import excel from '@/assets/excl.png'
import ppt from '@/assets/ppt.png'

// 图标映射对象
const ICON_SOURCES = {
  text,
  pdf,
  ppt,
  excel,
  word
}

/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 * @returns {string} 扩展名（小写）
 */
export const getFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') return ''
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) return ''
  return filename.slice(lastDotIndex + 1).toLowerCase()
}

/**
 * 获取文件图标
 * @param {string} filename - 文件名
 * @returns {string} 图标路径
 */
export const getFileIcon = (filename) => {
  const ext = getFileExtension(filename)
  const iconKey = FILE_ICON_MAP[ext] || FILE_ICON_MAP.default
  return ICON_SOURCES[iconKey] || ICON_SOURCES.word
}

/**
 * 检查文件大小
 * @param {File} file - 文件对象
 * @returns {boolean} 是否符合大小限制
 */
export const checkFileSize = (file) => {
  if (!file || !file.size) return false
  return file.size <= FILE_CONFIG.MAX_SIZE_BYTES
}

/**
 * 检查文件类型
 * @param {string} filename - 文件名
 * @returns {boolean} 是否为允许的文件类型
 */
export const checkFileType = (filename) => {
  const ext = '.' + getFileExtension(filename)
  return FILE_CONFIG.ALLOWED_EXTENSIONS.includes(ext)
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 KB'
  
  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + units[i]
}

/**
 * 分块读取文件
 * @param {File} file - 文件对象
 * @param {number} chunkSize - 块大小
 * @returns {Promise<ArrayBuffer[]>} 文件块数组
 */
export const readFileInChunks = async (file, chunkSize = FILE_CONFIG.CHUNK_SIZE) => {
  const chunks = []
  let offset = 0
  
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize)
    chunks.push(await chunk.arrayBuffer())
    offset += chunkSize
  }
  
  return chunks
}

/**
 * 创建文件下载
 * @param {string} url - 下载URL
 * @param {string} filename - 文件名
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || 'download'
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 验证文件
 * @param {File} file - 文件对象
 * @returns {Object} 验证结果
 */
export const validateFile = (file) => {
  const result = {
    valid: true,
    errors: []
  }
  
  if (!file) {
    result.valid = false
    result.errors.push('文件不存在')
    return result
  }
  
  if (!checkFileSize(file)) {
    result.valid = false
    result.errors.push(`文件大小不能超过${FILE_CONFIG.MAX_SIZE_MB}MB`)
  }
  
  if (!checkFileType(file.name)) {
    result.valid = false
    result.errors.push('不支持的文件类型')
  }
  
  return result
} 