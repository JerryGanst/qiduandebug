<template>
  <div class="drag_content" style="width: 86%; margin-left: 5%; position: relative">
    <div v-if="!fileLoading">支持格式：.doc,.docx,.txt,.pdf,pptx,.ppt,.xls,.xlsx</div>
    <div v-if="!fileLoading">大小不超过50M</div>
    <div v-if="fileLoading" class="loading-mask">
      <div class="loading-content">
        <el-icon class="is-loading" :size="24"><Loading /></el-icon>
        <span class="loading-text">文件上传中...</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useShared } from '@/utils/useShared'
import { ElMessage } from 'element-plus' // 引入 ElMessage
import eventBus from '@/utils/eventBus'
import axios from 'axios'
const { pageType, isDragOver, currentQuestion, drayAry, limitFile, limitFinalFile } = useShared()
const uploadTimer = ref(null)
const fileLoading = ref(false)
const fileList = ref([])
const emit = defineEmits(['submit-tran', 'submit-final'])
let uploadPromises = [] // 存储所有上传Promise
const setFiles = val => {
  isDragOver.value = true
  handleFileAdd(val)
}
const uploadSingleFile = async file => {
  const formData = new FormData()
  formData.append('files', file.raw)
  formData.append('local', true)
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  await axios
    .post(import.meta.env.VITE_API_BASE_URL + '/AI/fileUpload', formData, {
      cancelToken: source.token,
      onUploadProgress: progressEvent => {
        file.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
      }
    })
    .then(res => {
      if (res.data.status) {
        fileLoading.value = false
        isDragOver.value = false
        if (pageType.value === 'sample') {
          drayAry.value.push(res.data?.data[0])
          eventBus.emit('submit-sampleFile', drayAry.value)
        } else {
          if (pageType.value === 'tran') {
            limitFile.value = res.data?.data[0]
          } else {
            limitFinalFile.value = res.data?.data[0]
          }

          emit(pageType.value === 'tran' ? 'submit-tran' : 'submit-final', res.data?.data[0])
        }
      } else {
        fileLoading.value = false
        ElMessage.error(res.data.message)
      }
    })
    .catch(err => {
      fileLoading.value = false
      isDragOver.value = false
      ElMessage.error('上传失败')
    })
}

// 附件添加处理
const handleFileAdd = async uploadFile => {
  if (uploadFile.size / 1024 / 1024 > 50) {
    ElMessage.warning('附件大小不能超过50MB!')
    return
  }
  fileList.value = []
  const file = {
    ...uploadFile,
    uid: uploadFile.uid,
    fileSize: uploadFile.size,
    originalFileName: uploadFile.name
  }
  fileList.value.push(file)
  fileLoading.value = true
  uploadSingleFile(file)
  // 自动触发上传（网页[5]防抖优化）
}
defineExpose({ setFiles })
</script>
<style scoped lang="less">
.loading-mask {
  position: absolute;
  top: 100px;
  left: 0;
  right: 0;
  bottom: 140px;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.loading-text {
  color: #1b6cff;
  font-size: 16px;
}

.is-loading {
  color: #1b6cff;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.drag_content {
  display: flex;
  flex-direction: column;
  width: 92vh;
  height: 92vh;
  margin: 4vh;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  padding: 15px;
  color: rgb(134, 134, 134);
  border: 2px dashed #1b6cff;
  border-radius: 6px;
}
</style>
