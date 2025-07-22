<template>
  <div 
    class="drag-upload-container"
    :class="{ 'is-dragover': isDragover }"
    @drop.prevent="handleDrop"
    @dragover.prevent="handleDragover"
    @dragleave.prevent="handleDragleave"
    @click="handleClick"
  >
    <div class="upload-content">
      <i class="el-icon-upload"></i>
      <div class="upload-text">
        <p>将文件拖到此处，或<em>点击上传</em></p>
        <p class="upload-tip">{{ uploadTip }}</p>
      </div>
    </div>
    
    <input
      ref="fileInput"
      type="file"
      :multiple="multiple"
      :accept="acceptTypes"
      @change="handleFileChange"
      style="display: none"
    />
    
    <!-- 文件列表 -->
    <div v-if="fileList.length > 0" class="file-list">
      <div v-for="(file, index) in fileList" :key="file.uid" class="file-item">
        <div class="file-info">
          <img :src="getFileIcon(file.name)" class="file-icon" />
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
        </div>
        <el-progress
          v-if="file.status === 'uploading'"
          :percentage="file.percentage"
          :stroke-width="2"
        />
        <div class="file-actions">
          <el-button
            v-if="file.status === 'ready'"
            type="text"
            size="small"
            @click="handleUpload(file)"
          >
            上传
          </el-button>
          <el-button
            type="text"
            size="small"
            @click="handleRemove(index)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useFile } from '@/utilsnew/composables/useFile'
import { FILE_CONFIG, MESSAGE_CONFIG } from '../config/constants'
import { 
  getFileIcon, 
  checkFileSize, 
  checkFileType, 
  formatFileSize,
  validateFile 
} from '@/utilsnew/utils/fileHelpers'
import { cleanupOnUnmount } from '@/utilsnew/utils/memoryHelpers'

// Props
const props = defineProps({
  multiple: {
    type: Boolean,
    default: true
  },
  maxSize: {
    type: Number,
    default: FILE_CONFIG.MAX_SIZE_MB
  },
  accept: {
    type: Array,
    default: () => FILE_CONFIG.ALLOWED_EXTENSIONS
  },
  autoUpload: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['upload', 'remove', 'change'])

// 使用composables
const { uploadFile } = useFile()

// 响应式数据
const isDragover = ref(false)
const fileInput = ref(null)
const fileList = ref([])

// 计算属性
const acceptTypes = computed(() => props.accept.join(','))
const uploadTip = computed(() => 
  `支持 ${props.accept.join('、')} 格式，单个文件不超过 ${props.maxSize}MB`
)

// 拖拽处理
const handleDragover = () => {
  isDragover.value = true
}

const handleDragleave = () => {
  isDragover.value = false
}

const handleDrop = (e) => {
  isDragover.value = false
  const files = Array.from(e.dataTransfer.files)
  handleFiles(files)
}

// 文件选择处理
const handleFileChange = (e) => {
  const files = Array.from(e.target.files)
  handleFiles(files)
  // 清空input值，允许重复选择相同文件
  e.target.value = ''
}

// 处理文件
const handleFiles = (files) => {
  const validFiles = files.filter(file => {
    // 验证文件
    const validation = validateFile(file, {
      maxSize: props.maxSize * 1024 * 1024,
      allowedTypes: props.accept
    })
    
    if (!validation.isValid) {
      ElMessage.error(validation.error)
      return false
    }
    
    // 检查重复
    const isDuplicate = fileList.value.some(f => 
      f.name === file.name && f.size === file.size
    )
    
    if (isDuplicate) {
      ElMessage.warning(`文件 ${file.name} 已存在`)
      return false
    }
    
    return true
  })
  
  // 添加到文件列表
  const newFiles = validFiles.map(file => ({
    uid: Date.now() + Math.random(),
    name: file.name,
    size: file.size,
    raw: file,
    status: 'ready',
    percentage: 0
  }))
  
  fileList.value.push(...newFiles)
  emit('change', fileList.value)
  
  // 自动上传
  if (props.autoUpload) {
    newFiles.forEach(file => handleUpload(file))
  }
}

// 上传文件
const handleUpload = async (file) => {
  try {
    file.status = 'uploading'
    
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (file.percentage < 90) {
        file.percentage += 10
      }
    }, 200)
    
    // 实际上传
    const result = await uploadFile(file.raw, {
      onProgress: (percent) => {
        file.percentage = percent
      }
    })
    
    clearInterval(progressInterval)
    file.percentage = 100
    file.status = 'success'
    file.response = result
    
    ElMessage.success(`${file.name} 上传成功`)
    emit('upload', file)
  } catch (error) {
    file.status = 'error'
    ElMessage.error(`${file.name} 上传失败：${error.message}`)
  }
}

// 移除文件
const handleRemove = (index) => {
  const removed = fileList.value.splice(index, 1)
  emit('remove', removed[0])
  emit('change', fileList.value)
}

// 点击上传区域
const handleClick = () => {
  fileInput.value?.click()
}

// 清理
onUnmounted(() => {
  cleanupOnUnmount()
})

// 暴露方法
defineExpose({
  fileList,
  handleClick,
  clearFiles: () => {
    fileList.value = []
    emit('change', [])
  }
})
</script>

<style lang="less" scoped>
.drag-upload-container {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  
  &:hover {
    border-color: #409eff;
  }
  
  &.is-dragover {
    border-color: #409eff;
    background-color: #f0f9ff;
  }
  
  .upload-content {
    padding: 40px;
    text-align: center;
    
    .el-icon-upload {
      font-size: 67px;
      color: #c0c4cc;
      margin-bottom: 16px;
      display: block;
    }
    
    .upload-text {
      color: #606266;
      font-size: 14px;
      
      em {
        color: #409eff;
        font-style: normal;
      }
      
      .upload-tip {
        margin-top: 7px;
        font-size: 12px;
        color: #909399;
      }
    }
  }
  
  .file-list {
    max-height: 300px;
    overflow-y: auto;
    padding: 10px;
    
    .file-item {
      display: flex;
      align-items: center;
      padding: 8px;
      border-radius: 4px;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      .file-info {
        flex: 1;
        display: flex;
        align-items: center;
        
        .file-icon {
          width: 32px;
          height: 32px;
          margin-right: 10px;
        }
        
        .file-name {
          flex: 1;
          margin-right: 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .file-size {
          color: #909399;
          font-size: 12px;
          margin-right: 10px;
        }
      }
      
      .el-progress {
        flex: 1;
        margin: 0 10px;
      }
      
      .file-actions {
        display: flex;
        gap: 10px;
      }
    }
  }
}
</style> 