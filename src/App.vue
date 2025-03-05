<template>
  <el-container style="height: 100vh;">
    <!-- 左侧栏 -->
    <el-aside :width="isCollapsed ? '64px' : '250px'" style="background-color: #f5f5f5; transition: width 0.3s;">
      <div style="padding: 10px;">
        <el-button type="text" @click="toggleCollapse" style="width: 50px;height: 30px;background-color: red;margin-bottom: 10px;">折叠
          <i :class="isCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
        </el-button>
        <el-button type="primary" @click="startNewConversation" style="width: 200px; margin-bottom: 10px;">
          {{ isCollapsed ? '+' : '开启新对话' }}
        </el-button>

      </div>
      <el-menu :collapse="isCollapsed" style="border-right: none;">
        <el-tooltip v-for="(question, index) in questions" :key="index" :content="question" placement="right">
          <el-menu-item :index="index.toString()">
            <span>{{ isCollapsed ? 'Q' : question }}</span>
          </el-menu-item>
        </el-tooltip>
      </el-menu>
    </el-aside>

    <!-- 右侧内容 -->
    <el-container>
      <el-main>
        <div v-if="!currentQuestion" class="center-container">
          <el-input
            v-model="newQuestion"
            placeholder="请输入你的问题"
            style="width: 300px;"
            @keyup.enter="submitQuestion"
          ></el-input>
        </div>
        <div v-else>
          <el-card style="margin-bottom: 20px;">
            <div v-html="currentAnswer"></div>
          </el-card>
          <el-input
            v-model="newQuestion"
            placeholder="请输入你的问题"
            @keyup.enter="submitQuestion"
          ></el-input>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { ref } from 'vue';
import { postRequest } from '../src/utils/request'; // 导入封装的 axios 方法
export default {
  setup() {
    const isCollapsed = ref(false);
    const questions = ref(['问题1', '问题2', '问题3', '这是一个很长的问题，超出部分会被省略']);
    const newQuestion = ref('');
    const currentQuestion = ref('');
    const currentAnswer = ref('');

    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value;
    };

    const startNewConversation = () => {
      currentQuestion.value = '';
      currentAnswer.value = '';
      newQuestion.value = '';
    };

    const submitQuestion = async () => {
      if (newQuestion.value.trim()) {
        currentQuestion.value = newQuestion.value;
        currentAnswer.value = `这是对问题 "${newQuestion.value}" 的回答。`;
        questions.value.push(newQuestion.value);
        newQuestion.value = '';
      }
      try {
        const response = await postRequest('/postRequest', {
          question: questions.value,
          user_id: '2', // 假设用户 ID 固定为 2
        });

        // 假设接口返回的数据结构为 { answer: "xxx" }
        answer.value = response.answer;
      } catch (error) {
        console.error('请求失败:', error);
        alert('请求失败，请稍后重试');
      }
    };

    return {
      isCollapsed,
      questions,
      newQuestion,
      currentQuestion,
      currentAnswer,
      toggleCollapse,
      startNewConversation,
      submitQuestion,
    };
  },
};
</script>

<style>
*{
  box-sizing: content-box;
}
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.el-menu-item span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>