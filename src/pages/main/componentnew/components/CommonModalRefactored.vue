<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
    class="common-modal"
  >
    <!-- 文件预览 -->
    <div v-if="previewType === 'pdf'" class="pdf-preview">
      <iframe :src="previewContent" frameborder="0" />
    </div>
    
    <div v-else-if="previewType === 'image'" class="image-preview">
      <img :src="previewContent" alt="预览图片" />
    </div>
    
    <div v-else-if="previewType === 'text'" class="text-preview">
      <pre>{{ previewContent }}</pre>
    </div>
    
    <div v-else-if="previewType === 'office'" class="office-preview">
      <iframe :src="officePreviewUrl" frameborder="0" />
    </div>
    
    <!-- 默认插槽内容 -->
    <slot v-else></slot>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">{{ cancelText }}</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">
          {{ confirmText }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { FILE_CONFIG, MESSAGE_CONFIG } from '../config/constants'
import { getFileExtension, checkFileType } from '@/utilsnew/utils/fileHelpers'
import { createObjectURL, revokeObjectURL, cleanupOnUnmount } from '@/utilsnew/utils/memoryHelpers'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '提示'
  },
  width: {
    type: String,
    default: '50%'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  loading: {
    type: Boolean,
    default: false
  },
  file: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close'])

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const previewContent = ref('')
const previewType = ref('')
const officePreviewUrl = ref('')

// 文件预览处理
const handleFilePreview = async (file) => {
  if (!file) return
  
  const ext = getFileExtension(file.name)
  
  // PDF 预览
  if (ext === 'pdf') {
    const url = createObjectURL(file.raw || file)
    previewContent.value = url
    previewType.value = 'pdf'
  }
  // 图片预览
  else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
    const url = createObjectURL(file.raw || file)
    previewContent.value = url
    previewType.value = 'image'
  }
  // 文本预览
  else if (['txt', 'md', 'json', 'js', 'css', 'html'].includes(ext)) {
    try {
      const text = await (file.raw || file).text()
      previewContent.value = text
      previewType.value = 'text'
    } catch (error) {
      ElMessage.error(MESSAGE_CONFIG.FILE_READ_ERROR)
    }
  }
  // Office 文档预览
  else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
    // 这里可以集成第三方预览服务
    officePreviewUrl.value = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(file.url)}`
    previewType.value = 'office'
  }
}

// 监听文件变化
watch(() => props.file, (newFile) => {
  if (newFile) {
    handleFilePreview(newFile)
  }
}, { immediate: true })

// 处理确认
const handleConfirm = () => {
  emit('confirm')
}

// 处理取消
const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

// 处理关闭
const handleClose = () => {
  // 清理预览内容
  if (previewType.value === 'pdf' || previewType.value === 'image') {
    revokeObjectURL(previewContent.value)
  }
  previewContent.value = ''
  previewType.value = ''
  officePreviewUrl.value = ''
  
  emit('close')
}

// 组件卸载时清理
onUnmounted(() => {
  cleanupOnUnmount()
})
</script>

<style lang="less" scoped>
.common-modal {
  .pdf-preview,
  .office-preview {
    width: 100%;
    height: 600px;
    
    iframe {
      width: 100%;
      height: 100%;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
    }
  }
  
  .image-preview {
    text-align: center;
    max-height: 600px;
    overflow: auto;
    
    img {
      max-width: 100%;
      height: auto;
    }
  }
  
  .text-preview {
    max-height: 600px;
    overflow: auto;
    background: #f5f7fa;
    padding: 20px;
    border-radius: 4px;
    
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 14px;
      line-height: 1.5;
    }
  }
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
  text-align: right;
  box-sizing: border-box;
}
</style> 