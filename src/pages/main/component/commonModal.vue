<template>
  <div
    class="upload-layout"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
    :class="{ 'drag-over': isDragOver }"
  >
    <!-- 左侧附件列表 -->
    <div class="file-list" style="width: 100%">
      <div class="file_search">
        <div class="file_left" v-if="isUpload">
          <el-upload
            drag
            :auto-upload="false"
            :multiple="true"
            :accept="allowedFileTypes"
            :on-change="handleFileAdd"
            :show-file-list="false"
            :file-list="fileQueue"
            :before-upload="checkFileSize"
          >
            <div class="file_upload">文件上传</div>
          </el-upload>
        </div>
        <div class="file_right">
          <div class="file_content">
            <!-- <el-input v-model="searchText" :prefix-icon="Search" placeholder="请输入关键词搜索" clearable /> -->
            <el-input
              v-model="searchText"
              placeholder="请点击搜索图标或按Enter键"
              @keydown.enter.prevent="searchData"
              clearable
              @clear="clearData"
            >
              <!-- 使用插槽自定义前缀图标并绑定事件 -->
              <template #prefix>
                <el-icon class="el-input__icon" @click="searchData" style="cursor: pointer">
                  <Search />
                </el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </div>
      <div
        class="file_item"
        :style="{
          marginTop: isUpload ? '70px' : '70px',
          marginBottom: isUpload ? '12px' : '0px',
          height: isUpload ? 'calc(100% - 142px)' : 'calc(100% - 130px)'
        }"
      >
        <div
          v-for="(file, index) in fileQueue"
          :key="file.uid"
          class="file-item"
          :class="{ 'uploading-file': file.status === 'pending' }"
          @click="getFile(file)"
          style="position: relative; width: 8%; margin-left: 13px"
        >
          <div class="file_img">
            <img
              v-if="file.fileType"
              :src="
                file.fileType === 'txt'
                  ? text
                  : file.fileType === 'pdf'
                    ? pdf
                    : file.fileType === 'ppt'
                      ? ppt
                      : file.fileType === 'pptx'
                        ? ppt
                        : file.fileType === 'xls'
                          ? excel
                          : file.fileType === 'xlsx'
                            ? excel
                            : word
              "
            />
          </div>
          <div class="fileName" style="width: 70px">
            {{ file.fileName }}
          </div>
          <!-- <div style="font-size: 12px; color: #bebebe; margin-top: 2px">
                {{ file.fileSize ? (file.fileSize / 1024).toFixed(1) : 0 }}KB
              </div> -->
          <el-popconfirm
            title="确定要删除吗？"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="handleDelete(index, $event)"
          >
            <template #reference>
              <span @click.stop>
                <!-- 阻止点击事件冒泡 -->
                <div
                  style="width: 20px; height: 20px; cursor: pointer; position: absolute; right: 4px; top: 4px"
                  v-if="isDelete"
                >
                  <img src="@/assets/deleteFile.svg" style="width: 100%; height: 100%" />
                </div>
              </span>
            </template>
          </el-popconfirm>
        </div>
      </div>
      <div style="width: 100%; height: 50px; display: flex; justify-content: center; align-items: center">
        <!-- 分页器 -->
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[30, 50, 100]"
          :total="totals"
          layout="total, prev, pager, next, sizes"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import axios from 'axios'
import mammoth from 'mammoth'
import { debounce } from 'lodash-es'
import { useShared } from '@/utils/useShared'
import eventBus from '@/utils/eventBus'
import word from '@/assets/w.png'
import text from '@/assets/text.png'
import pdf from '@/assets/pdf.png'
import excel from '@/assets/excl.png'
import ppt from '@/assets/ppt.png'
import down from '@/assets/arrow_up.png'
import up from '@/assets/arrow_down.png'
import sort from '@/assets/sort.png'
import { ElMessage, ElPagination } from 'element-plus' // 引入 ElMessage
import request from '@/utils/request' // 导入封装的 axios 方法
import { Search } from '@element-plus/icons-vue'

