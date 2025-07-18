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
  // 新增：处理空单元格合并的函数
  const mergeEmptyCells = (html) => {
    // 浏览器环境判断，非浏览器环境直接返回
    if (typeof DOMParser === 'undefined') return html

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const tables = doc.querySelectorAll('table')

    tables.forEach(table => {
      const rows = table.querySelectorAll('tr')
      rows.forEach(row => {
        // 从右向左处理单元格（避免索引变化影响）
        const cells = Array.from(row.querySelectorAll('td, th')).reverse()

        for (const cell of cells) {
          // 1. 检查是否为空单元格
          const isEmpty = cell.textContent.trim() === '' &&
            (!cell.hasAttribute('rowspan') || cell.getAttribute('rowspan') === '1')

          if (isEmpty) {
            const prevCell = cell.previousElementSibling

            if (prevCell) {
              // 2. 合并到左侧单元格
              const prevColspan = parseInt(prevCell.getAttribute('colspan') || '1', 10)
              const cellColspan = parseInt(cell.getAttribute('colspan') || '1', 10)
              prevCell.setAttribute('colspan', prevColspan + cellColspan)
            }

            // 3. 删除空单元格
            cell.remove()
          }
        }
      })
    })

    return doc.body.innerHTML
  }

  const rawHtml = marked(props.markdown)
  return mergeEmptyCells(rawHtml)
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
  :deep(pre) {
    white-space: pre-wrap;
  }
  :deep(tbody) {
    white-space: pre-wrap; /* 保留空白符序列，但正常换行 */
  }
  :deep(tr) {
    white-space: pre-wrap; /* 保留空白符序列，但正常换行 */
    word-break: break-all; /* 强制换行 */
  }
  :deep(table) {
    border-collapse: collapse; /* 关键：合并相邻边框 */
    width: 100%;
  }
  :deep(th) {
    border: 1px solid #ccc; /* 边框样式 */
    padding: 8px; /* 内边距 */
    text-align: left;
  }
  :deep(td) {
    border: 1px solid #ccc; /* 边框样式 */
    padding: 8px; /* 内边距 */
    text-align: left;
  }

  :deep(td a) {
    white-space: pre-wrap !important; /* 保留空白符序列，但正常换行 */
    word-wrap: break-word !important; /* 允许长单词换行 */
    overflow-wrap: break-word; /* 更现代的属性，效果类似 word-wrap */
    word-break: break-all; /* 强制换行 */
  }
}
</style>
