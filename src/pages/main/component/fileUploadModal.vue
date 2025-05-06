<template>
  <el-dialog
    v-model="dialogVisible"
    title="文件上传"
    width="1100px"
    class="custom-upload-dialog"
    style="margin-top: 3vh"
  >
    <div class="upload-layout">
      <!-- 左侧文件列表 -->
      <div class="file-list">
        <div class="file_item">
          <div v-for="(file, index) in fileQueue" :key="file.uid" class="file-item" @click="handlePreview(file)">
            <div class="file_img">
              <img :src="file.extension === 'txt' ? text : file.extension === 'pdf' ? pdf : word" />
            </div>
            <div class="file-info">
              <span class="filename">{{ file.name }}</span>
              <div class="file-actions">
                <span
                  @click="handleDelete(index)"
                  style="width: 20px; height: 20px; cursor: pointer"
                  :style="{ marginRight: file.status === 'pending' ? '0px' : '10px' }"
                >
                  <img src="@/assets/deleteFile.svg" style="width: 100%; height: 100%" />
                </span>
                <span
                  v-if="file.status === 'uploading'"
                  @click.stop="pauseUpload(file)"
                  style="width: 20px; height: 20px; cursor: pointer"
                >
                  <img src="@/assets/continue.svg" style="width: 100%; height: 100%" />
                </span>
                <!-- <span
                v-if="file.status === 'padding'"
                @click.stop="pauseUpload(file)"
                style="width: 20px; height: 20px; cursor: pointer"
              >
                <img src="@/assets/continue.svg" style="width: 100%; height: 100%" />
              </span> -->
                <span
                  v-else-if="file.status === 'paused'"
                  @click.stop="resumeUpload(file)"
                  style="width: 20px; height: 20px; cursor: pointer"
                >
                  <img src="@/assets/pause.svg" style="width: 100%; height: 100%" />
                </span>
                <span
                  v-else-if="file.status === 'error'"
                  @click.stop="retryUpload(file)"
                  style="width: 20px; height: 20px; cursor: pointer"
                >
                  <img src="@/assets/refreshFile.svg" style="width: 100%; height: 100%" />
                </span>
                <span v-else-if="file.status === 'success'" style="width: 20px; height: 20px">
                  <img src="@/assets/doneFile.svg" style="width: 100%; height: 100%" />
                </span>
              </div>
              <!-- <span class="file-type">{{ file.extension }}</span> -->
            </div>
            <div style="font-size: 12px; color: #bebebe; margin-top: 2px; margin-bottom: 4px">
              {{ file.size ? (file.size / 1024).toFixed(1) : 0 }}KB
            </div>
            <el-progress
              :percentage="file.progress"
              :color="customProgressColor(file)"
              :status="getStatusType(file.status)"
            />
          </div>
        </div>

        <div class="upload_list">
          <el-upload
            drag
            :auto-upload="false"
            :multiple="type === 'sample' ? true : false"
            :accept="allowedFileTypes"
            :on-change="handleFileAdd"
            :show-file-list="false"
            :file-list="fileQueue"
            :before-upload="checkFileSize"
            :limit="5"
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">
              拖拽文件到此或
              <em>点击上传</em>
              <div class="el-upload__subtext">
                <span>支持格式：{{ allowedFileTypes }}</span>
              </div>
              <div class="el-upload__subtext" v-if="type === 'sample'">
                <span style="color: rgb(216, 30, 6)">一次性最多上传五个文件</span>
              </div>
            </div>
          </el-upload>
        </div>
      </div>

      <!-- 右侧上传区域 -->
      <div class="upload-area">
        <!-- 文件预览 -->
        <div v-if="previewFileId" class="preview-container" :key="previewFileId">
          <div v-if="previewType === 'text'" class="text-preview">
            <pre>{{ previewContent }}</pre>
          </div>
          <div v-else-if="previewType === 'html'" class="html-preview" v-html="previewContent"></div>
          <div v-else-if="previewType === 'pdf'">
            <iframe :src="previewContent" frameborder="0" class="pdf-frame"></iframe>
          </div>
          <div v-else class="unsupported-preview">暂不支持此格式预览</div>
        </div>
        <div v-else="previewFileId" class="preview-container">
          <div class="unsupported-preview">请先上传文件即可预览</div>
        </div>
      </div>
    </div>
    <div class="upload_btn">
      <el-button @click="dialogVisible = false" style="width: 100px; height: 40px; margin-left: 15px">取消</el-button>
      <el-button
        type="primary"
        @click="startUpload(type === 'sample' ? fileQueue : fileQueue[0])"
        style="width: 100px; height: 40px"
        :disabled="!hasPendingFiles || !isLogin"
      >
        提交
      </el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import axios from 'axios'
