<template>
  <el-container class="container">
    <!-- 左侧栏 -->
    <AsizeComponent @change-history="getHistory" ref="asizeRef"></AsizeComponent>
    <!-- 右侧内容 -->
    <el-container>
      <el-main>
        <div v-if="!currentQuestion" class="center-container">
          <Entry
            @submit-tran="submitTran"
            @submit-final="submitFinal"
            @submit-question="submitQuestion"
            @cancel-currentRequest="cancelCurrentRequest(val)"
            @submit-sample-title="submitSampleTitle"
            @sample-post="samplePost"
            @summit-post="summitPost"
            @submit-tranSend="submitTranSend"
            @up-common="upCommon"
            @down-common="downCommon"
            @refresh-data="refreshData"
            @submit-questionSend="submitQuestionSend"
            @submit-sampleSend="submitSampleSend"
          ></Entry>
        </div>
        <div v-else class="center-container" style="padding-top: 0px">
          <div class="main_content" style="width: 860px">
            <div class="text_item" v-if="pageType === 'query' || pageType === 'it'">
              <img src="../../assets/chat.deepseek.com_.png" class="title_src" />
              <div class="title_final">
                {{
                  isQueryStop ? '请重新提出您的问题' : currentObj.messages.type ? '最佳答案已生成' : '开始总结答案...'
                }}
              </div>
            </div>
            <div class="title_float" v-if="pageType === 'query' || pageType === 'it'">
              <div>
                {{ currentObj.messages.isHistory ? '' : currentMessage }}
              </div>
            </div>
            <div v-if="pageType === 'query' || pageType === 'it'" class="title_tiQuery">
              <div class="title_tiQuery_text" :style="{ padding: tipQuery ? '13px 15px' : '0px' }">
                {{ tipQuery }}
              </div>
            </div>

            <MarkdownRenderer
              v-if="(pageType === 'query' || pageType === 'it') && currentObj.messages.type === 'final_answer'"
              :markdown="currentObj.messages.content"
            />
            <div
              v-if="
                (pageType === 'query' || pageType === 'it') &&
                currentObj.messages.type === 'final_answer' &&
                currentObj.messages.sources
              "
              class="query_source"
            >
              附件
            </div>
            <a
              class="href_source"
              v-for="(it, index) in processedData"
              v-if="
                (pageType === 'query' || pageType === 'it') &&
                currentObj.messages.type === 'final_answer' &&
                currentObj.messages.sources
              "
              @click="toDoc(it)"
            >
              {{ it.document_title }}(第{{ it.page.join('/') }}页)
            </a>
            <div
              class="query_common"
              v-if="(pageType === 'query' || pageType === 'it') && currentObj.messages.type === 'final_answer'"
            >
              <div>
                <img
                  src="../../assets/refresh.png"
                  style="margin-left: 10px"
                  class="query_common_img"
                  @click="refreshData"
                />
              </div>
              <div>
                <img src="../../assets/up.png" @click="upCommon" class="query_common_img" style="margin-left: 15px" />
              </div>
              <div>
                <img
                  src="../../assets/down.png"
                  style="margin-left: 15px"
                  @click="downCommon"
                  class="query_common_img"
                />
              </div>
            </div>

            <div class="text_item" v-if="pageType === 'sample'">
              <img src="../../assets/chat.deepseek.com_.png" class="title_src" />
              <div>
                {{
                  isSampleStop
                    ? '请重新提出您的问题'
                    : chatQuery.messages.length > 0 && !limitLoading
                      ? '最佳答案已生成'
                      : '开始总结答案...'
                }}
              </div>
            </div>

            <div class="tip_load" v-if="pageType === 'sample' && isSampleLoad && limitLoading">
              <span>正在为您解答,请稍等</span>
              <span>{{ dots }}</span>
            </div>
            <div class="sample_item" ref="messageContainer">
              <div
                class="sample_chat"
                v-if="pageType === 'sample' && chatQuery.messages.length > 0"
                v-for="(item, index) in chatQuery.messages"
              >
                <div
                  v-if="index % 2 === 0"
                  class="sample_chat_query"
                  :style="{ marginTop: index === 0 ? '70px' : '40px' }"
                >
                  {{ item.content }}
                </div>
                <MarkdownRenderer v-if="index % 2 !== 0" :markdown="item.content" type="answer" />
              </div>
            </div>
          </div>
          <div class="query_content">
            <div class="tran_select" v-if="pageType === 'query' || pageType === 'sample' || pageType === 'it'">
              <el-radio-group v-model="selectedMode" @change="changeMode(selectedMode)" :disabled="isSampleLoad">
                <el-radio label="通用模式">通用模式</el-radio>
                <el-radio label="人资行政专题">人资行政专题</el-radio>
                <el-radio label="IT专题">IT专题</el-radio>
              </el-radio-group>
              <div class="mode_title">模式选择 :</div>
            </div>
            <div class="textarea" v-if="pageType === 'query' || pageType === 'it'">
              <el-input
                v-model="newQuestion"
                placeholder="请输入您的问题,换行请按下Shift+Enter"
                class="custom-input"
                style="width: 100%"
                @keydown="summitPost"
                @keyup.shift.enter="handleShiftEnter"
                type="textarea"
                ref="textareaInputQuery"
                :rows="dynamicRows"
                @input="adjustTextareaHeight('textareaInputQuery')"
              />
              <!-- 发送图标 -->
              <div class="send-icon" @click="submitQuestionSend">
                <img :src="isSampleLoad ? imageC : newQuestion ? imageB : imageA" class="arrow" />
              </div>
            </div>
            <div class="textarea" v-if="pageType === 'sample'">
              <el-input
                v-model="newQuestion"
                placeholder="请输入您的问题,换行请按下Shift+Enter"
                style="width: 100%"
                class="custom-input"
                clearable
                @keydown="samplePost"
                @keyup.shift.enter="handleShiftEnter"
                ref="textareaInputSample"
                type="textarea"
                :rows="dynamicRows"
                @input="adjustTextareaHeight('textareaInputSample')"
              />
              <!-- 发送图标 -->
              <div class="send-icon" @click="submitSampleSend">
                <img :src="isSampleLoad ? imageC : newQuestion ? imageB : imageA" class="arrow" />
              </div>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </el-container>
  <!-- 弹窗 -->

  <el-dialog v-model="commonVisible" title="评价" width="40%" :before-close="handleCommonClose">
    <el-input
      v-model="commonQuestion"
      placeholder="请输入您的宝贵建议"
      style="width: 100%"
      clearable
      type="textarea"
      rows="5"
    />
    <div class="button-item_common">
      <el-button @click="commonVisible = false" style="width: 100px; height: 40px; margin-left: 15px">取消</el-button>
      <el-button type="primary" @click="submitCommon" style="width: 100px; height: 40px">提交</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
