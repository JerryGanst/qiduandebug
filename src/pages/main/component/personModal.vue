<template>
  <div class="upload-layout">
    <!-- 左侧附件列表 -->
    <div class="file-list" :style="{ width: isPre ? '735px' : '100%' }">
      <div class="file_search">
        <div class="file_left">
          <div class="file_content">
            <div class="file_select" v-if="isPower">
              <el-select v-model="selectedKnow" placeholder="请选择知识库" @change="checkKnow">
                <el-option v-for="item in knowOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
            <div class="file_select" v-else>个人知识库</div>

            <div class="file_info">
              <span>共{{ total }}项</span>
              <span style="padding-left: 10px">存储空间 : 已使用{{ totalSize }}{{ point }}</span>
            </div>
          </div>
        </div>
        <div class="file_right">
          <div class="file_content">
            <!-- <el-input v-model="searchText" :prefix-icon="Search" placeholder="请输入关键词搜索" clearable /> -->
            <el-input
              v-model="searchText"
              placeholder="请点击搜索图标或按Enter键"
              clearable
              @clear="clearData"
              @keydown.enter.prevent="searchData"
            >
              <!-- 使用插槽自定义前缀图标并绑定事件 -->
              <template #prefix>
                <el-icon class="el-input__icon" @click="searchData" style="cursor: pointer">
                  <Search />
                </el-icon>
              </template>
            </el-input>
            <div class="active">
              <div
                class="active_item"
                :style="{
                  background: activeIndex === 0 ? '#E6F4FF' : '',
                  color: activeIndex === 0 ? '#1B6CFF' : '#9D9D9D'
                }"
                @click="changeType(0)"
              >
                上传时间
                <img :src="activeIndex === 0 ? (timeSort ? down : up) : sort" />
              </div>
              <div
                class="active_item"
                :style="{
                  background: activeIndex === 1 ? '#E6F4FF' : '',
                  color: activeIndex === 1 ? '#1B6CFF' : '#9D9D9D'
                }"
                @click="changeType(1)"
              >
                文件名称
                <img :src="activeIndex === 1 ? (nameSort ? down : up) : sort" />
              </div>

              <div
                class="active_item"
                :style="{
                  background: activeIndex === 2 ? '#E6F4FF' : '',
                  color: activeIndex === 2 ? '#1B6CFF' : '#9D9D9D'
                }"
                @click="changeType(2)"
              >
                文件大小
                <img :src="activeIndex === 2 ? (sizeSort ? down : up) : sort" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="upload_list">
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
      <div class="file_item">
        <div
          v-for="(file, index) in fileQueue"
          :key="file.uid"
          class="file-item"
          :class="{ 'uploading-file': file.status === 'pending' }"
          @click="getFile(file)"
          style="position: relative"
          :style="{ width: isPre ? '13.5%' : '8.5%', marginLeft: isPre ? '14px' : '13px' }"
        >
          <div class="file_img">
            <img :src="file.fileType === 'txt' ? text : file.fileType === 'pdf' ? pdf : word" />
          </div>
          <div class="originalFileName" :style="{ width: isPre ? '90px' : '70px' }">{{ file.originalFileName }}</div>
          <div style="font-size: 12px; color: #bebebe; margin-top: 2px">
            {{ file.fileSize ? (file.fileSize / 1024).toFixed(1) : 0 }}KB
          </div>
          <el-popconfirm
            title="确定要删除吗？"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="handleDelete(index, $event)"
          >
            <template #reference>
              <span @click.stop>
                <!-- 阻止点击事件冒泡 -->
                <div style="width: 20px; height: 20px; cursor: pointer; position: absolute; right: 4px; top: 4px">
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

    <!-- 右侧上传区域 -->
    <div class="upload-area" v-if="isPre">
      <div class="file_text" v-if="previewFileId" style="position: relative">
        <div class="text_title">{{ fileInfo.name }}</div>
        <div class="text_list">
          <span>大小 : {{ fileInfo.size ? (fileInfo.size / 1024).toFixed(1) : 0 }}KB</span>
          <span style="margin-left: 14px">类型 : {{ fileInfo.extension }}</span>
          <!-- <span style="margin-left: 14px">更新时间 : 2025-05-05</span> -->
        </div>
        <div class="close_pre" @click="closePre">关闭预览</div>
      </div>
      <!-- 附件预览 -->
      <div
        v-if="previewFileId"
        class="preview-container"
        :key="previewFileId"
        style="margin: 15px"
        :style="{ margin: previewFileId ? '0 15px 10px 15px' : '15px' }"
      >
        <div v-if="previewType === 'text'" class="text-preview" style="padding: 0 15px">
          <pre>{{ previewContent }}</pre>
        </div>
        <div v-else-if="previewType === 'html'" class="html-preview" v-html="previewContent"></div>
        <div v-else-if="previewType === 'pdf'">
          <iframe :src="previewContent" frameborder="0" class="pdf-frame"></iframe>
        </div>
        <div v-else class="unsupported-preview">暂不支持此格式预览</div>
      </div>
      <div
        v-else="previewFileId"
        class="preview-container"
        :style="{ margin: previewFileId ? '0 15px 10px 15px' : '15px' }"
      >
        <div style="width: 100%; display: flex; justify-content: center; margin-top: 154px">
          <img src="@/assets/no-file.png" style="width: 150px; height: 150px" />
        </div>
        <div class="unsupported-preview" style="padding: 0px">请先上传附件即可预览</div>
      </div>
      <div class="btn_download">
        <div class="download" @click="downloadFile(fileInfo)">下载</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import axios from 'axios'