const searchText = ref('')
const dialogVisible = ref(false)
const fileQueue = ref([])
const previewContent = ref(null)
const previewType = ref('')
const previewFileId = ref(null)
const selectedKnow = ref('IT')
const totals = ref(100)
const isDelete = ref(true)
const isUpload = ref(true)
const currentPage = ref(1)
const pageSize = ref(100)
const knowOptions = ref([
  // {
  //   value: 'IT',
  //   label: 'IT知识库'
  // },
  // {
  //   value: 'HR',
  //   label: '人资行政知识库'
  // }
])

// 常量定义
const allowedFileTypes = '.doc,.docx,.txt,.pdf'
const activeIndex = ref(0)
const nameSort = ref(false)
const timeSort = ref(false)
const sizeSort = ref(false)
const isDragOver = ref(false)
const clearData = () => {
  searchText.value = ''
  getFileList()
}

// 搜索方法
const searchData = () => {
  getFileList()
  // 调用后端接口或其他搜索逻辑
}
const handleSizeChange = val => {
  pageSize.value = val
  getFileList()
  // 这里通常调用API获取新数据
}

const handleCurrentChange = val => {
  currentPage.value = val
  getFileList()
  // 这里通常调用API获取新数据
}
const downloads = url => {
  try {
    // 1. 调用后端接口获取预签名URL
    // 2. 创建隐藏的<a>标签触发下载
    const link = document.createElement('a')
    link.href = url
    link.style.display = 'none'
    // 3. 从URL中提取文件名（可选）
    const fileName = url.split('/').pop().split('?')[0] // 根据实际情况调整
    // 4. 设置下载属性（需配合CORS配置）
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('下载失败:', error)
    // 使用ElementUI的提示组件
    ElMessage.error('文件下载失败')
  }
}
const downloadFile = async val => {
  let id = ''
  for (var i = 0; i < fileQueue.value.length; i++) {
    if (val.name === fileQueue.value[i].fileName) {
      id = fileQueue.value[i].id
    }
  }
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  request
    .post(`/Files/getDownloadUrl?fileId=${id}&userId=${userInfo.id}`)
    .then(res => {
      if (res.status) {
        downloads(res.data)
      }
    })
    .catch(err => {
      console.error(err)
    })
}
const deleteData = id => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  let idList = []
  idList.push(id)
  request
    .post('/Files/knowledgeFileDelete', {
      file: idList,
      userId: userInfo.id,
      target: selectedKnow.value,
      isPublic: true
    })
    .then(res => {
      if (res.status) {
        getFileList()
      } else {
        ElMessage.error(res.message)
      }
    })
    .catch(err => {
      ElMessage.error({
        message: '删除失败,请稍后再试',
        duration: 3000 // 显示3秒
      })
      console.error(err)
    })
}
// 新增删除处理函数
const handleDelete = (index, event) => {
  event?.stopPropagation() // 阻止事件冒泡
  const deletedFile = fileQueue.value[index]
  const id = deletedFile.id
  // 强制 DOM 更新（关键修复）
  fileQueue.value.splice(index, 1)
  nextTick(() => {
    deleteData(id)
  })
}

const handleSearch = debounce(() => {}, 500)
const checkFileSize = file => {
  const isLt10M = file.size / 1024 / 1024 < 50
  if (!isLt10M) {
    ElMessage.warning('附件大小不能超过50MB!')
  }
  return isLt10M
}
// 新增独立上传队列（网页[5]思路扩展）
let uploadPromises = [] // 存储所有上传Promise
const startAutoUpload = async () => {
  try {
    uploadPromises = fileQueue.value.filter(f => f.status === 'pending').map(file => uploadSingleFile(file))
    // 等待全部完成（网页[7]）
    await Promise.all(uploadPromises)
    // 全部成功后刷新列表
    getFileList()
    // 清空队列
    // fileQueue.value = []
  } catch (error) {
    console.error('批量上传失败', error)
  }
}
const uploadSingleFile = async file => {
  return new Promise((resolve, reject) => {
    previewFileId.value = file.uid
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const formData = new FormData()
    console.log(file.raw)
    formData.append('file', file.raw)
    formData.append('userId', userInfo.id)
    formData.append('target', selectedKnow.value)
    formData.append('isPublic', true)
    console.log(formData)
    axios
      .post(import.meta.env.VITE_API_BASE_URL + '/Files/knowledgeFileUpload', formData, {
        onUploadProgress: progress => {
          file.progress = Math.round((progress.loaded / progress.total) * 100)
        }
      })
      .then(res => {
        if (res.data.status) {
          file.status = 'success'
          resolve()
        } else {
          ElMessage.error(res.data.message)
          file.status = 'error'
          getFileList()
          reject(err)
        }
      })
  })
}
const uploadTimer = ref(null)
// 附件添加处理
const handleFileAdd = async uploadFile => {
  if (uploadFile.size / 1024 / 1024 > 50) {
    ElMessage.warning('附件大小不能超过50MB!')
    return
  }
  const file = {
    ...uploadFile,
    uid: uploadFile.uid,
    status: 'pending', // 新增状态字段
    fileSize: uploadFile.size,
    fileName: uploadFile.name
  }
  fileQueue.value = [file, ...fileQueue.value]
  // 自动触发上传（网页[5]防抖优化）
  clearTimeout(uploadTimer.value)
  uploadTimer.value = setTimeout(startAutoUpload, 300)
}

