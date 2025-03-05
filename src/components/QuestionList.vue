<template>
    <el-container>
      <el-header>
        <h1>问答页面</h1>
      </el-header>
      <el-main>
        <el-table :data="questions" style="width: 100%">
          <el-table-column prop="title" label="问题标题"></el-table-column>
          <el-table-column prop="author" label="提问者" width="120"></el-table-column>
          <el-table-column prop="date" label="日期" width="120"></el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button type="text" @click="viewDetail(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        questions: [
          { id: 1, title: '如何学习 Vue 3？', author: '张三', date: '2023-10-01' },
          { id: 2, title: 'Element Plus 如何使用？', author: '李四', date: '2023-10-02' },
          { id: 3, title: 'Vue 3 和 Vue 2 有什么区别？', author: '王五', date: '2023-10-03' },
        ],
      };
    },
    methods: {
      viewDetail(question) {
        this.$emit('view-detail', question);
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