import mammoth from 'mammoth'
import { useShared } from '@/utils/useShared'
import eventBus from '@/utils/eventBus'
import word from '@/assets/w.png'
import text from '@/assets/text.png'
import pdf from '@/assets/pdf.png'
import { ElMessage } from 'element-plus' // 引入 ElMessage
import { Close } from '@element-plus/icons-vue'
import request from '@/utils/request' // 导入封装的 axios 方法
const dialogVisible = ref(false)
const fileQueue = ref([])
const previewContent = ref(null)
const previewType = ref('')
const previewFileId = ref(null)
const type = ref('tran')
const emit = defineEmits(['submit-tran', 'submit-final'])
const { fileObj, isSampleLoad, finalIng, isLogin, fileAry } = useShared()
// 常量定义
const STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  PAUSED: 'paused',
  SUCCESS: 'success',
  ERROR: 'error'
}
const allowedFileTypes = '.doc,.docx,.txt,.pdf'
// 颜色映射
const statusColors = {
  [STATUS.PENDING]: '#EDEDED',
  [STATUS.UPLOADING]: '#409EFF',
  [STATUS.PAUSED]: '#FAAD14',
  [STATUS.SUCCESS]: '#52C41A',
  [STATUS.ERROR]: '#FF4D4F'
}
// 新增删除处理函数
const handleDelete = index => {
  const deletedFile = fileQueue.value[index]
  // 清除关联预览（同步操作）
  if (previewFileId.value === deletedFile.uid) {
    previewFileId.value = null // 必须同步清除关联标识
    previewContent.value = null
    previewType.value = ''
  }
  // 强制 DOM 更新（关键修复）
  nextTick(() => {
    // 通过重新赋值触发响应式更新
    fileQueue.value = [...fileQueue.value]
    fileQueue.value.forEach(item => {
      item.status = 'pending'
    })
  })

  // 取消上传（原有逻辑）
  if (deletedFile.status === 'uploading' && deletedFile.source) {
    deletedFile.source.cancel('用户删除文件')
  }

  // 从队列中移除

  if (type.value === 'sample') {
    // 提取array2的name集合
    // 过滤array1，排除name存在于array2中的对象
    if (fileAry.value && fileAry.value.length > 0) {
      fileAry.value = fileAry.value.filter(item => item.originalFileName !== fileQueue.value[index].name)
    }

    fileQueue.value.splice(index, 1)

    nextTick(() => {
      // 通过重新赋值触发响应式更新
      handlePreview(fileQueue.value[0])
    })
  } else {
    fileQueue.value.splice(index, 1)
  }
}
// 计算属性
const hasPendingFiles = computed(() => {
  return fileQueue.value.some(file => [STATUS.PENDING, STATUS.ERROR].includes(file.status))
})
const startUpload = async file => {
  if (fileQueue.value.length === 0) {
    ElMessage.warning('请先上传文件再提交')
    return
  }
  if (isSampleLoad.value || finalIng.value) {
    ElMessage.warning('有问题正在回答中，请稍后再修改')
    return
  }
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  if (type.value === 'sample') {
    let ary = []
    for (var i = 0; i < fileQueue.value.length; i++) {
      file[i].status = STATUS.UPLOADING
      file[i].source = source
      file[i].cancel = source.cancel
      // 清除旧预览状态
      previewFileId.value = null
      previewContent.value = null
      previewType.value = ''
      try {
        previewFileId.value = file[i].uid
        const formData = new FormData()
        formData.append('files', file[i].raw)

        await axios
          .post(import.meta.env.VITE_API_BASE_URL + '/AI/fileUpload', formData, {
            cancelToken: source.token,
            onUploadProgress: progressEvent => {
              file[i].progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            }
          })
          .then(res => {
            if (res.data.status) {
              file[i].status = STATUS.SUCCESS
              file[i].progress = 100
              ary.push(res.data?.data[0])
              if (i === fileQueue.value.length - 1) {
                eventBus.emit('submit-sampleFile', ary)
              }
            } else {
              ElMessage.error(res.data.message)
              file[i].status = STATUS.ERROR
              previewFileId.value = null
            }
          })
      } catch (error) {
        previewFileId.value = null
        if (axios.isCancel(error)) {
          file[i].status = STATUS.PAUSED
        } else {
          file[i].status = STATUS.ERROR
          console.error('Upload failed:', error)
        }
        throw error
      }
    }
  } else {
    file.status = STATUS.UPLOADING
    file.source = source
    file.cancel = source.cancel
    // 清除旧预览状态
    previewFileId.value = null
    previewContent.value = null
    previewType.value = ''
    try {
      previewFileId.value = file.uid
      const formData = new FormData()
      formData.append('files', file.raw)

      await axios
        .post(import.meta.env.VITE_API_BASE_URL + '/AI/fileUpload', formData, {
          cancelToken: source.token,
          onUploadProgress: progressEvent => {
            file.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          }
        })
        .then(res => {
          if (res.data.status) {
            file.status = STATUS.SUCCESS
            file.progress = 100
            fileObj.value = res.data?.data[0]
            emit(type.value === 'tran' ? 'submit-tran' : 'submit-final', res.data?.data[0])
          } else {
            ElMessage.error(res.data.message)
            file.status = STATUS.ERROR
            previewFileId.value = null
          }
        })
    } catch (error) {
      previewFileId.value = null
      if (axios.isCancel(error)) {
        file.status = STATUS.PAUSED
      } else {
        file.status = STATUS.ERROR
        console.error('Upload failed:', error)
      }
      throw error
    }
  }
}
// 处理超出限制
// const handleExceed = (files, fileList) => {
//   console.log(fileQueue.value)
//   ElMessage.warning('最多只能上传5个文件')
// }
// 进度条颜色计算
const customProgressColor = file => {
  return statusColors[file.status] || '#409EFF'
}

