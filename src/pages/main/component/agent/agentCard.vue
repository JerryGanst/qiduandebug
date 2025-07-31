<script setup lang="ts">
import { computed, ref } from 'vue'
import {ElMessage} from "element-plus";
import AgentActions from './agentActions.vue'

const props = defineProps<{
  agentId: string | number;
  agentTitle: string;
  agentContent: string;
  backgroundColor?: string;
  imgUrl?: string;
}>();
const showActions = ref(false);
const showMoreTips = ref(false); // 新增：控制提示框显示状态
const aiImage = computed(() => {
  return props.imgUrl || 'src/assets/agent/ai.png'
});

// 新增：切换提示框显示状态
const toggleMoreTips = () => {
  showMoreTips.value = !showMoreTips.value;
};

// 处理操作菜单事件
const handleEditAgent = (agentId: string | number) => {
  emit('editAgent', agentId);
};

const emit = defineEmits(['deleteAgent', 'editAgent', 'showAgentConversations']);
const handleDeleteAgent = (agentId: string | number) => {// 这里添加实际删除逻辑
  emit('deleteAgent', agentId);
};

// 显示智能体对话
const showAgentConversations = () => {
  emit('showAgentConversations', props.agentId);
}
</script>

<template>
  <div class="agentItem"
       @mouseenter="showActions = true"
       @mouseleave="showActions = false; showMoreTips = false"
       @click="showAgentConversations()"
  >
    <AgentActions
      :agentId="agentId"
      :show="showMoreTips"
      @close="showMoreTips = false"
      @edit="handleEditAgent"
      @delete="handleDeleteAgent"
    />
    <div class="cardTop">
      <div class="title">
        <span class="ellipsis-title" :title="agentTitle">{{ agentTitle }}</span>
      </div>
      <!-- 修改：添加点击事件 -->
      <div
        class="moreActions"
        v-show="showActions"
        @click.stop="toggleMoreTips">...</div>
  </div>
  <div
    class="cardContent"
    :style="{ backgroundColor: backgroundColor || '#E6E6FF' }"
  >
    <div class="whiteCard">
      <div class="leftImg">
        <img :src="aiImage"  alt=""/>
      </div>
      <div class="rightContent">
        <div class="text-ellipsis" :title="agentContent">{{ agentContent }}</div>
      </div>
    </div>
    <div class="coloredCard"></div>
  </div>
  </div>
</template>

<style scoped lang="less">
.agentItem {
  position: relative;
  cursor: pointer;
  width: 340px;
  height: 186px;
  border: 1px solid #F5F5F5;
  box-sizing: border-box;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  /* 添加过渡效果 - 时间调整为0.3s更平缓 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  /* 添加默认阴影使过渡更自然 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

  &:hover {
    /* 缩小放大比例至1.02 */
    transform: scale(1.02);

    /* 减弱阴影效果 */
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);

    /* 确保悬浮卡片在最上层 */
    z-index: 10;
  }

  .title {
    font-size: 22px;
    font-weight: 400;
    color: #0D2761;
    flex: 1;
    overflow: hidden;

    .ellipsis-title {
      display: inline-block;
      max-width: 240px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .cardContent {
    border-radius: 8px;
    width: 316px;
    height: 120px;
    margin-top: 8px;
    position: relative;
    /* 修改内部阴影防止与外部阴影冲突 */
    .coloredCard {
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
    }
  }

  .cardTop {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .moreActions {
      width: 23px;
      height: 23px;
      background-color: #EEEEEE;
      border-radius: 50%;
      text-align: center;
      line-height: 14px;
    }
  }

  .whiteCard {
    width: 268px;
    height: 50px;
    position: absolute;
    left: 22px;
    top: 33px;
    background-color: white;
    border-radius: 10px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: left;

    .rightContent {
      margin-left: 12px;
      font-size: 14px;
      font-weight: 400;
      color: #333333;
      line-height: 18px;
      flex: 1;
      overflow: hidden;

      .text-ellipsis {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: block;
      }
    }

    .leftImg {
      margin-left: 14px;
      img {
        width: 38px;
        height: 38px;
        border-radius: 12px;
      }
    }
  }

  .coloredCard {
    width: 268px;
    height: 50px;
    position: absolute;
    left: 27px;
    top: 38px;
    border-radius: 10px;
    z-index: 1;
    box-shadow: 0 8px 16px 0 rgba(175, 166, 166, 0.2),
    0 6px 20px 0 rgba(197, 183, 183, 0.19);
  }
}
</style>