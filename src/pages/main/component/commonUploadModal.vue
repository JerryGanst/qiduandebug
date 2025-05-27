<template>
  <el-dialog
    v-model="dialogVisible"
    title="公共知识库"
    width="100%"
    height="100%"
    class="custom-upload-dialog"
    style="height: 100%; margin: 0px; border-radius: 0px"
  >
    <div class="upload-layout">
      <!-- 左侧附件列表 -->
      <div class="file-list" style="width: 100%">
        <div class="file_search">
          <div class="file_left">
            <div class="file_content">
              <div class="file_select">
                <el-select v-model="selectedKnow" placeholder="请选择部门知识库" @change="checkKnow">
                  <el-option v-for="item in knowOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </div>

              <div class="file_info" style="margin-left: 10px">
                <span>共{{ total }}项</span>
              </div>
            </div>
          </div>
          <div class="file_right">
            <div class="file_content">
              <!-- <el-input v-model="searchText" :prefix-icon="Search" placeholder="请输入关键词搜索" clearable /> -->
              <el-input v-model="searchText" placeholder="请输入关键字" @input="handleSearch">
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
        <div class="upload_list">
          <el-upload
            v-if="isUpload"
            drag
            :auto-upload="false"
            :multiple="true"
            :accept="allowedFileTypes"
            :on-change="handleFileAdd"
            :show-file-list="false"
            :file-list="fileQueue"
            :before-upload="checkFileSize"
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">
              拖拽附件到此或
              <em>点击上传</em>
              <div class="el-upload__subtext">
                <span style="color: #868686">支持格式：{{ allowedFileTypes }}</span>
              </div>
              <div class="el-upload__subtext">
                <span style="color: #868686">单个大小不超过50M</span>
              </div>
              <!-- <div class="el-upload__subtext">
                <span style="color: #868686">上传成功后文件将会被转为PDF</span>
              </div> -->
            </div>
          </el-upload>
        </div>
        <div
          class="file_item"
          :style="{
            marginTop: isUpload ? '170px' : '60px',
            height: isUpload ? 'calc(100% - 180px)' : 'calc(100% - 70px)'
          }"
        >
          <div
            v-for="(file, index) in filteredList"
            :key="file.uid"
            class="file-item"
            :class="{ 'uploading-file': file.status === 'pending' }"
            @click="getFile(file)"
            style="position: relative; width: 8%; margin-left: 13px"
          >
            <div class="file_img">
              <img :src="file.fileType === 'txt' ? text : file.fileType === 'pdf' ? pdf : word" />
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
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import axios from 'axios'
import mammoth from 'mammoth'
import { debounce } from 'lodash-es'
import { useShared } from '@/utils/useShared'
import eventBus from '@/utils/eventBus'
import word from '@/assets/w.png'
import text from '@/assets/text.png'
import pdf from '@/assets/pdf.png'
import down from '@/assets/arrow_up.png'
import up from '@/assets/arrow_down.png'
import sort from '@/assets/sort.png'
import { ElMessage } from 'element-plus' // 引入 ElMessage
import request from '@/utils/request' // 导入封装的 axios 方法
import { Search } from '@element-plus/icons-vue'

const searchText = ref('')
const dialogVisible = ref(false)
const fileQueue = ref([])
const previewContent = ref(null)
const previewType = ref('')
const previewFileId = ref(null)
const selectedKnow = ref('IT')
const isDelete = ref(true)
const isUpload = ref(true)
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

