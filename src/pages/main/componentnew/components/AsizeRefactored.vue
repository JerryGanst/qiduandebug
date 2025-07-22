<template>
  <div class="aside-container">
    <!-- 侧边栏头部 -->
    <AsideHeader 
      v-model:selectType="selectType"
      :isPowerFile="isPowerFile"
      @change-content="handleContentChange"
    />
    
    <!-- 用户信息 -->
    <AsideUserInfo @show-login="$emit('show-login')" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/utilsnew/composables/useAuth'
import { useChat } from '@/utilsnew/composables/useChat'
import { cleanupOnUnmount } from '@/utilsnew/utils/memoryHelpers'
import AsideHeader from './AsideHeader.vue'
import AsideUserInfo from './AsideUserInfo.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['update:modelValue', 'change-content', 'show-login'])

// 使用新的composables
const { isNetworkUser } = useAuth()
const { pageType, updatePageType } = useChat()

// 本地状态
const selectType = ref(props.modelValue)

// 计算属性
const isPowerFile = computed(() => isNetworkUser.value)

// 处理内容切换
const handleContentChange = (type) => {
  selectType.value = type
  updatePageType(type)
  emit('update:modelValue', type)
  emit('change-content', type)
}

// 生命周期
onMounted(() => {
  // 同步初始值
  if (props.modelValue !== selectType.value) {
    selectType.value = props.modelValue
  }
})

onUnmounted(() => {
  // 清理所有资源
  cleanupOnUnmount()
})
</script>

<style lang="less" scoped>
.aside-container {
  width: 60px;
  height: 100%;
  background: #fff;
  border-right: 1px solid #E4E7ED;
  display: flex;
  flex-direction: column;
  position: relative;
}
</style> 