const fileInfo = ref({})

const changeType = val => {
  activeIndex.value = val
  const hasPending = fileQueue.value.some(item => item.status === 'pending')
  if (val === 1) {
    nameSort.value = !nameSort.value
  } else if (val === 0) {
    timeSort.value = !timeSort.value
  } else if (val === 2) {
    sizeSort.value = !sizeSort.value
  }
  if (hasPending) {
    // sortFiles(val)
    fileQueue.value = sortFiles(val)
    return
  }
  getFileList()
}
const total = ref(0)
const totalSize = ref(0)
const point = ref('KB')
const getInfo = val => {
  total.value = fileQueue.value.length
  let size = 0
  for (var i = 0; i < fileQueue.value.length; i++) {
    size = size + fileQueue.value[i].fileSize
  }
  if (size / 1024 < 1024) {
    point.value = 'KB'
    totalSize.value = (size / 1024).toFixed(1)
  } else {
    point.value = 'MB'
    totalSize.value = (size / 1024 / 1024).toFixed(1)
  }
}
const checkKnow = val => {
  if (val === 1) {
    getFileList(selectedKnow.value, false)
  } else {
    getFileList(selectedKnow.value, true)
  }
}
const getFileList = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  request
    .post(
      '/Files/getFileInfoFromSystem?userId=' +
        userInfo.id +
        '&target=' +
        selectedKnow.value +
        '&page=' +
        currentPage.value +
        '&size=' +
        pageSize.value +
        '&keyword=' +
        searchText.value
    )
    .then(res => {
      if (res.status) {
        isDragOver.value = false
        fileQueue.value = res.data.content
        totals.value = res.data.totalElements
        getInfo()
      } else {
        isDragOver.value = false
        fileQueue.value = []
        ElMessage.error(res.message)
      }
    })
    .catch(err => {
      isDragOver.value = false
      fileQueue.value = []
      ElMessage.error(err)
      console.error(err)
    })
}
const openFile = (val, ary) => {
  dialogVisible.value = true
  knowOptions.value = []
  nextTick(() => {
    let powerList = JSON.parse(localStorage.getItem('powerList'))
    if (!powerList || powerList.length === 0) {
      powerList = [
        {
          target: 'IT',
          delete: false,
          upload: false
        },
        {
          target: 'HR',
          delete: false,
          upload: false
        }
      ]
    }

    let str = ''
    for (var i = 0; i < powerList.length; i++) {
      str += powerList[i].target + ','
    }
    str = str.substring(0, str.length - 1)
    const newAry = str.split(',')
    for (var i = 0; i < newAry.length; i++) {
      const obj = {
        value: '',
        label: '',
        isDelete: false,
        isUpload: false
      }
      obj.value = newAry[i]
      obj.isDelete = powerList[i].delete
      obj.isUpload = powerList[i].upload
      obj.label =
        newAry[i] === 'IT'
          ? 'IT知识库'
          : newAry[i] === 'HR'
            ? '人资行政知识库'
            : newAry[i] === 'Law'
              ? '法务知识库'
              : '热传知识库'
      knowOptions.value.push(obj)
    }
    isDelete.value = powerList[0].delete
    isUpload.value = powerList[0].upload
    selectedKnow.value = newAry[0]

    getFileList()
  })
}