const checkFileSize = file => {
  const isLt10M = file.size / 1024 / 1024 < 50
  if (!isLt10M) {
    ElMessage.warning('文件大小不能超过50MB!')
  }

  return isLt10M
}

// 兼容Element原生状态类型
const getStatusType = status => {
  return status === STATUS.ERROR ? 'exception' : status === STATUS.SUCCESS ? 'success' : undefined
}

// 文件添加处理
const handleFileAdd = uploadFile => {
  const file = {
    ...uploadFile,
    uid: uploadFile.uid,
    size: uploadFile.size,
    name: uploadFile.name,
    extension: uploadFile.name.split('.').pop().toLowerCase(),
    progress: '',
    status: STATUS.PENDING,
    cancel: null,
    source: null
  }
  if (file.size / 1024 / 1024 > 50) {
    ElMessage.warning('文件大小不能超过50MB!')
    return
  }
  previewFileId.value = file.uid
  if (type.value !== 'sample') {
    fileQueue.value = []
  }

  fileQueue.value.push(file)
  if (fileQueue.value.length > 5) {
    fileQueue.value = fileQueue.value.slice(-5)
  }

  handlePreview(type.value === 'sample' ? fileQueue.value[0] : file)
}

// 暂停上传
const pauseUpload = file => {
  if (file.source) {
    file.source.cancel('User paused upload')
    file.status = STATUS.PAUSED
  }
}

// 继续上传
const resumeUpload = file => {
  startUpload(file)
}

// 重试上传
const retryUpload = file => {
  file.progress = 0
  file.status = STATUS.PENDING
  startUpload(file)
}