// 10.180.248.140
import AsizeComponent from './component/asize.vue'
import Entry from './component/entry.vue'
import { useShared } from '../../utils/useShared'
import { ElButton, ElMessage } from 'element-plus' // 引入 ElMessage
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import imageB from '../../assets/arrow_blue.png'
import imageA from '../..//assets/arrow_gray.png'
import imageC from '../../assets/stop.png'
import request from '../../utils/request' // 导入封装的 axios 方法
import MarkdownRenderer from './component/markdown.vue' // 引入 Markdown 渲染组件
// 静态导入图片

// 变量区域
const {
  currentQuestion,
  newQuestion,
  isSampleStop,
  isQueryStop,
  limitLoading,
  questions,
  answerList,
  currentId,
  pageType,
  selectedMode,
  currentObj,
  tipQuery,
  userInfo,
  activeIndex,
  queryTypes,
  chatQuery,
  isLogin,
  dynamicRows,
  limitSample,
  isSampleLoad,
  handleShiftEnter,
  adjustTextareaHeight,
  textareaInputQuery,
  textareaInputSample,
  finalIng,
  updateFinalQuest,
  selectedLan,
  changeMode,
  transData,
  transQuest,
  finalQuest,
  finalData,
  dots
} = useShared()

const queryIng = ref(false)
const asizeRef = ref(null)
const messageContainer = ref(null)
const sampleData = ref('')
const isTranStop = ref(false)
const isFinalStop = ref(false)

const commonQuestion = ref('')
// 当前显示的消息内容
const currentMessage = ref('')

const commonVisible = ref(false)
// 当前正在显示的消息索引
const currentMessageIndex = ref(0)
const isDisabled = ref(false)
const limitQuery = ref('')
const currentRequestUrl = ref('')
let interval

// 函数区域
const removeItemById = (arr, id) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === id) {
      arr.splice(i, 1)
      break // 找到后立即退出循环
    }
  }
  return arr
}
const removeItemByName = (arr, val) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      arr.splice(i, 1)
      break // 找到后立即退出循环
    }
  }
  return arr
}
const removeItemByType = (arr, name) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].name === name) {
      arr.splice(i, 1)
      break // 找到后立即退出循环
    }
  }
  return arr
}

// 点击取消
const handleCancel = () => {
  // ElMessage.info('已取消删除');
}

// 点号变化逻辑
const updateDots = () => {
  if (dots.value.length >= 5) {
    dots.value = '.' // 重置为一个点
  } else {
    dots.value += '.' // 增加一个点
  }
}
const toDoc = async data => {
  request
    .post('/Files/getFileInfoByName', {
      fileName: data.document_title
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        if (res.data && res.data.fileLink) {
          window.open(res.data.fileLink, '_blank')
        }
      }
    })
    .catch(err => {
      // loadingInstance.close();
      console.error('获取回复失败:', err)
      // botMessage.text = '抱歉，暂时无法获取回复';
    })
}

const handleCommonClose = done => {
  // 这里可以添加一些关闭前的逻辑
  done()
}
// 方法定义
const getCurrentTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}
const processedData = computed(() => {
  const result = []
  const map = new Map()
  currentObj.value.messages.sources.forEach(item => {
    const key = `${item.document_id}-${item.document_title}`
    if (!map.has(key)) {
      map.set(key, {
        document_id: item.document_id,
        document_title: item.document_title,
        page: new Set()
      })
    }
    map.get(key).page.add(item.page)
  })

  map.forEach(value => {
    result.push({
      document_title: value.document_title,
      page: Array.from(value.page).sort((a, b) => a - b)
    })
  })

  return result
})