const getKnow = val => {
  selectedKnow.value = val.target
  isUpload.value = val.upload
  isDelete.value = val.delete
  getFileList(selectedKnow.value)
}
const handleDragOver = () => {
  if (!isUpload.value) {
    return
  }

  isDragOver.value = true
}

const handleDragLeave = () => {
  if (!isUpload.value) {
    return
  }
  isDragOver.value = false
}
const handleDrop = e => {
  if (!isUpload.value) {
    return
  }
  const files = Array.from(e.dataTransfer.files)
  const exception = getTextAfterLastDot(files[0].name)
  if (
    exception !== 'txt' &&
    exception !== 'doc' &&
    exception !== 'docx' &&
    exception !== 'ppt' &&
    exception !== 'pptx' &&
    exception !== 'xls' &&
    exception !== 'xlsx' &&
    exception !== 'pdf'
  ) {
    isDragOver.value = false
    ElMessage.warning('暂不支持此格式上传')
    return
  }
  const data = {
    name: files[0].name,
    percentage: 0,
    size: files[0].size,
    status: 'ready',
    raw: files[0]
  }
  handleFileAdd(data)
}
const getTextAfterLastDot = str => {
  const lastDotIndex = str.lastIndexOf('.')
  if (lastDotIndex === -1) return '' // 没有点号时返回空字符串
  return str.slice(lastDotIndex + 1)
}
const getFile = fileObj => {
  window.open('http://files.luxshare-tech.com:8081/MajorFun/viewer?d=' + fileObj.id, '_blank')
  // 使用 POST 请求（与后端 @PostMapping 匹配）
}
// 组件挂载时订阅事件
onMounted(() => {
  eventBus.on('changeKnow', getKnow)

  let powerList = JSON.parse(localStorage.getItem('powerList'))
  isUpload.value = powerList[0].upload
  isDelete.value = powerList[0].delete
  getFileList()
  //   openFile()
})
watch(
  selectedKnow,
  newVal => {
    if (localStorage.getItem('powerList')) {
      let powerList = JSON.parse(localStorage.getItem('powerList'))
      if (!powerList || powerList.length === 0) {
        powerList = [
          {
            target: 'IT',
            delete: false,
            upload: false
          },
          {
            target: 'HR',
            delete: false,
            upload: false
          }
        ]
      }
      for (var i = 0; i < powerList.length; i++) {
        if (powerList[i].target === newVal) {
          isDelete.value = powerList[i].delete
          isUpload.value = powerList[i].upload
        }
      }
    }
  },
  {
    deep: true,
    immediate: true
  }
)
defineExpose({ openFile })
</script>

<style scoped lang="less">
/* 上传中状态样式 */
.uploading-file {
  background: rgba(0, 0, 0, 0.5) !important; /* 轨道背景颜色 */
  /* 可添加加载动画 */
  position: relative;
  color: rgba(0, 0, 0, 0.1) !important;
  div {
    color: rgba(0, 0, 0, 0.1) !important;
  }
}
.uploading-file::after {
  content: '上传中...';
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #fff;
}
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
  margin-bottom: 5px;
}

.upload-layout {
  display: flex;
  height: 100%;
  gap: 20px;
  :deep(.el-upload-dragger) {
    border: none !important;
    padding: 0px;
  }
}
.upload-layout.drag-over {
  border-color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}
