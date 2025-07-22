<template>
  <el-dialog
    v-model="dialogVisible"
    title="文件知识库"
    width="1280px"
    class="upload-modal"
    @close="handleClose"
  >
    <!-- 主容器 - 使用 Flexbox 布局 -->
    <div class="upload-container">
      <!-- 左侧文件列表区域 -->
      <div class="file-section" :class="{ 'full-width': !showPreview }">
        <!-- 头部信息区 -->
        <header class="file-header">
          <div class="header-left">
            <div class="knowledge-selector" v-if="isPower">
              <el-select v-model="selectedKnow" placeholder="请选择知识库" @change="handleKnowledgeChange">
                <el-option 
                  v-for="item in knowledgeOptions" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value" 
                />
              </el-select>
            </div>
            <div class="knowledge-title" v-else>个人知识库</div>
            
            <div class="file-stats">
              <span class="stats-item">共 {{ total }} 项</span>
              <span class="stats-item">存储空间: 已使用 {{ totalSize }}{{ sizeUnit }}</span>
            </div>
          </div>
          
          <div class="header-right">
            <div class="search-container">
              <el-input
                v-model="searchText"
                placeholder="请点击搜索图标或按Enter键"
                clearable
                @clear="clearSearch"
                @keydown.enter.prevent="handleSearch"
                class="search-input"
              >
                <template #prefix>
                  <el-icon class="search-icon" @click="handleSearch">
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </div>
            
            <!-- 排序选项 -->
            <div class="sort-options">
              <button 
                class="sort-btn"
                :class="{ active: activeSort === 'time' }"
                @click="handleSort('time')"
              >
                上传时间
                <el-icon class="sort-icon">
                  <component :is="getSortIcon('time')" />
                </el-icon>
              </button>
              
              <button 
                class="sort-btn"
                :class="{ active: activeSort === 'name' }"
                @click="handleSort('name')"
              >
                文件名称
                <el-icon class="sort-icon">
                  <component :is="getSortIcon('name')" />
                </el-icon>
              </button>
              
              <button 
                class="sort-btn"
                :class="{ active: activeSort === 'size' }"
                @click="handleSort('size')"
              >
                文件大小
                <el-icon class="sort-icon">
                  <component :is="getSortIcon('size')" />
                </el-icon>
              </button>
            </div>
          </div>
        </header>
        
        <!-- 已选择文件栏 -->
        <div class="selected-files" v-if="selectedFiles.length > 0">
          <div class="selected-info">
            <span class="selected-count">已选择: {{ selectedFiles.length }} 个文件</span>
          </div>
          
          <div class="selected-list">
            <div 
              v-for="file in selectedFiles" 
              :key="file.id"
              class="selected-item"
            >
              <span class="file-name">{{ file.name }}</span>
              <el-icon class="remove-icon" @click="removeSelectedFile(file.id)">
                <Close />
              </el-icon>
            </div>
          </div>
        </div>
        
        <!-- 文件列表区域 -->
        <div class="file-list-container">
          <div 
            v-if="fileList.length === 0" 
            class="empty-state"
          >
            <el-empty description="暂无文件" />
          </div>
          
          <div v-else class="file-grid">
            <div 
              v-for="file in paginatedFiles" 
              :key="file.id"
              class="file-item"
              :class="{ 
                'selected': isFileSelected(file.id),
                'uploading': file.status === 'uploading'
              }"
              @click="toggleFileSelection(file)"
            >
              <!-- 文件图标 -->
              <div class="file-icon">
                <img :src="getFileIcon(file.name)" :alt="file.type" />
              </div>
              
              <!-- 文件信息 -->
              <div class="file-info">
                <div class="file-name" :title="file.name">{{ file.name }}</div>
                <div class="file-meta">
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  <span class="file-date">{{ formatDate(file.uploadTime) }}</span>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div class="file-actions">
                <el-button 
                  type="text" 
                  size="small"
                  @click.stop="previewFile(file)"
                >
                  预览
                </el-button>
                <el-button 
                  type="text" 
                  size="small"
                  @click.stop="downloadFile(file)"
                >
                  下载
                </el-button>
                <el-button 
                  type="text" 
                  size="small"
                  class="danger"
                  @click.stop="deleteFile(file)"
                >
                  删除
                </el-button>
              </div>
              
              <!-- 上传进度 -->
              <div v-if="file.status === 'uploading'" class="upload-progress">
                <el-progress 
                  :percentage="file.progress" 
                  :stroke-width="2"
                  :show-text="false"
                />
              </div>
              
              <!-- 选择状态指示器 -->
              <div v-if="isFileSelected(file.id)" class="selection-indicator">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>
          
          <!-- 分页 -->
          <div class="pagination-container" v-if="fileList.length > pageSize">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="filteredFiles.length"
              layout="prev, pager, next, jumper"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
      
      <!-- 右侧预览区域 -->
      <div class="preview-section" v-if="showPreview">
        <div class="preview-header">
          <h3>文件预览</h3>
          <el-button type="text" @click="closePreview">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        
        <div class="preview-content">
          <FilePreview :file="previewFile" />
        </div>
      </div>
    </div>
    
    <!-- 底部操作区 -->
    <template #footer>
      <div class="modal-footer">
        <div class="footer-left">
          <el-upload
            ref="uploadRef"
            multiple
            :show-file-list="false"
            :before-upload="handleBeforeUpload"
            :on-change="handleFileChange"
            :accept="acceptedFileTypes"
            class="upload-btn"
          >
            <el-button type="primary" :loading="uploadLoading">
              <el-icon><Upload /></el-icon>
              上传文件
            </el-button>
          </el-upload>
        </div>
        
        <div class="footer-right">
          <el-button @click="handleCancel">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleConfirm"
            :disabled="selectedFiles.length === 0"
          >
            确定 ({{ selectedFiles.length }})
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Close, Check, Upload, ArrowUp, ArrowDown, Sort } from '@element-plus/icons-vue'
import { useFileUpload } from '../composables/useFileUpload'
import { 
  getFileIcon, 
  formatFileSize, 
  validateFile 
} from '@/utilsnew/utils/fileHelpers'
import { cleanupOnUnmount } from '@/utilsnew/utils/memoryHelpers'
import { FILE_CONFIG } from '../config/constants'
import FilePreview from './FilePreview.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  isPower: {
    type: Boolean,
    default: false
  },
  knowledgeOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// Composables