const isObject = variable => {
  const type = Object.prototype.toString.call(variable)
  return type === '[object PointerEvent]' || type === '[object KeyboardEvent]'
}
// 逐个字显示消息内容的函数
const displayMessage = async message => {
  return new Promise(resolve => {
    let i = 0
    const interval = setInterval(() => {
      if (i < message.content.length) {
        // 逐个字添加到 currentMessage 中
        currentMessage.value += message.content[i]
        i++
      } else {
        // 停止定时器
        clearInterval(interval)
        resolve() // 当前消息显示完成
      }
    }, 30) // 每个字的显示间隔为 30 毫秒
  })
}
// 逐条显示消息
const displayMessagesSequentially = async () => {
  while (currentMessageIndex.value < currentObj.value.messageList.length) {
    const message = currentObj.value.messageList[currentMessageIndex.value]
    currentMessage.value = '' // 清空当前消息
    await displayMessage(message) // 显示当前消息
    currentMessageIndex.value++ // 移动到下一条消息
  }
}

const submitFinal = async (val, isRefresh) => {
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return
  }
  if (isObject(val) && !newQuestion.value) {
    val = ''
    ElMessage.warning('请输入您的问题再发送')
    return
  }

  if (val && !isObject(val)) {
    newQuestion.value = val
  }
  if (!newQuestion.value) {
    ElMessage.warning('请输入您的问题再发送')
    return
  }
  isFinalStop.value = false
  dynamicRows.value = 1
  const data = {
    user_id: userInfo.value.id,
    question: newQuestion.value
  }
  limitQuery.value = newQuestion.value
  newQuestion.value = ''
  finalData.value = {
    title: '',
    data: []
  }
  finalQuest.value = ''
  finalIng.value = true
  if (questions.value.includes(limitQuery.value + '(final)') && !isRefresh) {
    const qData = limitQuery.value + '(final)'
    for (var ms = 0; ms < questions.value.length; ms++) {
      if (qData === questions.value[ms]) {
        activeIndex.value = ms
      }
    }
    asizeRef.value.queryAn(qData, '')
    finalIng.value = false
    return
  }
  if (questions.value.includes(limitQuery.value + '(final)') && isRefresh) {
    const qData = limitQuery.value + '(final)'
    const index = questions.value.findIndex(item => item === qData)
    const idx = answerList.value.findIndex(item => item.title === qData)
    const targetId = answerList.value.find(item => item.title === qData)?.id
    if (index !== -1) {
      questions.value.splice(index, 1)
    }
    if (idx !== -1) {
      answerList.value.splice(index, 1)
    }
    await asizeRef.value.deleteData(targetId, isRefresh)
  }

  if (!questions.value.includes(limitQuery.value + '(final)')) {
    const qData = limitQuery.value + '(final)'
    questions.value.unshift(qData)
  }
  const limitData = JSON.parse(JSON.stringify(queryTypes.value))
  for (var k = 0; k < questions.value.length; k++) {
    const queryObj = {
      name: '',
      type: ''
    }
    queryObj.name = questions.value[k]
    queryObj.type = pageType.value
    const hasVal = limitData.some(item => item.name === queryObj.name)
    if (!hasVal) {
      limitData.unshift(queryObj)
    }
  }
  queryTypes.value = JSON.parse(JSON.stringify(limitData))
  interval = setInterval(updateDots, 500) // 每 500ms 更新一次
  currentRequestUrl.value = '/AI/summarize'
  finalQuest.value = limitQuery.value
  request
    .post('/AI/summarize', {
      user_id: userInfo.value.id,
      question: limitQuery.value
      // showLoading: true
    })
    .then(res => {
      finalIng.value = false
      currentRequestUrl.value = ''
      clearInterval(interval)
      if (res.status) {
        finalData.value.title = res.data.summary

        if (res.data.key_points) {
          finalData.value.data = res.data.key_points
        }
        const obj = {
          question: finalQuest.value,
          answer: finalData.value
        }
        postFinal(obj)
      }
    })
    .catch(err => {
      console.error(err)
      finalIng.value = false
      clearInterval(interval)
    })
}
const samplePost = event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认的换行行为
    if (isSampleLoad.value) {
      ElMessage.warning('有问答正在进行中,请稍后再试')
      return
    }
    submitSample()
  }
}

const refreshData = () => {
  if (pageType.value === 'query' || pageType.value === 'it') {
    queryIng.value = false
    submitQuestion(tipQuery.value, true)
  } else if (pageType.value === 'tran') {
    submitTran(transQuest.value, true)
  } else if (pageType.value === 'final') {
    submitFinal(finalQuest.value, true)
  }
}
const upCommon = async () => {
  if (isDisabled.value) return // 如果按钮已禁用，直接返回
  let id = ''
  if (currentId.value) {
    id = currentId.value
  } else {
    id = answerList.value[0].id
  }
  isDisabled.value = true
  // 2 秒后重新启用按钮
  setTimeout(() => {
    isDisabled.value = false
  }, 3000)
  request
    .post('/Message/feedback', {
      id: id,
      feedback: {
        agree: true,
        content: ''
      }
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        ElMessage.success('谢谢您的点赞,您的支持是我们最大的动力！')
      }
    })
    .catch(err => {
      console.error(err)
    })
}
const downCommon = () => {
  commonVisible.value = true
}
const submitCommon = async () => {
  let id = ''
  if (currentId.value) {
    id = currentId.value
  } else {
    for (var i = 0; i < answerList.value.length; i++) {
      if (limitQuery.value === answerList.value[i].title) {
        id = answerList.value[i].id
      }
    }
  }
  request
    .post('/Message/feedback', {
      id: id,
      feedback: {
        agree: false,
        content: commonQuestion.value
      }
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        ElMessage.success('评价成功,我们会继续努力的！')
        commonVisible.value = false
        commonQuestion.value = ''
      }
    })
    .catch(err => {
      commonVisible.value = false
      commonQuestion.value = ''
      console.error('获取回复失败:', err)
    })
}

