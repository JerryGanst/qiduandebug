<template>
  <div class="renderedMarkdown" v-html="renderedMarkdown"></div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked' // 引入 marked
import hljs from 'highlight.js/lib/common' // 按需引入常用语言包
import 'highlight.js/styles/github-dark.css' // 推荐暗色主题
// 定义 props 接收 Markdown 字符串
const props = defineProps({
  markdown: {
    type: String,
    required: true
  }
})
// 配置 marked 以启用硬换行
marked.setOptions({
  highlight: (code, lang) => {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    return hljs.highlight(code, { language }).value
  },
  breaks: true
})
// 使用 computed 将 Markdown 转换为 HTML
const renderedMarkdown = computed(() => {
  return marked(props.markdown)
})
</script>

<style scoped lang="less">
.renderedMarkdown {
  margin-top: 10px;
  width: 100%;
  background-color: #fafafa;
  padding: 2px 20px;
  font-size: 14px;
  letter-spacing: 1px;
  line-height: 24px;
  border-radius: 10px;
  letter-spacing: 1px;
  box-sizing: border-box;

  // white-space: pre-wrap;
  :deep(.language-json) {
    white-space: pre-wrap;
  }
}
</style>