const { uploadFile, uploadFiles } = useFileUpload()

// 响应式数据
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const selectedKnow = ref('')
const searchText = ref('')
const fileList = ref([])
const selectedFiles = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const uploadLoading = ref(false)
const showPreview = ref(false)
const previewFile = ref(null)

// 排序相关
const activeSort = ref('time')
const sortOrder = ref('desc') // 'asc' | 'desc'

// 统计数据
const total = computed(() => fileList.value.length)
const totalSize = computed(() => {
  const bytes = fileList.value.reduce((sum, file) => sum + file.size, 0)
  return formatFileSize(bytes)
})
const sizeUnit = computed(() => totalSize.value.includes('MB') ? '' : '')

// 文件过滤和排序
const filteredFiles = computed(() => {
  let filtered = fileList.value

  // 搜索过滤
  if (searchText.value) {
    const query = searchText.value.toLowerCase()
    filtered = filtered.filter(file => 
      file.name.toLowerCase().includes(query)
    )
  }

  // 排序
  filtered.sort((a, b) => {
    let comparison = 0
    
    switch (activeSort.value) {
      case 'time':
        comparison = new Date(a.uploadTime) - new Date(b.uploadTime)
        break
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'size':
        comparison = a.size - b.size
        break
    }
    
    return sortOrder.value === 'desc' ? -comparison : comparison
  })

  return filtered
})

// 分页数据
const paginatedFiles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredFiles.value.slice(start, end)
})

const acceptedFileTypes = computed(() => FILE_CONFIG.ALLOWED_EXTENSIONS.join(','))

// 方法
const handleKnowledgeChange = (value) => {
  // 切换知识库时重新加载文件列表
  loadFileList()
}

const clearSearch = () => {
  searchText.value = ''
}

const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
}

const handleSort = (type) => {
  if (activeSort.value === type) {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    activeSort.value = type
    sortOrder.value = 'desc'
  }
  currentPage.value = 1
}

const getSortIcon = (type) => {
  if (activeSort.value !== type) return Sort
  return sortOrder.value === 'desc' ? ArrowDown : ArrowUp
}

const isFileSelected = (fileId) => {
  return selectedFiles.value.some(file => file.id === fileId)
}

const toggleFileSelection = (file) => {
  const index = selectedFiles.value.findIndex(f => f.id === file.id)
  if (index > -1) {
    selectedFiles.value.splice(index, 1)
  } else {
    selectedFiles.value.push(file)
  }
}