const submitQuestionSend = () => {
  if (isSampleLoad.value) {
    stopQuery()
    return
  }
  submitQuestion()
}
const submitSampleSend = () => {
  if (isSampleLoad.value) {
    cancelCurrentRequest('sample')
    return
  }
  submitSample()
}
const submitTranSend = () => {
  if (finalIng.value) {
    cancelCurrentRequest('tran')
    return
  }
  submitTran()
}

const submitSampleTitle = val => {
  if (isSampleLoad.value) {
    ElMessage.warning('有问答正在进行中,请稍后再试')
    return
  }
  submitSample(val)
}
const stopQuery = async () => {
  request
    .post('/AI/stop?userId=' + userInfo.value.id, {
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        cancelCurrentRequest('query')
      }
    })
    .catch(err => {})
}
const submitSample = async val => {
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return
  }
  if (isObject(val) && !newQuestion.value) {
    val = ''
    ElMessage.warning('请输入您的问题再发送')
    return
  }

  if (val && !isObject(val)) {
    newQuestion.value = val
  }
  if (!newQuestion.value) {
    ElMessage.warning('请输入您的问题再发送')
    return
  }

  currentQuestion.value = true
  isSampleStop.value = false
  dynamicRows.value = 1
  isSampleLoad.value = true
  limitLoading.value = true
  const currentData = {
    role: 'user',
    content: newQuestion.value
  }
  let mes = {
    messages: []
  }
  mes = JSON.parse(JSON.stringify(chatQuery))
  mes.messages.push(currentData)
  limitSample.value = JSON.parse(JSON.stringify(mes))
  const params = JSON.parse(JSON.stringify(mes))
  for (var j = 0; j < params.messages.length; j++) {
    if (j % 2 === 0) {
      params.messages[j].role = 'user'
    } else {
      params.messages[j].role = 'assistant'
    }
  }
  const queryValue = newQuestion.value
  tipQuery.value = queryValue
  newQuestion.value = ''
  if (questions.value.includes(queryValue + '(sample)')) {
    const qData = queryValue + '(sample)'
    for (var ms = 0; ms < questions.value.length; ms++) {
      if (qData === questions.value[ms]) {
        activeIndex.value = ms
      }
    }
    asizeRef.value.queryAn(qData, '')
    isSampleLoad.value = false
    return
  }

  const anList = JSON.parse(JSON.stringify(answerList.value))
  const hasId = anList.some(item => item.id === currentId.value)
  let id = ''
  if (!hasId) {
    questions.value.unshift(queryValue + '(sample)')
    activeIndex.value = '0'
  }
  if (hasId) {
    id = currentId.value
  }
  const limitData = JSON.parse(JSON.stringify(queryTypes.value))

  for (var k = 0; k < questions.value.length; k++) {
    const queryObj = {
      name: '',
      type: ''
    }
    queryObj.name = questions.value[k]
    queryObj.type = 'sample'
    const hasVal = limitData.some(item => item.name === queryObj.name)
    if (!hasVal) {
      limitData.unshift(queryObj)
    }
  }
  queryTypes.value = JSON.parse(JSON.stringify(limitData))
  interval = setInterval(updateDots, 500)
  // 使用一个对象记录哪些 content 已经有 user 了
  chatQuery.messages = mes.messages
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
  currentRequestUrl.value = '/AI/chat'
  request
    .post('/AI/chat', JSON.stringify(params))
    .then(res => {
      clearInterval(interval)
      isSampleLoad.value = false
      limitLoading.value = false
      currentRequestUrl.value = ''
      if (res.status) {
        limitSample.value = {
          messages: []
        }
        const newMessage = { ...res.data.message } //
        mes.messages.push(newMessage)
        chatQuery.messages = mes.messages
        nextTick(() => {
          // 滚动到底部
          if (messageContainer.value) {
            const messages = messageContainer.value.children
            if (messages.length > 0) {
              const lastMessage = messages[messages.length - 2]
              // 滚动到最后一个消息的开头部分
              lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            // messageContainer.value.scrollTop = messageContainer.value.scrollHeight
          }
        })
        postSample(id)
      }
    })
    .catch(err => {
      currentRequestUrl.value = ''
      clearInterval(interval)
      console.error(err)
    })
}
const submitTran = async (val, isRefresh) => {
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return
  }
  if (isObject(val) && !newQuestion.value) {
    val = ''
    ElMessage.warning('请输入您的问题再发送')
    return
  }

  if (val && !isObject(val)) {
    newQuestion.value = val
  }
  if (!newQuestion.value) {
    ElMessage.warning('请输入您的问题再发送')
    return
  }
  isTranStop.value = false
  dynamicRows.value = 1
  finalIng.value = true
  interval = setInterval(updateDots, 500) // 每 500ms 更新一次
  limitQuery.value = newQuestion.value
  newQuestion.value = ''
  transQuest.value = ''
  transData.value = ''
  if (questions.value.includes(limitQuery.value + '(tran)') && !isRefresh) {
    const qData = limitQuery.value + '(tran)'
    for (var ms = 0; ms < questions.value.length; ms++) {
      if (qData === questions.value[ms]) {
        activeIndex.value = ms
      }
    }
    asizeRef.value.queryAn(qData, '')
    finalIng.value = false
    return
  }
  if (questions.value.includes(limitQuery.value + '(tran)') && isRefresh) {
    const qData = limitQuery.value + '(tran)'
    const index = questions.value.findIndex(item => item === qData)
    const idx = answerList.value.findIndex(item => item.title === qData)
    const targetId = answerList.value.find(item => item.title === qData)?.id
    if (index !== -1) {
      questions.value.splice(index, 1)
    }
    if (idx !== -1) {
      answerList.value.splice(index, 1)
    }
    await asizeRef.value.deleteData(targetId, isRefresh)
  }

  if (!questions.value.includes(limitQuery.value + '(tran)')) {
    const qData = limitQuery.value + '(tran)'
    questions.value.unshift(qData)
  }
  const limitData = JSON.parse(JSON.stringify(queryTypes.value))
  for (var k = 0; k < questions.value.length; k++) {
    const queryObj = {
      name: '',
      type: ''
    }
    queryObj.name = questions.value[k]
    queryObj.type = pageType.value
    const hasVal = limitData.some(item => item.name === queryObj.name)
    if (!hasVal) {
      limitData.unshift(queryObj)
    }
  }
  queryTypes.value = JSON.parse(JSON.stringify(limitData))
  transQuest.value = limitQuery.value
  currentRequestUrl.value = '/AI/translate'
  request
    .post('/AI/translate', {
      user_id: userInfo.value.id,
      source_text: limitQuery.value,
      target_language: selectedLan.value
      // showLoading: true
    })
    .then(res => {
      finalIng.value = false
      currentRequestUrl.value = ''

      clearInterval(interval)
      if (res.status) {
        transData.value = res.data
        const passData = {
          question: limitQuery.value,
          answer: res.data
        }
        postTran(passData)
      }
    })

    .catch(err => {
      finalIng.value = false
      clearInterval(interval)
    })
}
const summitPost = event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认的换行行为
    submitQuestion()
  }
}

