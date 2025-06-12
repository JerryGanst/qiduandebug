<template>
  <div class="drag_content" style="width: 86%; margin-left: 5%">
    <div>支持格式：.doc,.docx,.txt,.pdf</div>
    <div>大小不超过50M</div>
  </div>
</template>
<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useShared } from '@/utils/useShared'
import { ElMessage } from 'element-plus' // 引入 ElMessage
import eventBus from '@/utils/eventBus'
import axios from 'axios'
const { pageType, isDragOver } = useShared()
const uploadTimer = ref(null)
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
        isDragOver.value = false
        if (pageType.value === 'sample') {
          eventBus.emit('submit-sampleFile', res.data?.data)
        } else {
          emit(pageType.value === 'tran' ? 'submit-tran' : 'submit-final', res.data?.data[0])
        }
      } else {
        ElMessage.error(res.data.message)
      }
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
  uploadSingleFile(file)
  // 自动触发上传（网页[5]防抖优化）
}
defineExpose({ setFiles })
</script>
<style scoped lang="less">
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
