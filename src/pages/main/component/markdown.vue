<template>
    <div v-html="renderedMarkdown" style="margin-top: 10px;background-color: #f5f5f6;padding: 0px 15px;font-size: 14px;letter-spacing: 1px;line-height: 24px;border-radius: 10px;"></div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { marked } from 'marked'; // 引入 marked
  
  // 定义 props 接收 Markdown 字符串
  const props = defineProps({
    markdown: {
      type: String,
      required: true,
    },
  });
  
  // 使用 computed 将 Markdown 转换为 HTML
  const renderedMarkdown = computed(() => {
    return marked(props.markdown);
  });
  </script>
  
  <style scoped>
  /* 可以在这里添加样式 */
  </style>