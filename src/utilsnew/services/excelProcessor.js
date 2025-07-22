/**
 * Excel处理服务
 * 改进版本，增加错误处理和配置化
 */

import { EXCEL_CONFIG, ERROR_MESSAGES } from '../config/constants.js'

class ExcelProcessor {
  constructor() {
    this.workers = new Map()
    this.isLoading = false
  }

  /**
   * 创建Web Worker
   */
  createWorker() {
    if (typeof Worker === 'undefined') {
      throw new Error('当前浏览器不支持Web Worker')
    }

    // 创建内联Worker，避免外部文件依赖
    const workerCode = `
      // 动态加载 SheetJS 库
      importScripts('https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js');

      self.onmessage = function(e) {
        try {
          const { data, options } = e.data;

          // 读取Excel文件
          const workbook = XLSX.read(data, {
            type: 'array',
            sheetRows: options.maxRows || 10,
            dense: true
          });

          // 获取第一个工作表
          if (workbook.SheetNames.length === 0) {
            throw new Error('Excel文件中没有工作表');
          }

          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

          // 转换为JSON格式
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
            header: 1,
            defval: ''
          });

          // 返回处理结果
          self.postMessage({
            success: true,
            data: jsonData,
            sheetNames: workbook.SheetNames
          });
        } catch (error) {
          self.postMessage({
            success: false,
            error: error.message
          });
        }
      };
    `

    const blob = new Blob([workerCode], { type: 'application/javascript' })
    const workerUrl = URL.createObjectURL(blob)
    const worker = new Worker(workerUrl)

    // 清理URL对象
    worker.addEventListener('message', () => {
      URL.revokeObjectURL(workerUrl)
    }, { once: true })

    return worker
  }

  /**
   * 处理Excel文件
   * @param {File|ArrayBuffer} fileData 文件数据
   * @param {Object} options 处理选项
   * @returns {Promise} 处理结果
   */
  async processExcel(fileData, options = {}) {
    if (this.isLoading) {
      throw new Error('正在处理其他文件，请稍候')
    }

    try {
      this.isLoading = true

      // 验证文件
      if (fileData instanceof File) {
        if (!this.validateFile(fileData)) {
          throw new Error('文件验证失败')
        }
        
        // 转换为ArrayBuffer
        fileData = await this.fileToArrayBuffer(fileData)
      }

      // 合并配置
      const processingOptions = {
        maxRows: EXCEL_CONFIG.MAX_ROWS,
        previewRows: EXCEL_CONFIG.PREVIEW_ROWS,
        ...options
      }

      // 使用Worker处理
      const result = await this.processWithWorker(fileData, processingOptions)
      
      return {
        success: true,
        data: result.data,
        sheetNames: result.sheetNames,
        rowCount: result.data.length,
        previewData: result.data.slice(0, processingOptions.previewRows)
      }

    } catch (error) {
      console.error('Excel处理失败:', error)
      throw new Error(error.message || ERROR_MESSAGES.FILE.PROCESSING_FAILED)
    } finally {
      this.isLoading = false
    }
  }

  /**
   * 使用Worker处理数据
   * @param {ArrayBuffer} data 文件数据
   * @param {Object} options 处理选项
   */
  processWithWorker(data, options) {
    return new Promise((resolve, reject) => {
      const worker = this.createWorker()
      
      // 设置超时
      const timeout = setTimeout(() => {
        worker.terminate()
        reject(new Error('处理超时'))
      }, 30000) // 30秒超时

      worker.onmessage = (e) => {
        clearTimeout(timeout)
        worker.terminate()

        const result = e.data
        if (result.success) {
          resolve(result)
        } else {
          reject(new Error(result.error))
        }
      }

      worker.onerror = (error) => {
        clearTimeout(timeout)
        worker.terminate()
        reject(new Error('Worker执行错误: ' + error.message))
      }

      // 发送数据到Worker
      worker.postMessage({ data, options })
    })
  }

  /**
   * 验证文件
   * @param {File} file 文件对象
   */
  validateFile(file) {
    // 检查文件大小
    if (file.size > EXCEL_CONFIG.MAX_FILE_SIZE) {
      throw new Error(ERROR_MESSAGES.FILE.SIZE_EXCEEDED)
    }

    // 检查文件类型
    const fileName = file.name.toLowerCase()
    const isValidType = EXCEL_CONFIG.SUPPORTED_FORMATS.some(format => 
      fileName.endsWith(format)
    )

    if (!isValidType) {
      throw new Error(ERROR_MESSAGES.FILE.TYPE_NOT_SUPPORTED)
    }

    return true
  }

  /**
   * 文件转ArrayBuffer
   * @param {File} file 文件对象
   */
  fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        resolve(e.target.result)
      }
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }
      
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * 批量处理Excel文件
   * @param {File[]} files 文件数组
   * @param {Object} options 处理选项
   */
  async processBatch(files, options = {}) {
    const results = []
    const errors = []

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.processExcel(files[i], options)
        results.push({
          file: files[i].name,
          result
        })
      } catch (error) {
        errors.push({
          file: files[i].name,
          error: error.message
        })
      }
    }

    return {
      success: results.length > 0,
      results,
      errors,
      total: files.length,
      processed: results.length,
      failed: errors.length
    }
  }

  /**
   * 取消所有处理
   */
  cancelAll() {
    this.workers.forEach(worker => {
      worker.terminate()
    })
    this.workers.clear()
    this.isLoading = false
  }

  /**
   * 获取处理状态
   */
  getStatus() {
    return {
      isLoading: this.isLoading,
      activeWorkers: this.workers.size
    }
  }
}

// 创建单例实例
const excelProcessor = new ExcelProcessor()

export default excelProcessor
export { ExcelProcessor } 