const submitQuestion = async (val, isRefresh) => {
  if (queryIng.value) {
    return
  }
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return
  }
  if (isObject(val) && !newQuestion.value) {
    val = ''
    ElMessage.warning('请输入您的问题再发送')
    return
  }
  if (val && !isObject(val)) {
    newQuestion.value = val
  }
  if (!newQuestion.value) {
    ElMessage.warning('请输入您的问题再发送')
    return
  }
  currentQuestion.value = true
  limitQuery.value = newQuestion.value
  isQueryStop.value = false
  dynamicRows.value = 1
  currentMessageIndex.value = 0
  currentObj.value.messages = {}
  currentObj.value.messageList = []
  const queryValue = newQuestion.value
  tipQuery.value = queryValue
  newQuestion.value = ''
  queryIng.value = true
  isSampleLoad.value = true
  const addTitle = pageType.value === 'query' ? '(query)' : '(it)'
  if (questions.value.includes(queryValue + addTitle) && !isRefresh) {
    queryIng.value = false
    const qData = queryValue + addTitle
    for (var i = 0; i < questions.value.length; i++) {
      if (qData === questions.value[i]) {
        activeIndex.value = i
      }
    }
    asizeRef.value.queryAn(qData, '')
    isSampleLoad.value = false
    return
  }
  if (questions.value.includes(queryValue + addTitle) && isRefresh) {
    const qData = queryValue + addTitle
    const index = questions.value.findIndex(item => item === qData)
    const idx = answerList.value.findIndex(item => item.title === qData)
    const targetId = answerList.value.find(item => item.title === qData)?.id
    if (index !== -1) {
      questions.value.splice(index, 1)
    }
    if (idx !== -1) {
      answerList.value.splice(index, 1)
    }
    await asizeRef.value.deleteData(targetId, isRefresh)
  }
  if (!questions.value.includes(queryValue)) {
    questions.value.unshift(queryValue + addTitle)
    activeIndex.value = '0'
  }
  const limitData = JSON.parse(JSON.stringify(queryTypes.value))
  for (var k = 0; k < questions.value.length; k++) {
    const queryObj = {
      name: '',
      type: ''
    }
    queryObj.name = questions.value[k]
    queryObj.type = pageType.value
    const hasVal = limitData.some(item => item.name === queryObj.name)
    if (!hasVal) {
      limitData.unshift(queryObj)
    }
  }
  queryTypes.value = JSON.parse(JSON.stringify(limitData))
  try {
    // 替换为实际的后端接口地址
    const res = await fetch('http://10.180.248.141:8080/AI/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: queryValue,
        user_id: userInfo.value.id,
        type: pageType.value === 'query' ? '人资行政专题' : 'IT专题'
      })
    })
    // 处理流式数据
    const reader = res.body.getReader()
    if (res.status === 429) {
      ElMessage.error('服务器繁忙,请稍后再试')
      return
    }
    const decoder = new TextDecoder()
    let buffer = '' // 缓冲区用于存储不完整的数据
    const set = new Set()
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      // 将二进制数据解码并添加到缓冲区
      buffer += decoder.decode(value, { stream: true })
      //处理buffer数据
      // 清理数据
      buffer = buffer.replace(/data:\s*/g, '')
      // 尝试按分隔符分割数据
      const jsonStr = buffer.split('\n\n')
      // 如果最后一个部分不完整，保留在缓冲区中
      buffer = jsonStr.pop() || ''

      jsonStr.forEach(element => {
        const type = JSON.parse(element).type
        if (type === 'final_answer') {
          queryIng.value = false
          isSampleLoad.value = false
          // loadingInstance.close();
          currentObj.value.messages = JSON.parse(element)
          currentObj.value.messages.isHistory = true
          postQuestion(JSON.parse(element), queryValue, pageType.value, isRefresh)
        } else {
          currentObj.value.messageList.push(JSON.parse(element))
        }
        if (currentObj.value.messageList.length > 0) {
          currentObj.value.messageList = Array.from(
            new Set(currentObj.value.messageList.map(message => message.content))
          ).map(content => {
            return currentObj.value.messageList.find(message => message.content === content)
          })
        }
      })
      await displayMessagesSequentially()
    }
  } catch (error) {
    console.error('获取回复失败:', error)
    isSampleLoad.value = false
    queryIng.value = false
    ElMessage.error('服务器繁忙,请稍后再试')
  }
}

