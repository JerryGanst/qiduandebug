<template>
  <div id="app">
    <!-- <nav>
      <router-link to="/">login</router-link> |
      <router-link to="/main">main</router-link>
    </nav> -->
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import request from '@/utils/request' // 导入封装的 axios 方法
const startTime = ref(null)
const endTime = ref(null)
const formatDateTimeUTC = isoString => {
  const date = new Date(isoString)

  // 提取 UTC 时间并手动加 8 小时（避免本地时区干扰）
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0') // 月份从 0 开始
  const day = String(date.getUTCDate()).padStart(2, '0')
  let hours = String(date.getUTCHours() + 8).padStart(2, '0') // 加 8 小时
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  // 处理跨天（例如 UTC 16:00 → 北京 00:00，日期+1）
  if (hours >= 24) {
    hours = String(hours - 24).padStart(2, '0')
    const newDate = new Date(date)
    newDate.setUTCDate(date.getUTCDate() + 1)
    return `${newDate.getUTCFullYear()}-${String(newDate.getUTCMonth() + 1).padStart(2, '0')}-${String(newDate.getUTCDate()).padStart(2, '0')} ${hours}:${minutes}:${seconds}`
  }

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 记录开始时间
onMounted(() => {
  startTime.value = new Date() // 页面加载时间
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// 清理事件监听
onBeforeUnmount(() => {
  if (localStorage.getItem('userInfo')) {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
})

// 处理页面关闭前的逻辑
const handleBeforeUnload = () => {
  endTime.value = new Date() // 页面关闭时间
  // 使用 sendBeacon 发送数据到后端（确保可靠传输）
  const data = {
    startTime: formatDateTimeUTC(startTime.value.toISOString()),
    endTime: formatDateTimeUTC(endTime.value.toISOString())
  }
  request
    .post('/Data/saveSession', {
      startTime: data.startTime,
      endTime: data.endTime,
      userId: JSON.parse(localStorage.getItem('userInfo')).id
    })
    .then(res => {
      if (res.status) {
      }
    })
    .catch(err => {
      // loadingInstance.close();
      console.error('获取回复失败:', err)
      // botMessage.text = '抱歉，暂时无法获取回复';
    })

  // navigator.sendBeacon('/api/save-session', JSON.stringify(data))
}
</script>
<style lang="less">
.el-dialog__close {
  font-size: 24px !important;
  margin-top: 10px !important;
  color: #9d9d9d !important;
}
.el-upload-dragger .el-upload__text {
  color: #333 !important;
}
.el-upload-dragger .el-upload__text em {
  color: #1b6cff !important;
}
.el-upload-dragger {
  border: 2px dashed #1b6cff !important;
}
.right-aligned-popover {
  max-width: 100px !important;
  width: 100px !important;
  min-width: 100px !important;
  .el-popper {
    width: 100px !important;
    min-width: 100px !important;
  }
}

body {
  margin: 0px;
  background-color: #eaeaea;
}
* {
  box-sizing: content-box;
}
.el-progress__text {
  padding-left: 10px !important;
  font-size: 12px !important;
  min-width: 20px !important;
  display: none;
  .el-icon {
    display: none;
  }
}

.el-menu {
  max-height: 680px;
  overflow-y: auto;
  :deep(.el-popover) {
    min-width: 120px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
    border-radius: 4px;

    .action-menu {
      padding: 6px 0;

      div {
        padding: 8px 16px;
        line-height: 1.5;
        cursor: pointer;

        &:hover {
          background: #f5f7fa;
        }

        &.danger {
          color: #f56c6c;
        }
      }
    }
  }
}
.el-dialog {
  border-radius: 10px !important;
}
/* WebKit 浏览器滚动条样式 */
.el-menu::-webkit-scrollbar {
  width: 1px; /* 滚动条宽度 */
}

.el-menu::-webkit-scrollbar-track {
  background: #f1f1f1; /* 轨道背景颜色 */
  border-radius: 0px; /* 轨道圆角 */
}

.el-menu::-webkit-scrollbar-thumb {
  background: #888; /* 滑块颜色 */
  border-radius: 0px; /* 滑块圆角 */
  border: 1px solid #f1f1f1; /* 滑块边框 */
}

.el-menu::-webkit-scrollbar-thumb:hover {
  background: #555; /* 滑块悬停时的颜色 */
}
.el-textarea__inner {
  padding: 18px 100px 18px 15px !important;
  letter-spacing: 1px; /* 设置字间距 */
}
.el-menu--vertical:not(.el-menu--collapse):not(.el-menu--popup-container) .el-menu-item {
  height: 40px;
  padding: 0 0px 0 15px !important;
}
.el-menu-item span {
  height: 40px;
  line-height: 40px;
  width: 165px;
}

.el-textarea__inner {
  background-color: #fff !important;
}
.el-textarea__inner {
  border-radius: 16px !important;
}
/* WebKit 浏览器滚动条样式 */
.el-textarea__inner::-webkit-scrollbar {
  width: 1px; /* 滚动条宽度 */
  opacity: 0;
}

.el-textarea__inner::-webkit-scrollbar-track {
  background: rgba(135, 206, 235, 0); /* 轨道背景颜色 */
  border-radius: 16px; /* 轨道圆角 */
  opacity: 0;
}

.el-textarea__inner::-webkit-scrollbar-thumb {
  background: rgba(135, 206, 235, 0); /* 滑块颜色 */
  border-radius: 0px; /* 滑块圆角 */
  border: 1px solid #f1f1f1; /* 滑块边框 */
  opacity: 0;
}

.el-textarea__inner::-webkit-scrollbar-thumb:hover {
  background: rgba(135, 206, 235, 0); /* 滑块悬停时的颜色 */
  opacity: 0;
}
.el-menu-item span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-icon {
  color: #707070 !important;
}
.el-radio__input.is-checked .el-radio__inner {
  background: #1b6cff !important;
  border-color: #1b6cff !important;
}
.el-radio__input.is-checked + .el-radio__label {
  color: #1b6cff !important;
}
.el-radio-button.is-active .el-radio-button__original-radio:not(:disabled) + .el-radio-button__inner {
  background: #1b6cff !important;
  border-color: #1b6cff !important;
}
// .el-menu-item.is-active {
//   color: #1b6cff !important;
// }
// .el-radio-button {
//   margin-left: 10px;
//   border-radius: 10px;
// }
// .el-radio-button__inner{
//   border-radius: 10px;
// }
.el-button {
  --el-button-hover-text-color: #1b6cff !important;
}
.el-button--primary {
  --el-button-bg-color: #1b6cff !important;
  --el-button-hover-text-color: #fff !important;
}
.el-button--danger {
  --el-button-bg-color: #ff4d4f !important;
}
</style>