// 文件预览处理
const handlePreview = async file => {
  if (!file) {
    return
  }
  try {
    if (['txt'].includes(file.extension)) {
      // 处理文本文件
      const reader = new FileReader()
      reader.onload = e => {
        previewContent.value = e.target.result
        previewType.value = 'text'
      }

      reader.readAsText(file.raw)
    } else if (['docx', 'doc'].includes(file.extension)) {
      // 处理Word文档
      const arrayBuffer = await file.raw.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer })

      // 添加Word文档基础样式
      previewContent.value = `
        <div class="word-preview">
          <style>
            .word-preview {
              font-family: "Times New Roman", serif;
              line-height: 1.2;
              padding: 20px;
              font-size:14px
            }
            table {
              border-collapse: collapse;
              margin: 10px 0;
            }
            td {
              border: 1px solid #ddd;
              padding: 8px;
            }
          </style>
          ${result.value}
        </div>
      `
      previewType.value = 'html'

      // 处理图片显示（如果需要）
      result.messages.forEach(message => {})
    } else if (['pdf'].includes(file.extension)) {
      // 生成PDF的Blob URL并预览
      const pdfUrl = URL.createObjectURL(file.raw)
      previewContent.value = pdfUrl
      previewType.value = 'pdf'

      // 在组件销毁或关闭预览时记得释放URL
      // 例如在onUnmounted或关闭弹窗的方法中调用 URL.revokeObjectURL(pdfUrl)
    } else {
      previewContent.value = '不支持此文件预览'
      previewType.value = 'unsupported'
    }
  } catch (error) {
    console.error('预览失败:', error)
    previewContent.value = '文件预览失败'
    previewType.value = 'error'
  }
}

const openFile = (val, ary) => {
  dialogVisible.value = true
  type.value = val
  if (val === 'sample') {
    if (ary) {
      fileAry.value = ary
    }
    getFileAry()
  } else {
    if (fileObj.value) {
      getFile()
    } else {
      fileQueue.value = []
    }
  }
}