const postSample = async ids => {
  request
    .post('/Message/save', {
      userId: userInfo.value.id,
      type: '通用模式',
      id: ids,
      data: chatQuery.messages,
      title: chatQuery.messages[0].content
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        currentId.value = res.data
        const id = currentId.value
        getHistory(id, 'sample')
      }
    })
    .catch(err => {
      console.error('获取回复失败:', err)
    })
}

const postQuestion = async (obj, val, type) => {
  request
    .post('/Message/save', {
      userId: userInfo.value.id,
      type: type === 'query' ? '人资行政专题' : 'IT专题',
      title: val,
      id: '',
      data: {
        question: val,
        answer: obj
      }
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        getHistory('', type, val)
      }
    })
    .catch(err => {
      console.error('获取回复失败:', err)
    })
}

const postTran = async obj => {
  request
    .post('/Message/save', {
      userId: userInfo.value.id,
      type: '翻译',
      title: obj.question,
      id: '',
      data: {
        question: obj.question,
        answer: obj.answer,
        target: selectedLan.value
      }
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        getHistory('', 'tran', obj.question)
      }
    })
    .catch(err => {
      console.error('获取回复失败:', err)
    })
}

const postFinal = async obj => {
  request
    .post('/Message/save', {
      userId: userInfo.value.id,
      type: '总结',
      title: obj.question,
      id: '',
      data: {
        question: obj.question,
        answer: {
          key_points: obj.answer.data,
          summary: obj.answer.title
        }
      }
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        getHistory('', 'final', obj.question)
      }
    })
    .catch(err => {
      console.error('获取回复失败:', err)
    })
}

const getHistory = async (id, page, val) => {
  request
    .post('/Message/getMessageByUserId', {
      userId: userInfo.value.id
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        answerList.value = res.data
        questions.value = []
        const limitData = JSON.parse(JSON.stringify(queryTypes.value))
        if (res.data && res.data.length > 0) {
          for (var i = 0; i < res.data.length; i++) {
            if (res.data[i].type === '人资行政专题') {
              answerList.value[i].title = answerList.value[i].title + '(query)'
              questions.value.push(answerList.value[i].title)
            } else if (res.data[i].type === 'IT专题') {
              answerList.value[i].title = answerList.value[i].title + '(it)'
              questions.value.push(answerList.value[i].title)
            } else if (res.data[i].type === '通用模式') {
              answerList.value[i].title = answerList.value[i].title + '(sample)'
              questions.value.push(answerList.value[i].title)
            } else if (res.data[i].type === '翻译') {
              answerList.value[i].title = answerList.value[i].title + '(tran)'
              questions.value.push(answerList.value[i].title)
            } else {
              answerList.value[i].title = answerList.value[i].title + '(final)'
              questions.value.push(answerList.value[i].title)
            }
          }
          questions.value = questions.value.reduce((acc, current) => {
            if (!acc.find(item => item === current)) {
              acc.push(current)
            }
            return acc
          }, [])
          for (var k = 0; k < answerList.value.length; k++) {
            const obj = {
              name: '',
              type: ''
            }
            obj.name = answerList.value[k].title
            obj.type =
              answerList.value[k].type === '人资行政专题'
                ? 'query'
                : answerList.value[k].type === 'IT专题'
                  ? 'it'
                  : answerList.value[k].type === '通用模式'
                    ? 'sample'
                    : answerList.value[k].type === '翻译'
                      ? 'tran'
                      : 'final'
            const hasVal = limitData.some(item => item.name === obj.name)
            if (!hasVal) {
              limitData.push(obj)
            }
          }
          queryTypes.value = JSON.parse(JSON.stringify(limitData))
        }
        for (var j = 0; j < answerList.value.length; j++) {
          if (res.data[j].type === '人资行政专题' || res.data[j].type === 'IT专题') {
            answerList.value[j].data.answer.isHistory = true
          } else {
            answerList.value[j].data.isHistory = true
          }
        }
        if (activeIndex.value !== '') {
          const idx = parseInt(activeIndex.value)
          currentId.value = answerList.value[idx].id
        }
        for (var s = 0; s < answerList.value.length; s++) {
          if (id === answerList.value[s].id) {
            activeIndex.value = s
          }
        }
        if (page) {
          pageType.value = page
          if (page === 'query' || page === 'it' || page === 'tran' || page === 'final') {
            for (var h = 0; h < answerList.value.length; h++) {
              if (val === answerList.value[h].title.replace(/\([^)]*\)/g, '')) {
                activeIndex.value = h
                if (page === 'query' || page === 'it') {
                  tipQuery.value = answerList.value[h].title.replace(/\([^)]*\)/g, '')
                }
              }
            }
          }
        }
      }
    })
    .catch(err => {
      console.error('获取回复失败:', err)
    })
}

