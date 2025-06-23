// src/utils/networkService.js
import { ref, readonly } from 'vue'
import request from '@/utils/request'
// 导入封装的 axios 方法
import { useShared } from '@/utils/useShared'
const isOnline = ref(navigator.onLine)
const networkType = ref('unknown')
const emit = defineEmits(['setNet'])
const { isNet } = useShared()
// 判断是否为内网的函数（根据你的实际需求调整）
function checkIsInternalNetwork() {
  // 示例：通过域名或IP判断
  return (
    window.location.hostname.includes('internal') ||
    window.location.hostname.includes('local') ||
    /^(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))/.test(window.location.hostname)
  )
}

// 更新网络状态
function updateNetworkStatus() {
  isOnline.value = navigator.onLine

  // 检测网络类型
  if (checkIsInternalNetwork()) {
    networkType.value = 'internal'
  } else {
    networkType.value = 'external'
  }
  getUserPower()
  console.log(`网络状态变化: ${isOnline.value ? '在线' : '离线'}, 类型: ${networkType.value}`)
}

// 初始化监听
function initNetworkListener() {
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)

  // 定期检查网络类型（因为切换网络不一定会触发online/offline事件）
  setInterval(updateNetworkStatus, 5000)

  // 初始检查
  updateNetworkStatus()
}
function getUserPower() {
  request
    .get('/UserInfo/getUserIP')
    .then(res => {
      if (res.status) {
        localStorage.setItem('isNet', res.data)
        isNet.value = res.data
        emit('setNet')
      }
    })
    .catch(err => {
      console.error(err)
    })
}
// 暴露只读的状态
export const networkState = readonly({
  isOnline,
  networkType
})

export function setupNetworkListener() {
  initNetworkListener()
}