.file-list {
  width: calc(100% - 80px);
  margin-left: 80px;
  height: 100%;

  overflow-y: hidden;
  display: flex;
  position: relative;
  flex-direction: column;
  .file_item {
    height: calc(100% - 240px);
    overflow-y: auto;
    margin-top: 170px;
    float: left;
  }
  .file_item::-webkit-scrollbar {
    width: 1px; /* 滚动条宽度 */
  }
  .file_item::-webkit-scrollbar-track {
    background: #fff; /* 轨道背景颜色 */
    border-radius: 0px; /* 轨道圆角 */
  }
  .file_item::-webkit-scrollbar-thumb {
    background: #fff; /* 轨道背景颜色 */
    border-radius: 0px; /* 滑块圆角 */
    border: 1px solid #fff; /* 滑块边框 */
  }
  .file_item::-webkit-scrollbar-thumb:hover {
    background: #fff; /* 滑块悬停时的颜色 */
  }
  .file_search {
    margin-left: 15px;
    position: absolute;
    top: 10px;
    display: flex;
    width: calc(100% - 30px);
    .file_left {
      display: flex;
      flex-direction: row;
      flex: 1;
      min-width: 250px;
      margin-top: 15px;
      .file_upload {
        width: 120px;
        height: 32px;
        line-height: 32px;
        border-radius: 16px;
        background: #fff;
        border: 1px solid #1b6cff;
        text-align: center;
        margin-right: 15px;
        font-size: 12px;
        color: #1b6cff;
        cursor: pointer;
      }
      .file_content {
        display: flex;
        .file_select {
          color: #333333;
          font-size: 16px;
          line-height: 33px;
          min-width: 200px;
        }

        .file_info {
          font-size: 12px;
          color: #868686;
          line-height: 30px;
          padding-top: 5px;
        }
      }
    }
    .file_right {
      display: flex;
      flex-direction: row-reverse;
      flex: 1;
      margin-right: 40px;
      margin-top: 15px;
      .file_content {
        display: flex;
        flex-direction: column;
        :deep(.el-input__wrapper) {
          width: 233px;
          box-shadow: none;
          height: 32px;
          box-sizing: border-box;
          border: 1px solid #bebebe;
        }
        .active {
          display: flex;
          margin-top: 5px;
          .active_item {
            width: 82px;
            height: 30px;
            text-align: center;
            line-height: 30px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            position: relative;
            text-indent: -4px;
            img {
              position: absolute;
              right: 3px;
              top: 8px;
              width: 16px;
              height: 16px;
            }
          }
        }
      }
    }
  }
  .upload_list {
    width: calc(100% - 70px);
    margin-left: 15px;
    position: absolute;
    top: 82px;
  }
}

.file-item {
  margin-bottom: 10px;
  border-radius: 6px;
  background: #f5f7fa;
  transition: all 0.3s;
  width: 15%;
  float: left;
  margin-left: 14px;
  background-color: #fff;
  // border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 80px;
  box-sizing: border-box;
  overflow-x: hidden;
  font-size: 12px;
  cursor: pointer;
  .file_img {
    width: 30px;
    height: 37px;
    margin-top: 4px;

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
  margin-top: 8px;
  display: flex;
}

.fileName {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
  font-size: 12px;
  max-width: 100px;
  padding-top: 4px;
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
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  width: calc(50% - 20px);
  .file_text {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding-left: 15px;
    justify-content: center;
    .text_title {
      font-size: 16px;
      color: #333333;
      line-height: 30px;
      max-width: 330px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .close_pre {
      position: absolute;
      right: 15px;
      top: 18px;
      width: 100px;
      height: 30px;
      border: 1px solid #1b6cff;
      border-radius: 16px;
      color: #1b6cff;
      line-height: 30px;
      text-align: center;
      font-size: 14px;
      cursor: pointer;
    }
    .text_list {
      display: flex;
      font-size: 12px;
      color: #868686;
    }
  }
  .btn_download {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    .download {
      background-color: #1b6cff;
      text-align: center;
      height: 40px;
      line-height: 40px;
      width: 94%;
      color: #fff;
      font-size: 16px;
      border-radius: 4px;
      cursor: pointer;
    }
  }
}

.preview-container {
  height: calc(100% - 100px);
  border-radius: 4px;
  margin: 0 15px 15px 15px;
  overflow-y: auto;
  background-color: #f8f9fb;
  max-height: 560px;
  /* 屏幕宽度 ≤600px 时文字变红 */
  @media (max-height: 800px) {
    max-height: 560px;
  }
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
::v-deep .custom-upload-dialog {
  overflow-y: hidden;
  .el-dialog {
    height: 100vh !important;
    margin: 0 !important;
    overflow-y: hidden;
    .el-dialog__body {
      height: calc(100vh - 120px); // 减去头部和底部高度
      overflow-y: hidden;
    }
  }
}
</style>
