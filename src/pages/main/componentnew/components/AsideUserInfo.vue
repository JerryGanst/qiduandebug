<template>
  <div class="user-section">
    <!-- 已登录状态 -->
    <div class="user-avatar-container" v-if="isLogin">
      <el-avatar
        :size="36"
        :src="userInfo.url || avatarUrl"
        class="user-avatar"
        @mouseenter="showPopup = true"
        @mouseleave="showPopup = false"
      />

      <el-popover v-model:visible="showPopup" placement="top-end" :width="100" trigger="hover">
        <template #reference>
          <div class="popover-reference"></div>
        </template>

        <div class="user-info-popup">
          <div class="user-info">
            <el-avatar :size="36" :src="avatarUrl" class="el_avatar" />
            <div class="user-details">
              <div class="username">{{ userInfo.id }}</div>
              <div class="username">{{ userInfo.name }}</div>
            </div>
          </div>
          <el-divider />
          <el-button type="text" @click="handleLogout">退出登录</el-button>
        </div>
      </el-popover>
    </div>
    
    <!-- 未登录状态 -->
    <div class="no-login" v-else @click="$emit('show-login')">
      登录
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuth } from '@/utilsnew/composables/useAuth'
import { useChat } from '@/utilsnew/composables/useChat'
import { useIntel } from '@/utilsnew/composables/useIntel'
import { STORAGE_KEYS, MESSAGE_CONFIG } from '../config/constants'
import photo from '@/assets/chat.deepseek.com_.png'

const emit = defineEmits(['show-login'])

// 使用新的composables
const { isLogin, userInfo, logout } = useAuth()
const { resetChat } = useChat()
const { resetIntel } = useIntel()

// 本地状态
const showPopup = ref(false)
const avatarUrl = ref(photo)

// 退出登录
const handleLogout = async () => {
  try {
    await logout()
    
    // 清理本地存储
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    
    // 重置状态
    resetChat()
    resetIntel()
    
    ElMessage.success(MESSAGE_CONFIG.LOGOUT_SUCCESS)
  } catch (error) {
    ElMessage.error(MESSAGE_CONFIG.LOGOUT_FAILED)
  }
}
</script>

<style lang="less" scoped>
.user-section {
  position: fixed;
  bottom: 20px;
  left: 8px;
  
  .no-login {
    font-size: 14px;
    cursor: pointer;
    color: #1b6cff;
    padding: 8px 16px;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .user-avatar-container {
    position: relative;
    
    .popover-reference {
      position: absolute;
      top: 0;
      right: 0;
      width: 36px;
      height: 36px;
    }
    
    .user-avatar {
      cursor: pointer;
      transition: transform 0.3s;
      
      &:hover {
        transform: scale(1.1);
      }
    }
  }
}

.user-info-popup {
  text-align: center;
  
  .user-info {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 0;
    
    .el_avatar {
      img {
        width: 100%;
        height: 100%;
      }
    }
    
    .user-details {
      margin-left: 10px;
      text-align: left;
      
      .username {
        font-weight: bold;
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }
  
  .el-divider {
    margin: 8px 0;
  }
  
  .el-button {
    width: 100%;
    padding: 4px 0;
    
    &:hover {
      color: #409EFF;
    }
  }
}
</style> 