const getTextAfterLastDot = str => {
  const lastDotIndex = str.lastIndexOf('.')
  if (lastDotIndex === -1) return '' // 没有点号时返回空字符串
  return str.slice(lastDotIndex + 1)
}
const getFileAry = () => {
  fileQueue.value = []
  for (var i = 0; i < fileAry.value.length; i++) {
    const name = fileAry.value[i].originalFileName
    fetch(import.meta.env.VITE_API_BASE_URL + '/Files/getFileById?id=' + fileAry.value[i].fileId, {
      method: 'POST'
    })
      .then(response => {
        // 从 Content-Disposition 中解析文件名
        const disposition = response.headers.get('Content-Disposition')
        let filename = 'default_filename' // 默认文件名
        if (disposition && disposition.indexOf('filename=') !== -1) {
          filename = disposition.split('filename=')[1].replace(/"/g, '')
        }

        // 获取二进制数据
        return response.blob().then(blob => ({ blob, filename }))
      })
      .then(({ blob, filename }) => {
        // 将 Blob 转换为 File 对象（类似 file.raw）
        const file = new File([blob], filename, { type: blob.type })
        const firstDecode = decodeURIComponent(file.name)
        const fileOther = {
          raw: file,
          uid: file.lastModified,
          size: file.size,
          name: decodeURIComponent(firstDecode),
          extension: getTextAfterLastDot(name),
          progress: 100,
          status: STATUS.SUCCESS,
          cancel: null,
          source: null
        }
        previewFileId.value = fileOther.uid
        // 此时可以像处理 el-upload 的 file.raw 一样处理 file

        fileQueue.value.push(fileOther)
        handlePreview(fileQueue.value[0])
      })
      .catch(error => {
        console.error('获取文件失败:', error)
      })
  }
}
const getFile = () => {
  // 使用 POST 请求（与后端 @PostMapping 匹配）
  fetch(import.meta.env.VITE_API_BASE_URL + '/Files/getFileById?id=' + fileObj.value.fileId, {
    method: 'POST'
  })
    .then(response => {
      // 从 Content-Disposition 中解析文件名
      const disposition = response.headers.get('Content-Disposition')
      let filename = 'default_filename' // 默认文件名
      if (disposition && disposition.indexOf('filename=') !== -1) {
        filename = disposition.split('filename=')[1].replace(/"/g, '')
      }

      // 获取二进制数据
      return response.blob().then(blob => ({ blob, filename }))
    })
    .then(({ blob, filename }) => {
      // 将 Blob 转换为 File 对象（类似 file.raw）
      const file = new File([blob], filename, { type: blob.type })
      const fileOther = {
        raw: file,
        uid: file.lastModified,
        size: file.size,
        name: decodeURIComponent(file.name),
        extension: getTextAfterLastDot(fileObj.value.originalFileName),
        progress: 100,
        status: STATUS.SUCCESS,
        cancel: null,
        source: null
      }
      previewFileId.value = fileOther.uid
      // 此时可以像处理 el-upload 的 file.raw 一样处理 file
      fileQueue.value = []
      fileQueue.value.push(fileOther)
      handlePreview(fileOther)
    })
    .catch(error => {
      console.error('获取文件失败:', error)
    })
}
const closeFile = () => {
  dialogVisible.value = false
}

// 监听文件队列变化
watch(
  fileQueue,
  newVal => {
    if (newVal.length === 0) {
      // 队列清空时强制重置预览
      previewContent.value = null
      previewType.value = ''
      previewFileId.value = null
    }
  },
  { deep: true }
)
defineExpose({ openFile, closeFile })
</script>

<style scoped lang="less">
.pdf-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.pdf-frame {
  width: 100%;
  height: 500px;
  border: 0;
  box-shadow: none !important;
  outline: none !important;
}
.delete-icon {
  margin-right: 5px;
  width: 24px;
  height: 24px;
}
.upload_btn {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
}
.custom-upload-dialog {
  height: 1200px;
  --el-dialog-margin-top: 5vh;
}

.upload-layout {
  display: flex;
  height: 100%;
  gap: 20px;
}

.file-list {
  width: 350px;
  height: 538px;
  border-radius: 4px;

  overflow-y: hidden;
  padding-right: 15px;
  display: flex;
  position: relative;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  .file_item {
    width: 100%;
    height: 400px;
    overflow-y: auto;
  }
  .upload_list {
    width: calc(100% - 30px);
    margin-left: 15px;
    position: absolute;
    bottom: 15px;
  }
}

.file-item {
  padding: 2px 12px 12px 12px;
  margin-bottom: 10px;
  border-radius: 6px;
  background: #f5f7fa;
  transition: all 0.3s;
  width: calc(100% - 40px);
  margin-left: 14px;
  margin-top: 15px;
  background-color: #fff;
  border: 1px solid #eee;
  .file_img {
    width: 42px;
    height: 52px;
    float: left;
    margin-right: 10px;
    margin-top: 10px;
    img {
      width: 100%;
      height: 100%;
    }
  }
}

.file-item:hover {
  background: #ebedf0;
}

.file-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  align-items: center;
}

.filename {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
  font-size: 14px;
  width: 200px;
}

.file-type {
  color: #909399;
  font-size: 0.9em;
}

.file-actions {
  margin-top: 4px;
  text-align: right;
  display: flex;
  :deep(.el-button--small:hover) {
    color: #fff;
  }
}

.upload-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-container {
  height: 508px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  overflow: auto;
  max-width: 670px;
}
.preview-container::-webkit-scrollbar {
  width: 1px; /* 滚动条宽度 */
}
.preview-container::-webkit-scrollbar-track {
  background: #f1f1f1; /* 轨道背景颜色 */
  border-radius: 0px; /* 轨道圆角 */
}
.preview-container::-webkit-scrollbar-thumb {
  background: #888; /* 滑块颜色 */
  border-radius: 0px; /* 滑块圆角 */
  border: 1px solid #f1f1f1; /* 滑块边框 */
}
.preview-container::-webkit-scrollbar-thumb:hover {
  background: #555; /* 滑块悬停时的颜色 */
}
// .text-preview pre {
//   white-space: pre-wrap;
//   font-family: monospace;
//   margin: 0;
// }

.unsupported-preview {
  color: #909399;
  text-align: center;
  padding: 50px 0;
}
</style>
