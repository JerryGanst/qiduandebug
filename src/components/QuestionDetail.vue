<template>
    <el-container>
      <el-header>
        <el-button type="text" @click="goBack">返回</el-button>
        <h2>{{ question.title }}</h2>
      </el-header>
      <el-main>
        <el-card>
          <div>{{ question.content }}</div>
          <div>提问者: {{ question.author }}</div>
          <div>日期: {{ question.date }}</div>
        </el-card>
        <el-divider></el-divider>
        <h3>回答</h3>
        <el-input
          type="textarea"
          :rows="4"
          placeholder="请输入你的回答"
          v-model="answer"
        ></el-input>
        <el-button type="primary" @click="submitAnswer">提交回答</el-button>
      </el-main>
    </el-container>
  </template>
  
  <script>
  export default {
    props: {
      question: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        answer: '',
      };
    },
    methods: {
      goBack() {
        this.$emit('go-back');
      },
      submitAnswer() {
        if (this.answer.trim()) {
          this.$emit('submit-answer', this.answer);
          this.answer = '';
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .el-header {
    background-color: #409EFF;
    color: white;
    text-align: center;
    line-height: 60px;
  }
  </style>