// 终止请求方法
const cancelCurrentRequest = val => {
  request.cancelRequest(currentRequestUrl.value)
  ElMessage.success('请求已中止')
  if (val === 'sample') {
    isSampleLoad.value = false
    limitLoading.value = false
    isSampleStop.value = true
    chatQuery.messages.pop()
    activeIndex.value = ''
    getHistory()
  }
  if (val === 'query') {
    isSampleLoad.value = false
    limitLoading.value = false
    isQueryStop.value = true
    currentObj.value.messages = {}
    currentObj.value.messageList = []
    tipQuery.value = ''
    queryIng.value = false
    activeIndex.value = ''
    setTimeout(() => {
      currentMessage.value = ''
    }, 3000)
    getHistory()
  }
  if (val === 'tran') {
    finalIng.value = false
    transQuest.value = ''
    transData.value = ''
    isTranStop.value = true
  }
  if (val === 'final') {
    finalIng.value = false
    finalData.value.title = ''
    finalData.value.data = []
    isFinalStop.value = true
  }
}

watch(isSampleLoad, newValue => {
  if (newValue) {
  } else {
    if (activeIndex.value !== '') {
      selectedMode.value =
        queryTypes.value[activeIndex.value].type === 'sample'
          ? '通用模式'
          : queryTypes.value[activeIndex.value].type === 'query'
            ? '人资行政专题'
            : 'IT专题'
    }
  }
})

// 组件卸载时关闭 SSE 连接
onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>

<style lang="less">
.button-item_common {
  display: flex;
  width: 100%;
  margin-top: 40px;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 20px;
}
.el-container {
  background-color: #fff;
}

