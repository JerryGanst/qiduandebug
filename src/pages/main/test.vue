<template>
  <div>
    <el-button type="primary" @click="dialogVisible = true">打开上传弹窗</el-button>

    <el-dialog v-model="dialogVisible" title="文件上传" width="1000px" :before-close="handleClose">
      <div
        class="upload-container"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop.prevent="handleDrop"
        :class="{ 'drag-over': isDragOver }"
      >
        <el-upload
          ref="uploadRef"
          class="upload-area"
          action="https://jsonplaceholder.typicode.com/posts/"
          multiple
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
        >
          <el-button type="primary" size="large">文件上传</el-button>
        </el-upload>

        <div class="file-list">
          <h3>已选择文件列表</h3>
          <el-table :data="fileList" style="width: 100%">
            <el-table-column prop="name" label="文件名" width="180" />
            <el-table-column prop="size" label="大小" width="180">
              <template #default="{ row }">
                {{ formatFileSize(row.size) }}
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" />
            <el-table-column label="操作">
              <template #default="{ $index }">
                <el-button type="danger" size="small" @click="removeFile($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="upload-actions">
            <el-button type="primary" @click="submitUpload">开始上传</el-button>
            <el-button @click="clearFiles">清空列表</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const isDragOver = ref(false)
const fileList = ref([])
const uploadRef = ref(null)

const handleClose = done => {
  if (fileList.value.length > 0) {
    ElMessage.warning('还有未上传的文件，确定关闭吗？')
  }
  done()
}

const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = e => {
  isDragOver.value = false
  const files = Array.from(e.dataTransfer.files)
  addFiles(files)
}

const handleFileChange = (file, files) => {
  fileList.value = files
}

const addFiles = files => {
  files.forEach(file => {
    if (!fileList.value.some(f => f.name === file.name && f.size === file.size)) {
      fileList.value.push(file)
    }
  })
}

const removeFile = index => {
  fileList.value.splice(index, 1)
}

const clearFiles = () => {
  fileList.value = []
}

const submitUpload = () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先添加文件')
    return
  }

  // 这里实际项目中应该是调用上传API
  ElMessage.success(`开始上传 ${fileList.value.length} 个文件`)
  console.log('上传文件:', fileList.value)

  // 模拟上传完成后清空列表
  setTimeout(() => {
    fileList.value = []
    ElMessage.success('上传完成')
  }, 2000)
}

const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.upload-container {
  width: 100%;
  height: 800px; /* 1000px弹窗减去标题栏和边距 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  padding: 20px;
  transition: border-color 0.3s;
}

.upload-container.drag-over {
  border-color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

.upload-area {
  margin-bottom: 30px;
}

.file-list {
  width: 100%;
  flex-grow: 1;
  overflow-y: auto;
}

.upload-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>