const removeSelectedFile = (fileId) => {
  const index = selectedFiles.value.findIndex(f => f.id === fileId)
  if (index > -1) {
    selectedFiles.value.splice(index, 1)
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const previewFile = (file) => {
  previewFile.value = file
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
  previewFile.value = null
}

const downloadFile = async (file) => {
  try {
    // 实现文件下载逻辑
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const deleteFile = async (file) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 "${file.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 实现删除逻辑
    const index = fileList.value.findIndex(f => f.id === file.id)
    if (index > -1) {
      fileList.value.splice(index, 1)
    }
    
    // 从选中列表中移除
    removeSelectedFile(file.id)
    
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

const handleBeforeUpload = (file) => {
  const validation = validateFile(file, {
    maxSize: FILE_CONFIG.MAX_SIZE_BYTES,
    allowedTypes: FILE_CONFIG.ALLOWED_EXTENSIONS
  })
  
  if (!validation.isValid) {
    ElMessage.error(validation.error)
    return false
  }
  
  return true
}

const handleFileChange = async (file) => {
  if (!handleBeforeUpload(file.raw)) return
  
  uploadLoading.value = true
  
  try {
    const result = await uploadFile(file.raw, {
      onProgress: (progress) => {
        file.progress = progress
      }
    })
    
    // 添加到文件列表
    const newFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.raw.type,
      uploadTime: new Date().toISOString(),
      url: result.url,
      status: 'success'
    }
    
    fileList.value.unshift(newFile)
    ElMessage.success('上传成功')
  } catch (error) {
    ElMessage.error('上传失败：' + error.message)
  } finally {
    uploadLoading.value = false
  }
}

const loadFileList = async () => {
  // 实现加载文件列表的逻辑
  // 这里应该从服务端获取数据
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleConfirm = () => {
  emit('confirm', selectedFiles.value)
  handleClose()
}

const handleCancel = () => {
  emit('cancel')
  handleClose()
}

const handleClose = () => {
  selectedFiles.value = []
  showPreview.value = false
  previewFile.value = null
  dialogVisible.value = false
}

// 生命周期
onMounted(() => {
  loadFileList()
})

onUnmounted(() => {
  cleanupOnUnmount()
})
</script>

<style lang="less" scoped>
.upload-modal {
  .upload-container {
    display: flex;
    height: 70vh;
    gap: 20px;
  }
  
  .file-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0; // 防止 flex 子项溢出
    
    &.full-width {
      flex: none;
      width: 100%;
    }
  }
  
  .file-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    gap: 20px;
    
    .header-left {
      flex-shrink: 0;
      
      .knowledge-selector {
        margin-bottom: 12px;
      }
      
      .knowledge-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 12px;
        color: #333;
      }
      
      .file-stats {
        display: flex;
        gap: 16px;
        font-size: 14px;
        color: #666;
        
        .stats-item {
          white-space: nowrap;
        }
      }
    }
    
    .header-right {
      flex: 1;
      max-width: 600px;
      
      .search-container {
        margin-bottom: 12px;
        
        .search-input {
          .search-icon {
            cursor: pointer;
            color: #409eff;
            
            &:hover {
              color: #1b6cff;
            }
          }
        }
      }
      
      .sort-options {
        display: flex;
        gap: 8px;
        
        .sort-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          border: 1px solid #dcdfe6;
          border-radius: 6px;
          background: #fff;
          color: #606266;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            border-color: #1b6cff;
            color: #1b6cff;
          }
          
          &.active {
            border-color: #1b6cff;
            background-color: #e6f4ff;
            color: #1b6cff;
          }
          
          .sort-icon {
            font-size: 14px;
          }
        }
      }
    }
  }
  
  .selected-files {
    background: #f8fafc;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
    
    .selected-info {
      font-size: 14px;
      color: #1b6cff;
      margin-bottom: 8px;
    }
    
    .selected-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .selected-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        background: #1b6cff;
        color: #fff;
        border-radius: 4px;
        font-size: 12px;
        
        .file-name {
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .remove-icon {
          cursor: pointer;
          opacity: 0.8;
          
          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }
  
  .file-list-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  
  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .file-grid {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
    
    .file-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #1b6cff;
        box-shadow: 0 2px 8px rgba(27, 108, 255, 0.15);
      }
      
      &.selected {
        border-color: #1b6cff;
        background-color: #e6f4ff;
      }
      
      &.uploading {
        opacity: 0.6;
        pointer-events: none;
      }
      
      .file-icon {
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
      
      .file-info {
        flex: 1;
        min-width: 0;
        
        .file-name {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 4px;
        }
        
        .file-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #999;
          
          span {
            white-space: nowrap;
          }
        }
      }
      
      .file-actions {
        display: flex;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.3s ease;
        
        .el-button {
          padding: 4px 8px;
          font-size: 12px;
          
          &.danger {
            color: #f56c6c;
            
            &:hover {
              color: #f24c4c;
              background-color: rgba(245, 108, 108, 0.1);
            }
          }
        }
      }
      
      &:hover .file-actions {
        opacity: 1;
      }
      
      .upload-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
      }
      
      .selection-indicator {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 20px;
        height: 20px;
        background: #1b6cff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 12px;
      }
    }
  }
  
  .pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: center;
  }
  
  .preview-section {
    width: 500px;
    flex-shrink: 0;
    border-left: 1px solid #e4e7ed;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h3 {
        margin: 0;
        font-size: 16px;
        color: #333;
      }
    }
    
    .preview-content {
      flex: 1;
      background: #f8fafc;
      border-radius: 8px;
      overflow: hidden;
    }
  }
  
  .modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .footer-left {
      .upload-btn {
        :deep(.el-upload) {
          display: inline-block;
        }
      }
    }
    
    .footer-right {
      display: flex;
      gap: 12px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .upload-modal {
    .upload-container {
      flex-direction: column;
      height: auto;
    }
    
    .file-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }
    
    .preview-section {
      width: 100%;
      border-left: none;
      border-top: 1px solid #e4e7ed;
      padding-left: 0;
      padding-top: 20px;
    }
    
    .modal-footer {
      flex-direction: column;
      gap: 12px;
      
      .footer-left,
      .footer-right {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style> 