.el-main {
  padding: 0px !important;
  background: linear-gradient(
    to bottom,
    rgba(197, 208, 213, 0.2),
    /* 淡蓝色，透明度 60% */ rgba(188, 214, 218, 0.1) /* 更淡的蓝色，透明度 60% */
  );
  .center-container {
    display: flex;
    align-items: center;
    height: 100%;
    box-sizing: border-box;
    padding-top: 80px;
    display: flex;
    flex-direction: column;
    .query_content {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      border-radius: 10px;
      flex-direction: column;
      margin-bottom: 10px;
      .tran_select {
        display: flex;
        flex-direction: row-reverse;
        margin-bottom: 10px;
        .mode_title {
          padding-right: 10px;
          line-height: 32px;
          font-size: 14px;
          letter-spacing: 1px;
          color: #333;
        }
      }
    }
    .query_source {
      margin-top: 30px;
      padding: 0 10px;
    }
    .href_source {
      margin-top: 10px;
      color: #409eff;
      cursor: pointer;
      padding: 0 10px;
      font-size: 14px;
    }
    .query_common {
      margin-top: 20px;
      width: 100%;
      display: flex;
      .query_common_img {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
    }
    .select_content {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      border-radius: 10px;
      flex-direction: column;
      height: 140px;
      margin-bottom: 10px;
      .tran_select {
        display: flex;
        flex-direction: row-reverse;
        margin-bottom: 10px;
        .mode_title {
          padding-right: 10px;
          line-height: 32px;
          font-size: 14px;
          letter-spacing: 1px;
          color: #333;
        }
      }
    }
    .main_content::-webkit-scrollbar {
      width: 1px; /* 滚动条宽度 */
    }
    .main_content::-webkit-scrollbar-track {
      background: #f1f1f1; /* 轨道背景颜色 */
      border-radius: 0px; /* 轨道圆角 */
    }
    .main_content::-webkit-scrollbar-thumb {
      background: #888; /* 滑块颜色 */
      border-radius: 0px; /* 滑块圆角 */
      border: 1px solid #f1f1f1; /* 滑块边框 */
    }
    .main_content::-webkit-scrollbar-thumb:hover {
      background: #555; /* 滑块悬停时的颜色 */
    }
    .main_content {
      width: 726px;
      overflow-y: auto;
      overflow-x: hidden;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      /* WebKit 浏览器滚动条样式 */

      .sample_item::-webkit-scrollbar {
        width: 1px; /* 滚动条宽度 */
      }
      .sample_item::-webkit-scrollbar-track {
        background: #f1f1f1; /* 轨道背景颜色 */
        border-radius: 0px; /* 轨道圆角 */
      }
      .sample_item::-webkit-scrollbar-thumb {
        background: #888; /* 滑块颜色 */
        border-radius: 0px; /* 滑块圆角 */
        border: 1px solid #f1f1f1; /* 滑块边框 */
      }
      .sample_item::-webkit-scrollbar-thumb:hover {
        background: #555; /* 滑块悬停时的颜色 */
      }
      .sample_item {
        width: 100%;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
        margin-top: 10px;
        .sample_chat {
          font-size: 14px;
          letter-spacing: 1px;
          width: 100%;
          .sample_chat_query {
            background-color: #409eff;
            border-radius: 10px;
            padding: 13px 15px;
            float: right;
            color: #fff;
            max-width: 600px;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 5px;
          }
        }
      }
      .tip_load {
        font-size: 12px;
        margin-top: 10px;
        letter-spacing: 1px;
        height: 30px;
        padding-left: 37px;
      }
      .text_item {
        margin-top: 75px;
        display: flex;
        line-height: 30px;
        div {
          width: 100%;
          padding-left: 3px;
        }
        .title_src {
          margin-right: 4px;
          width: 30px;
          height: 30px;
          .title_final {
            width: 100%;
            padding-left: 3px;
          }
        }
      }
      .title_float {
        width: 100%;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        height: 30px;
        margin-top: 10px;
        padding-left: 37px;
      }
      .title_tiQuery {
        display: flex;
        flex-direction: row-reverse;
        width: 100%;
        margin-top: 40px;
        .title_tiQuery_text {
          background-color: #409eff;
          border-radius: 10px;
          padding: 13px 15px;
          float: right;
          color: #fff;
          max-width: 600px;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 14px;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }
      }
      .title {
        margin-bottom: 10px;
        display: flex;
        width: 100%;
        justify-content: center;
        .title_src {
          width: 60px;
          height: 60px;
          margin-right: 10px;
        }
        .title_top {
          font-size: 20px;
          font-weight: bold;
        }
        .title_item {
          height: 20px;
          line-height: 20px;
          margin-top: 7px;
          display: flex;
          line-height: 18px;
        }
      }
      .title_wait {
        font-size: 14px;
        margin-top: 30px;
        letter-spacing: 1px;
        font-size: 12px;
      }
      .title_final_tip {
        width: 100%;
        display: flex;
        flex-direction: row-reverse;
        .title_final_query {
          background-color: #409eff;
          border-radius: 10px;
          float: right;
          color: #fff;
          margin-top: 35px;
          max-width: 600px;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: 1px;
          font-size: 14px;
          line-height: 24px;
        }
      }
      .title_final_data {
        margin-top: 15px;
        background-color: #fff;
        font-size: 14px;
        letter-spacing: 1px;
        line-height: 24px;
        border-radius: 10px;
      }
      .title_tran_tip {
        width: 100%;
        display: flex;
        flex-direction: row-reverse;
        div {
          background-color: #409eff;
          border-radius: 10px;
          float: right;
          color: #fff;
          margin-top: 35px;
          max-width: 600px;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 14px;
          letter-spacing: 1px;
        }
      }
      .title_tran_data {
        margin-top: 15px;
        background-color: #fff;
        font-size: 14px;
        letter-spacing: 1px;
        line-height: 24px;
        border-radius: 10px;
      }
      .content_list {
        display: flex;
        margin-top: 20px;
        height: 300px;
        width: 100%;
        .list_item {
          flex: 1;
          height: 300px;
          border-radius: 12px;
          background: linear-gradient(
            to bottom,
            rgba(135, 206, 235, 0.3),
            /* 淡蓝色，透明度 60% */ rgba(224, 247, 250, 0.3) /* 更淡的蓝色，透明度 60% */
          );
          .list_title {
            padding-left: 20px;
            font-size: 16px;
            color: #000;
            font-weight: bold;
            margin-top: 25px;
          }
          .list_tip {
            padding-left: 20px;
            font-size: 12px;
            color: #333;
            margin-top: 10px;
            letter-spacing: 1px;
          }
          .list_arry {
            padding-left: 20px;
            margin-top: 20px;
            color: #333;
            font-size: 14px;
            line-height: 20px;
            .arr_item {
              line-height: 36px;
              cursor: pointer;
              .item_hover {
                padding-left: 3px;
              }
              .item_hover:hover {
                color: #409eff;
              }
            }
          }
          .img_list {
            display: flex;
            flex-direction: column;
            padding: 25px 20px;
            width: 100%;
            box-sizing: border-box;
            .img_item:hover {
              border: 1px solid #409eff;
            }
            .img_item {
              display: flex;
              background-color: #fff;
              border-radius: 10px;
              height: 56px;
              cursor: pointer;
              flex-direction: row;
              border: 1px solid #fff;
              .image {
                width: 36px;
                height: 36px;
                margin-top: 10px;
                margin-left: 15px;
                img {
                  width: 100%;
                  height: 100%;
                }
              }
              .img_text {
                height: 30px;
                padding-left: 10px;
                padding-top: 10px;
                .text_title {
                  font-size: 14px;
                  font-weight: bold;
                  line-height: 20px;
                }
                .text_content {
                  font-size: 12px;
                  line-height: 15px;
                  max-width: 180px;
                  color: #333;
                  white-space: nowrap; /* 强制文本不换行 */
                  overflow: hidden; /* 隐藏超出容器的内容 */
                  text-overflow: ellipsis; /* 超出部分显示省略号 */
                }
              }
            }
          }
        }
      }
    }
  }
}

.container {
  height: 100vh;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.el-aside {
  overflow-x: hidden;
}

.custom-tooltip {
  max-width: 500px !important;
}

.textarea {
  width: 726px;
  position: relative;
  /* 去掉 textarea 右下角的小图标 */
  .custom-input textarea {
    resize: none; /* 禁用调整大小功能 */
  }
  .send-icon {
    position: absolute;
    right: 8px;
    bottom: 3px;
    cursor: pointer;
    transition: color 0.3s;
  }
  .send-icon img {
    width: 44px;
    height: 44px;
  }
}

/* 光标闪烁动画 */
@keyframes blink {
  50% {
    border-color: transparent;
  }
}
</style>
