<template>
  <div id="app" class="app-container">
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { request } from '@/utilsnew/services/request'
import { cleanupOnUnmount, createTimer } from '@/utilsnew/utils/memoryHelpers'

const startTime = ref(null)
const endTime = ref(null)

/**
 * 格式化UTC时间为北京时间
 */
const formatDateTimeUTC = (isoString) => {
  const date = new Date(isoString)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  let hours = String(date.getUTCHours() + 8).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  // 处理跨天
  if (hours >= 24) {
    hours = String(hours - 24).padStart(2, '0')
    const newDate = new Date(date)
    newDate.setUTCDate(date.getUTCDate() + 1)
    return `${newDate.getUTCFullYear()}-${String(newDate.getUTCMonth() + 1).padStart(2, '0')}-${String(newDate.getUTCDate()).padStart(2, '0')} ${hours}:${minutes}:${seconds}`
  }

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 处理页面关闭前的逻辑
 */
const handleBeforeUnload = async () => {
  const userInfo = localStorage.getItem('userInfo')
  if (!userInfo) return

  endTime.value = new Date()
  const data = {
    startTime: formatDateTimeUTC(startTime.value.toISOString()),
    endTime: formatDateTimeUTC(endTime.value.toISOString()),
    userId: JSON.parse(userInfo).id,
    count: sessionStorage.getItem('count') || 0
  }

  try {
    await request.post('/Data/saveSession', data)
  } catch (error) {
    console.error('保存会话失败:', error)
  }
}

// 生命周期管理
onMounted(() => {
  startTime.value = new Date()
  
  if (!sessionStorage.getItem('count')) {
    sessionStorage.setItem('count', '0')
  }

  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  cleanupOnUnmount()
})
</script>

<style lang="less">
/* ===============================
   全局重置和规范化样式
   =============================== */

/* 现代 CSS Reset */
*,
*::before,
*::after {
  box-sizing: border-box; /* ✅ 现代前端标准 */
  margin: 0;
  padding: 0;
}

html {
  height: 100%;
  overflow-x: hidden;
  /* 移除 overflow-y: hidden，让页面可以正常滚动 */
}

body {
  height: 100%;
  font-family: 'Source Han Sans CN', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ===============================
   App 容器布局
   =============================== */
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

/* ===============================
   Element Plus 组件样式优化
   =============================== */

/* Upload 组件 */
.el-upload {
  --el-upload-dragger-padding-horizontal: 20px;
}

.el-upload-dragger {
  border: 2px dashed #1b6cff;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #409eff;
    background-color: rgba(64, 158, 255, 0.05);
  }
  
  .el-upload__text {
    color: #333;
    
    em {
      color: #1b6cff;
      font-style: normal;
    }
  }
}

/* Dialog 组件 */
.el-dialog {
  border-radius: 12px;
  box-shadow: 0 12px 32px 4px rgba(0, 0, 0, 0.04), 0 8px 20px rgba(0, 0, 0, 0.08);
  
  .el-dialog__close {
    font-size: 20px;
    color: #909399;
    transition: color 0.3s ease;
    
    &:hover {
      color: #f56c6c;
    }
  }
}

/* Menu 组件 */
.el-menu {
  max-height: 680px;
  overflow-y: auto;
  border-right: none;
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    
    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}

.el-menu-item {
  height: 48px;
  line-height: 48px;
  
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  &.is-active {
    color: #1b6cff;
    background-color: rgba(27, 108, 255, 0.08);
  }
}

/* Button 组件 */
.el-button {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  --el-button-hover-text-color: #1b6cff;
  
  &--primary {
    --el-button-bg-color: #1b6cff;
    --el-button-hover-bg-color: #4080ff;
    --el-button-active-bg-color: #0056d6;
  }
  
  &--danger {
    --el-button-bg-color: #f56c6c;
    --el-button-hover-bg-color: #f78989;
    --el-button-active-bg-color: #f24c4c;
  }
}

/* Input 组件 */
.el-input {
  .el-input__wrapper {
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 0 0 1px rgba(27, 108, 255, 0.2);
    }
    
    &.is-focus {
      box-shadow: 0 0 0 1px #1b6cff;
    }
  }
}

.el-textarea {
  .el-textarea__inner {
    border-radius: 12px;
    padding: 16px;
    line-height: 1.5;
    resize: vertical;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: #1b6cff;
      box-shadow: 0 0 0 2px rgba(27, 108, 255, 0.1);
    }
    
    /* 隐藏滚动条但保持功能 */
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
      
      &:hover {
        background: rgba(0, 0, 0, 0.3);
      }
    }
  }
}

/* Radio 组件 */
.el-radio {
  &__input.is-checked {
    .el-radio__inner {
      background-color: #1b6cff;
      border-color: #1b6cff;
    }
  }
  
  &__input.is-checked + .el-radio__label {
    color: #1b6cff;
  }
}

.el-radio-button {
  &.is-active .el-radio-button__inner {
    background-color: #1b6cff;
    border-color: #1b6cff;
    color: #fff;
  }
}

/* Progress 组件 */
.el-progress {
  .el-progress__text {
    font-size: 12px;
    margin-left: 8px;
    min-width: 3em;
  }
}

/* Popover 组件 */
.el-popover {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  
  &.right-aligned-popover {
    max-width: 120px;
    min-width: 120px;
  }
  
  .action-menu {
    padding: 4px 0;
    
    div {
      padding: 8px 16px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      &.danger {
        color: #f56c6c;
        
        &:hover {
          background-color: rgba(245, 108, 108, 0.1);
        }
      }
    }
  }
}

/* ===============================
   响应式设计
   =============================== */
@media (max-width: 768px) {
  .app-container {
    height: 100vh;
  }
  
  .el-dialog {
    width: 95vw !important;
    margin: 5vh auto !important;
  }
  
  .el-menu {
    max-height: 50vh;
  }
}

/* ===============================
   辅助类
   =============================== */
.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.text-center {
  text-align: center;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-auto {
  overflow: auto;
}
</style> 