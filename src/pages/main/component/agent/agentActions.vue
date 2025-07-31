<script setup lang="ts">
import { ElPopconfirm } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

const props = defineProps<{
  agentId: string | number;
  show: boolean;
}>()

const emit = defineEmits(['close', 'edit', 'delete'])

const handleEdit = () => {
  emit('edit', props.agentId)
}

const handleDelete = () => {
  emit('delete', props.agentId)
}
</script>

<template>
  <div
    class="moreTips"
    v-show="show"
    @mouseleave="emit('close')"
  >
    <div class="editAgent" @click="handleEdit">
      <img src="@/assets/edit.png" />
      <span>修改配置</span>
    </div>
    <ElPopconfirm
      confirm-button-text="确定"
      cancel-button-text="关闭"
      :icon="InfoFilled"
      icon-color="#626AEF"
      title="确认要删除智能体吗?"
      @confirm="handleDelete"
    >
      <template #reference>
        <div class="deleteAgent" @click.stop="">
          <img src="@/assets/delete.png" />
          <span>删除智能体</span>
        </div>
      </template>
    </ElPopconfirm>
  </div>
</template>

<style scoped lang="less">
.moreTips {
  position: absolute;
  width: 142px;
  height: 96px;
  left: 302px;
  top: 48px;
  background-color: white;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 8px;
  z-index: 3;
  box-shadow: 0 8px 16px 0 rgba(175, 166, 166, 0.2),
  0 6px 20px 0 rgba(197, 183, 183, 0.19);

  .editAgent, .deleteAgent {
    box-sizing: border-box;
    width: 126px;
    height: 38px;
    border-radius: 4px;
    text-align: left;
    line-height: 38px;
    padding-left: 15px;
    cursor: pointer;

    img {
      width: 13px;
      height: 13px;
      vertical-align: middle;
      margin-right: 5px;
    }

    span {
      vertical-align: middle;
    }
  }

  .deleteAgent {
    color: red;
  }

  .editAgent:hover {
    background-color: #ededed;
  }

  .deleteAgent:hover {
    background-color: #fff2f0;
  }
}
</style>