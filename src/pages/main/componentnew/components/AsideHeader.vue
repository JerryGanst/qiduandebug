<template>
  <div class="aside-header">
    <img class="aside-logo" src="@/assets/logo.png" />
    <div class="aside-nav">
      <div 
        class="nav-item" 
        @click="handleNavClick(1)"
        :class="{ active: selectType === 1 }"
      >
        <div class="nav-icon" :style="{ backgroundColor: selectType === 1 ? '#E6F4FF' : '#F7F7F7' }">
          <img :src="selectType === 1 ? messageBlue : messageGray" />
        </div>
        <div class="nav-text" :style="{ color: selectType === 1 ? '#1B6CFF' : '#9D9D9D' }">对话</div>
      </div>

      <div 
        class="nav-item" 
        v-if="isPowerFile" 
        @click="handleNavClick(2)"
        :class="{ active: selectType === 2 }"
      >
        <div class="nav-icon" :style="{ backgroundColor: selectType === 2 ? '#E6F4FF' : '#F7F7F7' }">
          <img :src="selectType === 2 ? fileBlue : fileGray" />
        </div>
        <div class="nav-text" :style="{ color: selectType === 2 ? '#1B6CFF' : '#9D9D9D' }">知识库</div>
      </div>

      <div 
        class="nav-item" 
        @click="handleNavClick(3)"
        :class="{ active: selectType === 3 }"
      >
        <div class="nav-icon" :style="{ backgroundColor: selectType === 3 ? '#E6F4FF' : '#F7F7F7' }">
          <img :src="selectType === 3 ? IntelligenceBlue : IntelligenceGray" />
        </div>
        <div class="nav-text" :style="{ color: selectType === 3 ? '#1B6CFF' : '#9D9D9D' }">智能体</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuth } from '@/utilsnew/composables/useAuth'
import { useFile } from '@/utilsnew/composables/useFile'
import { MESSAGE_CONFIG } from '../config/constants'

// 图标资源
import messageBlue from '@/assets/message_blue.png'
import messageGray from '@/assets/message_gray.png'
import fileBlue from '@/assets/file_blue.png'
import fileGray from '@/assets/file_gray.png'
import IntelligenceBlue from '@/assets/​​Intel_blue.png'
import IntelligenceGray from '@/assets/​​Intel_gray.png'

// Props
const props = defineProps({
  selectType: {
    type: Number,
    default: 1
  },
  isPowerFile: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:selectType', 'change-content'])

// 使用新的composables
const { isLogin, isNetworkUser } = useAuth()
const { clearDragFiles } = useFile()

// 处理导航点击
const handleNavClick = (type) => {
  if (!isLogin.value) {
    ElMessage.warning(MESSAGE_CONFIG.REQUIRE_LOGIN)
    return
  }
  
  // 清理拖拽文件
  clearDragFiles()
  
  // 检查网络权限
  if ((type === 2 || type === 3) && !isNetworkUser.value) {
    ElMessage.warning(MESSAGE_CONFIG.NETWORK_ONLY)
    return
  }
  
  emit('update:selectType', type)
  emit('change-content', type)
}
</script>

<style lang="less" scoped>
.aside-header {
  width: 60px;
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .aside-logo {
    width: 36px;
    height: 36px;
    margin-bottom: 20px;
  }
  
  .aside-nav {
    width: 100%;
    
    .nav-item {
      width: 100%;
      height: 70px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-bottom: 10px;
      
      .nav-icon {
        width: 36px;
        height: 36px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 12px;
        transition: background-color 0.3s;
        
        img {
          width: 28px;
          height: 28px;
        }
      }
      
      .nav-text {
        font-size: 12px;
        margin-top: 4px;
        transition: color 0.3s;
      }
      
      &:hover {
        .nav-icon {
          background-color: #E6F4FF !important;
        }
        .nav-text {
          color: #1B6CFF !important;
        }
      }
    }
  }
}
</style> 