const clearData = () => {
  searchText.value = ''
  getFileList()
}
// 搜索方法
const searchData = () => {
  getFileList()
  // 调用后端接口或其他搜索逻辑
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
      console.log(res)
      if (res.status) {
        getFileList()
      } else {
        console.log(res)
        ElMessage.error(res.message)
      }
    })
    .catch(err => {
      console.log(err)
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
// 过滤后的列表
const filteredList = computed(() => {
  if (!searchText.value) {
    return fileQueue.value
  }

  const searchLower = searchText.value.toLowerCase()
  return fileQueue.value.filter(item => item.fileName.toLowerCase().includes(searchLower))
})

const handleSearch = debounce(() => {
  console.log('防抖搜索:', searchText.value)
}, 500)
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
    formData.append('file', file.raw)
    formData.append('userId', userInfo.id)
    formData.append('target', selectedKnow.value)
    formData.append('isPublic', true)
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
// 附件预览处理
const handlePreview = async file => {
  if (!file) {
    return
  }
  const exception = getTextAfterLastDot(file.name)
  try {
    fileInfo.value = file
    if (['txt'].includes(exception)) {
      // 处理文本附件
      const reader = new FileReader()
      reader.onload = e => {
        previewContent.value = e.target.result
        previewType.value = 'text'
      }

      reader.readAsText(file.raw)
    } else if (['docx', 'doc'].includes(exception)) {
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
    } else if (['pdf'].includes(exception)) {
      // 生成PDF的Blob URL并预览
      const pdfUrl = URL.createObjectURL(file.raw)
      previewContent.value = pdfUrl
      previewType.value = 'pdf'

      // 在组件销毁或关闭预览时记得释放URL
      // 例如在onUnmounted或关闭弹窗的方法中调用 URL.revokeObjectURL(pdfUrl)
    } else {
      previewContent.value = '不支持此附件预览'
      previewType.value = 'unsupported'
    }
  } catch (error) {
    console.error('预览失败:', error)
    previewContent.value = '附件预览失败'
    previewType.value = 'error'
  }
}

const sortFiles = val => {
  const type = val === 0 ? 'time' : val === 1 ? 'name' : 'size'
  const isUp = val === 0 ? timeSort.value : val === 1 ? nameSort.value : sizeSort.value
  const data = JSON.parse(JSON.stringify(fileQueue.value))
  return data.slice().sort((a, b) => {
    // 1. 分离 pending 与非 pending 项
    const aIsPending = a.status === 'pending'
    const bIsPending = b.status === 'pending'

    // pending项始终在前，且不参与后续排序[6](@ref)
    if (aIsPending && !bIsPending) return -1
    if (!aIsPending && bIsPending) return 1
    if (aIsPending && bIsPending) return 0 // 两pending项保持原顺序
    // 2. 非 pending 项按 type 和 sort 排序
    let compareValue
    switch (type) {
      case 'time':
        if (isUp) {
          compareValue = new Date(a.createTime) - new Date(b.createTime) // 时间戳比较[3](@ref)
        } else {
          compareValue = new Date(b.createTime) - new Date(a.createTime) // 时间戳比较[3](@ref)
        }

        break
      case 'size':
        if (isUp) {
          compareValue = a.fileSize - b.fileSize // 数值比较[2,5](@ref)
        } else {
          compareValue = b.fileSize - a.fileSize // 数值比较[2,5](@ref)
        }
        break
      case 'name':
        if (isUp) {
          compareValue = a.fileName.localeCompare(b.fileName, 'zh') // 数值比较[2,5](@ref)
        } else {
          compareValue = b.fileName.localeCompare(a.fileName, 'zh') // 数值比较[2,5](@ref)
        }
        break
      default:
        compareValue = 0
    }

    // 3. 根据 sort 控制方向[1,4](@ref)
    return compareValue
  })
}

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
    .post('/Files/getFileInfoFromSystem?userId=' + userInfo.id + '&target=' + selectedKnow.value)
    .then(res => {
      console.log(res)
      if (res.status) {
        fileQueue.value = res.data
        getInfo()
      } else {
        fileQueue.value = []
        ElMessage.error(res.message)
      }
    })
    .catch(err => {
      fileQueue.value = []
      ElMessage.error(err)
      console.error(err)
    })
}
const openFile = (val, ary) => {
  dialogVisible.value = true
  knowOptions.value = []
  const powerList = JSON.parse(localStorage.getItem('powerList'))
  if (powerList && powerList.length > 0) {
    let str = ''
    for (var i = 0; i < powerList.length; i++) {
      str += powerList[i].target + ','
    }
    str = str.substring(0, str.length - 1)
    const ary = str.split(',')
    for (var i = 0; i < ary.length; i++) {
      const obj = {
        value: '',
        label: '',
        isDelete: false,
        isUpload: false
      }
      obj.value = ary[i]
      obj.isDelete = powerList[i].delete
      obj.isUpload = powerList[i].upload
      obj.label =
        ary[i] === 'IT'
          ? 'IT知识库'
          : ary[i] === 'HR'
            ? '人资行政知识库'
            : ary[i] === 'Law'
              ? '法务知识库'
              : '热传知识库'
      knowOptions.value.push(obj)
    }
    selectedKnow.value = ary[0]
    console.log(knowOptions.value)
  }
  getFileList()
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
watch(
  selectedKnow,
  newVal => {
    const powerList = JSON.parse(localStorage.getItem('powerList'))
    for (var i = 0; i < powerList.length; i++) {
      console.log(powerList[i])
      console.log(newVal)
      if (powerList[i].target === newVal) {
        isDelete.value = powerList[i].delete
        isUpload.value = powerList[i].upload
      }
    }
  },
  { deep: true }
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
}

.file-list {
  width: 50%;
  height: calc(100vh - 80px);
  border-radius: 4px;

  overflow-y: hidden;
  padding-right: 15px;
  display: flex;
  position: relative;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  .file_item {
    height: calc(100% - 180px);
    overflow-y: auto;
    margin-top: 170px;
    float: left;
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
      .file_content {
        display: flex;
        flex-direction: column;
        :deep(.el-input__wrapper) {
          width: 210px;
          box-shadow: none;
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
    width: calc(100% - 30px);
    margin-left: 15px;
    position: absolute;
    top: 55px;
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
  height: calc(100% - 140px);
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
