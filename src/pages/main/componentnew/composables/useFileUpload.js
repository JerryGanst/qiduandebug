/**
 * 文件上传 Composable
 * 提供分块上传、进度跟踪、断点续传等功能
 */
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { request } from '@/utilsnew/services/request'
import { FILE_CONFIG, MESSAGE_CONFIG } from '../config/constants'
import { readFileInChunks } from '@/utilsnew/utils/fileHelpers'

export function useFileUpload() {
  // 上传队列
  const uploadQueue = ref([])
  const uploadingFiles = reactive(new Map())
  
  /**
   * 计算文件MD5（用于秒传和断点续传）
   */
  const calculateFileMD5 = async (file) => {
    // 这里可以集成 spark-md5 库来计算文件MD5
    // 暂时返回模拟值
    return `${file.name}_${file.size}_${file.lastModified}`
  }
  
  /**
   * 检查文件是否已存在（秒传）
   */
  const checkFileExists = async (md5) => {
    try {
      const response = await request.get('/api/file/check', {
        params: { md5 }
      })
      return response.data.exists
    } catch (error) {
      return false
    }
  }
  
  /**
   * 分块上传文件
   */
  const uploadFileInChunks = async (file, options = {}) => {
    const {
      chunkSize = FILE_CONFIG.CHUNK_SIZE,
      onProgress = () => {},
      onChunkComplete = () => {},
      signal // AbortSignal for cancellation
    } = options
    
    const fileId = file.uid || Date.now().toString()
    const totalChunks = Math.ceil(file.size / chunkSize)
    let uploadedChunks = 0
    
    // 记录上传状态
    uploadingFiles.set(fileId, {
      file,
      progress: 0,
      status: 'uploading',
      abortController: options.abortController
    })
    
    try {
      // 计算文件MD5
      const md5 = await calculateFileMD5(file)
      
      // 检查是否可以秒传
      const exists = await checkFileExists(md5)
      if (exists) {
        onProgress(100)
        uploadingFiles.set(fileId, { ...uploadingFiles.get(fileId), progress: 100, status: 'success' })
        return { success: true, message: '文件已存在，秒传成功' }
      }
      
      // 分块上传
      const chunks = await readFileInChunks(file, chunkSize)
      
      for (let i = 0; i < chunks.length; i++) {
        if (signal?.aborted) {
          throw new Error('上传已取消')
        }
        
        const formData = new FormData()
        formData.append('file', chunks[i])
        formData.append('filename', file.name)
        formData.append('chunk', i.toString())
        formData.append('chunks', totalChunks.toString())
        formData.append('md5', md5)
        
        await request.post('/api/file/upload/chunk', formData, {
          signal,
          onUploadProgress: (progressEvent) => {
            const chunkProgress = (progressEvent.loaded / progressEvent.total) * 100
            const totalProgress = ((uploadedChunks + chunkProgress / 100) / totalChunks) * 100
            onProgress(Math.round(totalProgress))
            
            uploadingFiles.set(fileId, {
              ...uploadingFiles.get(fileId),
              progress: totalProgress
            })
          }
        })
        
        uploadedChunks++
        onChunkComplete(i + 1, totalChunks)
      }
      
      // 合并文件
      const mergeResponse = await request.post('/api/file/upload/merge', {
        filename: file.name,
        chunks: totalChunks,
        md5
      })
      
      uploadingFiles.set(fileId, {
        ...uploadingFiles.get(fileId),
        progress: 100,
        status: 'success',
        response: mergeResponse.data
      })
      
      return mergeResponse.data
    } catch (error) {
      uploadingFiles.set(fileId, {
        ...uploadingFiles.get(fileId),
        status: 'error',
        error: error.message
      })
      throw error
    }
  }
  
  /**
   * 普通上传（小文件）
   */
  const uploadFile = async (file, options = {}) => {
    const { onProgress = () => {} } = options
    
    // 小文件直接上传
    if (file.size <= FILE_CONFIG.CHUNK_SIZE) {
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        const response = await request.post('/api/file/upload', formData, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        })
        
        return response.data
      } catch (error) {
        ElMessage.error(error.message || MESSAGE_CONFIG.UPLOAD_FAILED)
        throw error
      }
    } else {
      // 大文件使用分块上传
      return uploadFileInChunks(file, options)
    }
  }
  
  /**
   * 批量上传
   */
  const uploadFiles = async (files, options = {}) => {
    const { 
      concurrent = 3, // 并发数
      onFileComplete = () => {},
      onAllComplete = () => {}
    } = options
    
    const results = []
    const chunks = []
    
    // 将文件分组
    for (let i = 0; i < files.length; i += concurrent) {
      chunks.push(files.slice(i, i + concurrent))
    }
    
    // 按组上传
    for (const chunk of chunks) {
      const promises = chunk.map(file => 
        uploadFile(file, {
          ...options,
          onProgress: (progress) => {
            options.onProgress?.(file, progress)
          }
        }).then(result => {
          onFileComplete(file, result)
          return { file, result, success: true }
        }).catch(error => {
          onFileComplete(file, null, error)
          return { file, error, success: false }
        })
      )
      
      const chunkResults = await Promise.all(promises)
      results.push(...chunkResults)
    }
    
    onAllComplete(results)
    return results
  }
  
  /**
   * 取消上传
   */
  const cancelUpload = (fileId) => {
    const uploadInfo = uploadingFiles.get(fileId)
    if (uploadInfo?.abortController) {
      uploadInfo.abortController.abort()
      uploadingFiles.delete(fileId)
    }
  }
  
  /**
   * 获取上传进度
   */
  const getUploadProgress = (fileId) => {
    return uploadingFiles.get(fileId)?.progress || 0
  }
  
  /**
   * 清理上传记录
   */
  const clearUploadRecords = () => {
    uploadingFiles.clear()
    uploadQueue.value = []
  }
  
  return {
    uploadFile,
    uploadFiles,
    uploadFileInChunks,
    cancelUpload,
    getUploadProgress,
    clearUploadRecords,
    uploadQueue,
    uploadingFiles
  }
} 