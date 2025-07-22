/**
 * 文件处理状态管理
 * 处理文件上传、预览、拖拽等功能
 */

import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { FILE_CONFIG, ERROR_MESSAGES } from '../config/constants.js'

// 文件状态
const fileObj = ref('')
const fileArray = ref([])
const dragArray = ref([])
const fileInputArray = ref([])
const dragUploads = ref(null)

// 上传状态
const isUploading = ref(false)
const uploadProgress = ref(0)

// 限制文件
const limitFile = ref({})
const limitFinalFile = ref({})

/**
 * 验证文件
 * @param {File} file 文件对象
 * @returns {boolean} 验证结果
 */
const validateFile = (file) => {
  // 检查文件大小
  if (file.size > FILE_CONFIG.MAX_SIZE) {
    ElMessage.error(ERROR_MESSAGES.FILE.SIZE_EXCEEDED)
    return false
  }

  // 检查文件类型
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
  const allAllowedTypes = Object.values(FILE_CONFIG.ALLOWED_TYPES).flat()
  
  if (!allAllowedTypes.includes(fileExtension)) {
    ElMessage.error(ERROR_MESSAGES.FILE.TYPE_NOT_SUPPORTED)
    return false
  }

  return true
}

/**
 * 上传文件
 * @param {File|FileList} files 文件对象
 * @returns {Promise} 上传结果
 */
const uploadFiles = async (files) => {
  const fileList = Array.isArray(files) ? files : Array.from(files)
  
  if (fileList.length === 0) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  // 验证所有文件
  for (const file of fileList) {
    if (!validateFile(file)) {
      return
    }
  }

  try {
    isUploading.value = true
    uploadProgress.value = 0

    // 调用真实的上传API
    const request = (await import('../services/request.js')).default
    const formData = new FormData()
    
    fileList.forEach((file, index) => {
      formData.append(`files`, file)
    })

    const response = await request.post('/file/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: FILE_CONFIG.UPLOAD_TIMEOUT,
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })

    if (response.code === 200) {
      const uploadedFiles = response.data.files || response.data
      fileArray.value.push(...uploadedFiles)
      
      ElMessage.success(`成功上传 ${fileList.length} 个文件`)
      return uploadedFiles
    } else {
      throw new Error(response.message || ERROR_MESSAGES.FILE.UPLOAD_FAILED)
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    ElMessage.error(error.message || ERROR_MESSAGES.FILE.UPLOAD_FAILED)
    throw error
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

/**
 * 删除文件
 * @param {number} index 文件索引
 * @param {string} fileId 文件ID
 */
const deleteFile = async (index, fileId) => {
  try {
    if (fileId) {
      // 调用删除API
      const request = (await import('../services/request.js')).default
      await request.delete(`/file/delete/${fileId}`)
    }

    // 从数组中移除
    if (index >= 0 && index < fileArray.value.length) {
      fileArray.value.splice(index, 1)
    }

    ElMessage.success('文件删除成功')
  } catch (error) {
    console.error('删除文件失败:', error)
    ElMessage.error('删除文件失败')
  }
}

/**
 * 预览文件
 * @param {Object} file 文件对象
 */
const previewFile = async (file) => {
  try {
    const request = (await import('../services/request.js')).default
    const response = await request.get(`/file/preview/${file.id}`)
    
    if (response.code === 200) {
      // 根据文件类型处理预览
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
      
      if (FILE_CONFIG.ALLOWED_TYPES.IMAGE.includes(fileExtension)) {
        // 图片预览
        window.open(response.data.url, '_blank')
      } else if (FILE_CONFIG.ALLOWED_TYPES.DOCUMENT.includes(fileExtension)) {
        // 文档预览
        window.open(response.data.url, '_blank')
      } else {
        // 下载文件
        downloadFile(file)
      }
    }
  } catch (error) {
    console.error('预览文件失败:', error)
    ElMessage.error('预览文件失败')
  }
}

/**
 * 下载文件
 * @param {Object} file 文件对象
 */
const downloadFile = async (file) => {
  try {
    const request = (await import('../services/request.js')).default
    const response = await request.get(`/file/download/${file.id}`, {
      responseType: 'blob'
    })

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('文件下载成功')
  } catch (error) {
    console.error('下载文件失败:', error)
    ElMessage.error('下载文件失败')
  }
}

/**
 * 处理拖拽上传
 * @param {DragEvent} event 拖拽事件
 */
const handleDragUpload = async (event) => {
  event.preventDefault()
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    await uploadFiles(files)
  }
}

/**
 * 清空文件列表
 */
const clearFiles = () => {
  fileArray.value = []
  dragArray.value = []
  fileInputArray.value = []
  fileObj.value = ''
}

/**
 * 获取文件类型图标
 * @param {string} fileName 文件名
 * @returns {string} 图标路径
 */
const getFileIcon = (fileName) => {
  const extension = '.' + fileName.split('.').pop().toLowerCase()
  
  if (FILE_CONFIG.ALLOWED_TYPES.IMAGE.includes(extension)) {
    return '/assets/file_icons/image.png'
  } else if (FILE_CONFIG.ALLOWED_TYPES.DOCUMENT.includes(extension)) {
    if (extension === '.pdf') return '/assets/file_icons/pdf.png'
    return '/assets/file_icons/document.png'
  } else if (FILE_CONFIG.ALLOWED_TYPES.SPREADSHEET.includes(extension)) {
    return '/assets/file_icons/excel.png'
  } else if (FILE_CONFIG.ALLOWED_TYPES.PRESENTATION.includes(extension)) {
    return '/assets/file_icons/ppt.png'
  } else if (FILE_CONFIG.ALLOWED_TYPES.ARCHIVE.includes(extension)) {
    return '/assets/file_icons/archive.png'
  }
  
  return '/assets/file_icons/file.png'
}

export function useFile() {
  return {
    // 状态
    fileObj,
    fileArray,
    dragArray,
    fileInputArray,
    dragUploads,
    isUploading,
    uploadProgress,
    limitFile,
    limitFinalFile,
    
    // 方法
    validateFile,
    uploadFiles,
    deleteFile,
    previewFile,
    downloadFile,
    handleDragUpload,
    clearFiles,
    getFileIcon,
    
    // 兼容性更新方法
    updateFileObj: (value) => { fileObj.value = value },
    updateFileArray: (value) => { fileArray.value = value },
    updateDragArray: (value) => { dragArray.value = value },
    updateFileInputArray: (value) => { fileInputArray.value = value },
    updateDragUploads: (value) => { dragUploads.value = value },
    updateLimitFile: (value) => { limitFile.value = value },
    updateLimitFinalFile: (value) => { limitFinalFile.value = value }
  }
} 