import mammoth from 'mammoth'
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
const isPre = ref(false)
const selectedKnow = ref(1)
const isPower = ref(false)
const permission = ref([])
const currentPage = ref(1)
const pageSize = ref(100)
const totals = ref(100)
const knowOptions = ref([
  {
    value: 1,
    label: '个人知识库'
  },
  {
    value: 2,
    label: '公共知识库'
  }
])

// 常量定义
const allowedFileTypes = '.doc,.docx,.txt,.pdf'
const activeIndex = ref(0)
const nameSort = ref(false)
const timeSort = ref(false)
const sizeSort = ref(false)

const closePre = () => {
  isPre.value = false
}

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
    const originalFileName = url.split('/').pop().split('?')[0] // 根据实际情况调整
    // 4. 设置下载属性（需配合CORS配置）
    link.setAttribute('download', originalFileName)
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
    if (val.name === fileQueue.value[i].originalFileName) {
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
      target: permission.value,
      isPublic: selectedKnow.value === 1 ? false : true
    })
    .then(res => {
      if (res.status) {
        getFileList()
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
    isPre.value = false
    deleteData(id)
  })
}

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
    formData.append('target', permission.value)
    formData.append('isPublic', selectedKnow.value === 2 ? true : false)
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
          file.status = 'error'
          ElMessage.error(res.data.message)
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
    originalFileName: uploadFile.name
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
    isPre.value = true
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
          compareValue = a.originalFileName.localeCompare(b.originalFileName, 'zh') // 数值比较[2,5](@ref)
        } else {
          compareValue = b.originalFileName.localeCompare(a.originalFileName, 'zh') // 数值比较[2,5](@ref)
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
  isPre.value = false
  if (val === 1) {
    getFileList(permission.value, false)
  } else {
    getFileList(permission.value, true)
  }
}
const getFileList = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  request
    .post('/Files/getFileListByUserId', {
      userId: userInfo.id,
      target: permission.value,
      isPublic: selectedKnow.value === 1 ? false : true,
      sortType: activeIndex.value === 0 ? 'time' : activeIndex.value === 1 ? 'name' : 'size',
      increase: activeIndex.value === 0 ? timeSort.value : activeIndex.value === 1 ? nameSort.value : sizeSort.value,
      keywords: searchText.value,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    .then(res => {
      if (res.status) {
        fileQueue.value = res.data.content
        totals.value = res.data.totalElements
        getInfo()
      }
    })
    .catch(err => {
      console.error(err)
    })
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
const openFile = (val, ary) => {
  dialogVisible.value = true
  isPre.value = false
  const power = localStorage.getItem('powerList')
  permission.value = power.length > 0 ? power : ''
  // isPower.value = permission.value ? true : false
  isPower.value = false
  getFileList()
}

const getTextAfterLastDot = str => {
  const lastDotIndex = str.lastIndexOf('.')
  if (lastDotIndex === -1) return '' // 没有点号时返回空字符串
  return str.slice(lastDotIndex + 1)
}
const getFile = fileObj => {
  console.log(fileObj)
  // 使用 POST 请求（与后端 @PostMapping 匹配）
  fetch(import.meta.env.VITE_API_BASE_URL + '/Files/knowledgeFileById?id=' + fileObj.id, {
    method: 'POST',
    headers: { Accept: 'application/octet-stream' }, // 明确接收二进制
    responseType: 'blob' // 关键参数
  })
    .then(response => {
      // 从 Content-Disposition 中解析附件名
      const disposition = response.headers.get('Content-Disposition')
      let originalFileName = 'default_filename' // 默认附件名
      if (disposition && disposition.indexOf('filename=') !== -1) {
        originalFileName = disposition.split('filename=')[1].replace(/"/g, '')
      }

      // 获取二进制数据
      return response.blob().then(blob => ({ blob, originalFileName }))
    })
    .then(({ blob, originalFileName }) => {
      // 将 Blob 转换为 File 对象（类似 file.raw）
      const file = new File([blob], originalFileName, { type: blob.type })
      const fileOther = {
        raw: file,
        uid: file.lastModified,
        size: file.size,
        name: decodeURIComponent(fileObj.originalFileName),
        extension: getTextAfterLastDot(fileObj.originalFileName),
        cancel: null,
        source: null
      }
      previewFileId.value = fileOther.uid
      // 此时可以像处理 el-upload 的 file.raw 一样处理 file
      handlePreview(fileOther)
    })
    .catch(error => {
      console.error('获取附件失败:', error)
    })
}
onMounted(() => {
  openFile()
})
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
  height: calc(100vh - 180px);
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
  margin-left: 40px;
  height: calc(100% - 20px);

  overflow-y: hidden;
  margin-right: 40px;
  display: flex;
  position: relative;
  flex-direction: column;
  margin-top: 10px;
  .file_item {
    overflow-y: auto;
    margin-top: 215px;
    height: calc(100% - 260px);
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
      .file_content {
        display: flex;
        flex-direction: column;
        .file_select {
          color: #333333;
          font-size: 16px;
          line-height: 33px;
        }
        .file_info {
          font-size: 12px;
          color: #868686;
          line-height: 30px;
          padding-top: 10px;
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
          width: 160px;
          box-shadow: none;
          border: 1px solid #bebebe;
        }
        .active {
          display: flex;
          margin-top: 10px;
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
    top: 95px;
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
  height: 100px;
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

.originalFileName {
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
  flex: 1;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #dcdfe6;
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
  height: calc(100% - 160px);
  border-radius: 4px;
  margin: 0 15px 15px 15px;
  overflow: auto;
  width: 450px;
  background-color: #f8f9fb;
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
