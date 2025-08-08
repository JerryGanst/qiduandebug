<template>
  <div class="create_main">
    <!-- 临时去掉条件intelList.length > 0 -->
    <div class="create_ask">
      <div class="main_content">
        <div class="sample_item" ref="messageContainerIntel" @scroll="checkScrollPosition">
          <div class="content_tip">
            <div class="content_robot"><img src="@/assets/robot.png" /></div>
            <div class="tip_text">
              Hi,我是你创建的
              <span :style="{ fontWeight: 600 }">{{ currentIntel.name }}</span>
              <span v-if="'compare' === currentAgentType">, 请先上传标准图再上传对比图比较</span>
              <span v-else>, 我将为你生成灵感，设计独属于你的风格。</span>
            </div>
          </div>
          <template v-if="intelQuery.messages.length > 0 && !limitIntelLoading">
            <div class="sample_chat" v-for="(item, index) in intelQuery.messages">
              <div
                v-if="index % 2 === 0 && item.files && item.files.length > 0"
                class="sample_chat_file"
                :style="{ marginTop: index === 0 ? '28px' : '40px' }"
              >
                <div v-for="its in item.files" class="item_files" @click="showListFile(its)">
                  <span style="display: flex; align-items: center">
                    <img :src="getFileImgByOriginFile(its)" style="width: 24px; height: 30px" />
                  </span>
                  <span style="padding-left: 10px" class="file_name">{{ its.originalFileName }}</span>
                </div>
              </div>
              <div
                v-if="index % 2 === 0"
                class="sample_chat_query"
                :style="{
                  marginTop: item.content
                    ? item.files && item.files.length > 0
                      ? '10px'
                      : index === 0
                        ? '30px'
                        : '40px'
                    : '0px',
                  padding: item.content ? '13px 15px' : '0px'
                }"
              >
                {{ item.content }}
              </div>
              <!-- <MarkdownRenderer v-if="index % 2 !== 0" :markdown="item.content" type="answer" /> -->
              <div v-if="index % 2 !== 0 && item.isNewData" class="stream-response">
                <MarkdownRenderer
                  :markdown="item.before"
                  class="normal-text"
                  style="
                    font-size: 13px;
                    line-height: 24px;
                    padding: 0px 10px;
                    background-color: transparent;
                    color: #666;
                  "
                />
                <!-- 后半部分 -->
                <MarkdownRenderer v-if="item.hasSplit" :markdown="item.after" class="normal-text" />
              </div>
              <MarkdownRenderer v-if="index % 2 !== 0 && !item.isNewData" :markdown="item.content" />
            </div>
          </template>
          <template v-if="intelCurrent.messages.length > 0 && limitIntelLoading">
            <div class="sample_chat" v-for="(item, index) in intelCurrent.messages">
              <div
                v-if="index % 2 === 0 && item.files && item.files.length > 0"
                class="sample_chat_file"
                :style="{ marginTop: index === 0 ? '30px' : '40px' }"
              >
                <div v-for="its in item.files" class="item_files" @click="showListFile(its)">
                  <span style="display: flex; align-items: center">
                    <img :src="getFileImgByOriginFile(its)" style="width: 24px; height: 30px" />
                  </span>
                  <span style="padding-left: 10px" class="file_name">{{ its.originalFileName }}</span>
                </div>
              </div>
              <div
                v-if="index % 2 === 0"
                class="sample_chat_query"
                :style="{
                  marginTop: item.content
                    ? item.files && item.files.length > 0
                      ? '10px'
                      : index === 0
                        ? '30px'
                        : '40px'
                    : '0px',
                  padding: item.content ? '13px 15px' : '0px'
                }"
              >
                {{ item.content }}
              </div>
              <div class="tip_load" v-if="index === intelCurrent.messages.length - 1">
                <span><img src="@/assets/robot.png" style="width: 36px; height: 36px" /></span>
                <span style="padding-left: 10px">正在为您解答,请稍等</span>
                <span>{{ dots }}</span>
              </div>
              <MarkdownRenderer v-if="index % 2 !== 0" :markdown="item.content" type="answer" />
            </div>
          </template>
        </div>
        <!-- 添加滚动到底部按钮 -->
        <div v-if="showScrollButton" class="scroll-to-bottom" :class="{ loading: isIntelLoad }" @click="scrollToBottom">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 19V5M5 12l7 7 7-7" stroke="currentColor" stroke-width="2" />
          </svg>

          <!-- 外围旋转圆环 - 只有在加载时显示 -->
          <div v-if="isIntelLoad" class="loading-ring"></div>
        </div>
        <div class="query_common" v-if="!limitIntelLoading && intelQuery.messages.length > 0">
          <div>
            <img src="@/assets/refresh.png" style="margin-left: 10px" class="query_common_img" @click="refreshData" />
          </div>
          <div>
            <img src="@/assets/up.png" @click="upCommon" class="query_common_img" style="margin-left: 15px" />
          </div>
          <div>
            <img src="@/assets/down.png" style="margin-left: 15px" @click="downCommon" class="query_common_img" />
          </div>
        </div>
      </div>
      <div class="select_content">
        <div class="textarea" :class="[fileInputAry && fileInputAry.length > 0 ? 'sampleAreaAry' : 'sampleArea']">
          <el-input
            v-model="intelQuestion"
            placeholder="请输入您的问题,换行请按下Shift+Enter"
            style="width: 100%"
            class="custom-input"
            clearable
            @keydown.enter.prevent="samplePost"
            @keyup.shift.enter.prevent="handleShiftEnter('textareaInputIntel')"
            ref="textareaInputIntel"
            :maxlength="4096"
            type="textarea"
            :rows="dynamicRows"
            @input="adjustTextareaHeight('textareaInputIntel')"
          />
          <div class="filesList" v-if="fileInputAry && fileInputAry.length > 0">
            <div
              v-for="(item, index) in fileInputAry"
              style="cursor: pointer"
              :style="{ marginLeft: index === 0 ? '5px' : '10px' }"
              @click="showListFile(item)"
            >
              <span style="display: flex; align-items: center">
                <img :src="getFileImgByOriginFile(item)" style="width: 22px; height: 28px" />
              </span>
              <span style="padding-left: 10px; width: 50px; overflow: hidden; padding-top: 8px" class="file_name">
                {{ item.originalFileName }}
              </span>
              <span
                style="
                  position: absolute;
                  width: 16px;
                  height: 16px;
                  right: 0px;
                  top: 0px;
                  cursor: pointer;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                "
                @click.stop="deleteImg(index)"
              >
                <img src="@/assets/close.png" style="width: 10px; height: 10px" />
              </span>
            </div>
          </div>
          <!-- 发送图标 -->
          <div class="send-icon">
            <div class="tooltip-wrapper" ref="wrapperRef">
              <img src="@/assets/file.png" class="arrow" @click="showFileSample('sample')" style="margin-right: 10px" />
              <transition name="fade">
                <div v-if="showFileMenu" class="file-menu" @click.stop>
                  <div class="triangle"></div>
                  <div class="menu-item" @click="handleFileSelect('local', 'sample')">从本地读取</div>
                  <div
                    class="menu-item"
                    @click="handleFileSelect('knowledge', 'sample')"
                    v-if="'compare' !== currentAgentType"
                  >
                    从知识库读取
                  </div>
                </div>
              </transition>
            </div>
            <img
              :src="
                isIntelLoad && loadingIntelId && loadingIntelId === currentIntelId
                  ? imageC
                  : intelQuestion || fileInputAry.length > 0
                    ? imageB
                    : imageA
              "
              class="arrow"
              @click="submitSampleSend"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <FileUpload ref="fileRefs"></FileUpload>
  <commonUploadModal ref="commonUploadModals"></commonUploadModal>
  <FilePreUpload ref="filePreRef"></FilePreUpload>

  <el-dialog
    v-model="commonVisible"
    title="评价"
    width="500px"
    :before-close="handleCommonClose"
    style="border-radius: 10px"
  >
    <el-input
      v-model="commonQuestion"
      placeholder="请输入您的宝贵建议"
      :maxlength="4096"
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
import { nextTick, onMounted, onUnmounted, ref, toRaw } from 'vue'
import { useShared } from '@/utils/useShared'
import { ElMessage } from 'element-plus' // 引入 ElMessage
import request from '@/utils/request' // 导入封装的 axios 方法
import eventBus from '@/utils/eventBus'
import FileUpload from '../component/fileUploadModal.vue'
import commonUploadModal from '../component/commonUploadModal.vue'
import FilePreUpload from '../component/filePreModal.vue'
import imageB from '@/assets/arrow_blue.png'
import imageA from '@/assets/arrow_gray.png'
import imageC from '@/assets/stop.png'
import text from '@/assets/text.png'
import MarkdownRenderer from '../component/markdown.vue' // 引入 Markdown 渲染组件
import {
  getAgentChatByAgentId,
  getAgentChatByChatId,
  getImageRecognitionsByUserId,
  getImgRecognitionById,
  saveAgentChat,
  saveImgRecognition
} from '../../../api/agent/actions'
import { getFileImgByOriginFile } from '@/utils/common.js'

const {
  intelList,
  answerListIntel,
  activeIndexIntel,
  currentIntel,
  limitIntelLoading,
  fileInputAry,
  isLogin,
  adjustTextareaHeight,
  textareaInputIntel,
  intelQuestion,
  dynamicRows,
  handleShiftEnter,
  isDragOver,
  fileAry,
  messageContainerIntel,
  intelQuery,
  intelCurrent,
  dots,
  isIntelStop,
  currentIntelId,
  recordId,
  agentChatList,
  conversationId,
  loadingIntelId,
  tempChatId,
  currentAgentType
} = useShared()
const formIntel = ref({
  name: '',
  description: '',
  nickName: '',
  tone: '',
  id: ''
})
const isIntelLoad = ref(false)
const isDisabled = ref(false)
const commonQuestion = ref('')
const limitQuery = ref('')
const fileRefs = ref(null)
const commonUploadModals = ref(null)
const isComputed = ref(false)
const filePreRef = ref(null)
const commonVisible = ref(false)
const type = ref('create')
const currentRequestUrl = ref('')
const scrollPosition = ref(0) // 记录滚动位置
const showScrollButton = ref(false) // 是否显示滚动按钮
const userScrolledUp = ref(false) // 用户是否向上滚动
let interval
const placeholderText = ref(`# 设定
你是一位营销文案奇才，擅长通过对话引导用户明确其产品或服务需求，并能创作出既幽默诙谐又信息准确、吸引力十足的广告语、宣传文案和社交媒体内容。

#  技能
## 技能1：需求挖掘与沟通
- 通过提问和互动，帮助用户清晰定义他们的产品特性和目标受众。
- 识别用户的核心价值主张，并将其转化为文案的关键信息。`)
const checkScrollPosition = () => {
  if (!messageContainerIntel.value) return

  const container = messageContainerIntel.value
  const { scrollTop, scrollHeight, clientHeight } = container

  // 更新滚动位置状态
  scrollPosition.value = scrollTop

  // 检查用户是否手动向上滚动
  userScrolledUp.value = scrollHeight - scrollTop > clientHeight + 150

  // 决定是否显示滚动按钮
  if (isIntelLoad.value) {
    // 流式输出过程中始终展示跳转到结尾按钮
    showScrollButton.value = true
  } else {
    showScrollButton.value = userScrolledUp.value
  }
}

const setInfo = id => {
  const anList = JSON.parse(JSON.stringify(answerListIntel.value))
  for (var i = 0; i < answerListIntel.value.length; i++) {
    if (id === answerListIntel.value[i].id) {
      currentIntel.value = anList[i].persona
    }
  }
}

const createNewConversation = () => {
  // 1. 重置消息列表
  intelQuery.messages = []
  intelCurrent.messages = []

  // 2. 清空输入内容
  intelQuestion.value = ''

  // 3. 清空文件列表
  fileInputAry.value = []

  // 4. 重置加载状态
  isIntelLoad.value = false
  // 5.新建对话时 不展示流式输出框
  limitIntelLoading.value = false
  isIntelStop.value = false

  // 6. 重置会话ID
  conversationId.value = ''
  recordId.value = ''

  // 7. 重置评价相关
  commonQuestion.value = ''

  // 8. 停止进行中的请求
  if (interval) {
    clearInterval(interval)
  }
  if (currentRequestUrl.value) {
    request.cancelRequest(currentRequestUrl.value)
  }

  // 8. 重置UI状态
  dynamicRows.value = 1
  showScrollButton.value = false
  userScrolledUp.value = false

  // 9. 滚动到顶部
  nextTick(() => {
    // 调整输入框高度
    adjustTextareaHeight('textareaInputIntel')

    // 滚动到对话顶部
    if (messageContainerIntel.value) {
      messageContainerIntel.value.scrollTop = 0
    }
  })
}

const createIntel = val => {
  if (isPureObject(val)) {
    type.value = val.param1
    for (var i = 0; i < answerListIntel.value.length; i++) {
      if (val.param2 === answerListIntel.value[i].persona.name) {
        const data = JSON.parse(JSON.stringify(answerListIntel.value[i].persona))
        formIntel.value.name = data.name
        formIntel.value.nickName = data.role
        formIntel.value.description = data.description
        formIntel.value.tone = data.tone
        formIntel.value.id = answerListIntel.value[i].id
      }
    }
  } else {
    type.value = val
    formIntel.value.name = ''
    formIntel.value.nickName = ''
    formIntel.value.description = ''
    formIntel.value.tone = ''
    formIntel.value.id = ''
  }
}
const cancelIntel = () => {}
// 点号变化逻辑
const updateDots = () => {
  if (dots.value.length >= 5) {
    dots.value = '.' // 重置为一个点
  } else {
    dots.value += '.' // 增加一个点
  }
}
const refreshData = () => {
  if (isIntelLoad.value) {
    ElMessage.warning('有问答正在进行中,请稍后再试')
    return
  }
  // const anList = answerListIntel.value
  let ary = []
  if (activeIndexIntel.value || activeIndexIntel.value == 0) {
    const length = intelQuery.messages.length
    if (length === 1) {
      ary = intelQuery.messages[0].files
    } else if (length > 1) {
      if (intelQuery.messages[length - 1].role === 'user') {
        ary = intelQuery.messages[length - 1].files
      } else {
        ary = intelQuery.messages[length - 2].files
      }
    }
  }
  fileInputAry.value = ary
  submitSample(intelQuery.messages[intelQuery.messages.length - 2].content, true)
}
const showFileMenu = ref(false)
const showFileSample = val => {
  showFileMenu.value = !showFileMenu.value
}
const handleCommonClose = done => {
  // 这里可以添加一些关闭前的逻辑
  done()
}
const submitSampleSend = () => {
  if (isIntelLoad.value && loadingIntelId.value && loadingIntelId.value === currentIntelId.value) {
    stopQuery()
  } else {
    submitSample()
  }
}
const stopQuery = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  request
    .post('/AI/stop?userId=' + userInfo.id, {
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        cancelCurrentRequest()
      }
    })
    .catch(err => {})
}

const handleFileSelect = (val1, val2) => {
  showFileMenu.value = false
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return false
  }
  nextTick(() => {
    if (val1 === 'local') {
      fileRefs.value.openFile(val2, fileInputAry.value)
    } else {
      commonUploadModals.value.openFile(val2)
    }
  })
}
const deleteImg = index => {
  fileInputAry.value.splice(index, 1)
  if (!fileInputAry.value || fileInputAry.value.length === 0) {
    fileInputAry.value = []
    nextTick(() => {
      adjustTextareaHeight('textareaInputIntel')
    })
  }
}

const limitIntelId = ref('')
// 终止请求方法
const cancelCurrentRequest = async val => {
  request.cancelRequest(currentRequestUrl.value)
  ElMessage.success('请求已中止')

  isIntelLoad.value = false
  limitIntelLoading.value = false
  isIntelStop.value = true
  intelQuery.messages = JSON.parse(JSON.stringify(intelCurrent.messages))
  const mes = intelQuery.messages
  postSample(currentIntelId.value, mes, tempChatId.value)
  loadingIntelId.value = ''
  intelQuery.isLoading = false
}
const isObject = variable => {
  const type = Object.prototype.toString.call(variable)
  return type === '[object PointerEvent]' || type === '[object KeyboardEvent]'
}
const samplePost = event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认的换行行为
    if (isIntelLoad.value) {
      ElMessage.warning('有问答正在进行中,请稍后再试')
      return
    }
    submitSample()
  }
}
const checkIntelData = val => {
  if (!isLogin.value) {
    ElMessage({
      message: '请先登录再使用',
      type: 'warning'
    })

    return false
  }
  if (isObject(val) && !intelQuestion.value) {
    val = ''
    ElMessage.warning('请输入您的问题再发送')
    return false
  }
  if (val && !isObject(val)) {
    intelQuestion.value = val
  }
  if (!intelQuestion.value) {
    ElMessage.warning('请输入您的问题再发送')
    return false
  }
  return true
}

// 获取第一次对话的标题
let finalTitle = ref('')
const postSample = async (agentId, mes, chatId) => {
  let num = parseInt(sessionStorage.getItem('count'))
  num = num + 1
  sessionStorage.setItem('count', num)
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  if (intelCurrent.messages && intelCurrent.messages.length > 0) {
    // 对话名取第一个消息或文件名用逗号拼接的结果
    finalTitle.value =
      intelCurrent.messages[0].content ||
      intelCurrent.messages[0].files
        ?.map(item => item.originalFileName)
        .filter(Boolean)
        .join(',') ||
      ''
  }
  if (chatId) {
    let chatResults
    if ('compare' === currentAgentType.value) {
      chatResults = await getImgRecognitionById(chatId)
    } else {
      chatResults = await getAgentChatByChatId(chatId)
    }
    if (chatResults.status) {
      if (chatResults.data?.title) {
        finalTitle.value = chatResults.data?.title
      }
    }
  }
  let saveAgentResult
  if (currentAgentType.value === 'compare') {
    mes.forEach(item => {
      if (item.role === 'user') {
        let chatMsg = {}
        let content = []
        chatMsg.type = 'text'
        chatMsg.text = item.content
        if (item.files && item.files.length > 0) {
          for (let i = 0; i < item.files.length; i++) {
            let urlMsg = {}
            urlMsg.type = 'image_url'
            urlMsg.image_url = { image: item.files[i] }
            content.push(urlMsg)
          }
        }
        content.push(chatMsg)
        item.content = content
        delete item.files
      } else if (item.role === 'assistant') {
        item.content = [{
          "type": "text",
          "text": item.content
        }]
      }
    })
    saveAgentResult = await saveImgRecognition({
      userId: userInfo.id,
      imgMessages: mes,
      title: finalTitle.value,
      id: chatId
    })
  } else {
    saveAgentResult = await saveAgentChat({
      userId: userInfo.id,
      id: chatId,
      agentId: agentId,
      messages: mes,
      title: finalTitle.value
    })
  }
  if (saveAgentResult.status) {
    // 如果当前智能体为加载对话的智能体，则可设置会话ID
    if (loadingIntelId.value && currentIntelId.value === loadingIntelId.value) {
      conversationId.value = saveAgentResult.data.id
      // 智能体对话保存完成，左侧列表选中第一个
      activeIndexIntel.value = 0
      getHistory()
    }
  } else {
    ElMessage.warning(saveAgentResult.message)
  }
}
const upCommon = async () => {
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return false
  }
  if (isDisabled.value) return // 如果按钮已禁用，直接返回
  let id = recordId.value
  isDisabled.value = true
  // 2 秒后重新启用按钮
  setTimeout(() => {
    isDisabled.value = false
  }, 3000)

  request
    .post('/Agent/feedback', {
      id: conversationId.value,
      feedback: {
        agree: true,
        content: ''
      }
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        ElMessage.success('谢谢您的点赞,您的支持是我们最大的动力！')
      } else {
        ElMessage.error('评价失败,请稍后再试')
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
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return false
  }
  request
    .post('/Agent/feedback', {
      id: conversationId.value,
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
      } else {
        ElMessage.error('评价失败,请稍后再试')
      }
    })
    .catch(err => {
      commonVisible.value = false
      commonQuestion.value = ''
      console.error('获取回复失败:', err)
    })
}
// 自动滚动
const autoScroll = () => {
  nextTick(() => {
    if (!messageContainerIntel.value || userScrolledUp.value) return

    const container = messageContainerIntel.value
    const { scrollHeight } = container

    // 仅在用户靠近底部时自动滚动
    container.scrollTop = scrollHeight
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainerIntel.value) {
      messageContainerIntel.value.scrollTop = messageContainerIntel.value.scrollHeight
      userScrolledUp.value = false
      showScrollButton.value = false
    }
  })
}

const quickJSONCheck = str => {
  if (typeof str !== 'string') return false
  str = str.trim()
  return (str.startsWith('{') && str.endsWith('}')) || (str.startsWith('[') && str.endsWith(']'))
}

const scrollToLastestMessage = () => {
  nextTick(() => {
    adjustTextareaHeight('textareaInputIntel')
    // 滚动到底部
    if (messageContainerIntel.value) {
      const messages = messageContainerIntel.value.children
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 2]
        // 滚动到最后一个消息的开头部分
        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  })
}

const setMessages = async(params, isRefresh = false) => {
  if (conversationId.value) {
    let chatResult = await getImgRecognitionById(conversationId.value)
    if (chatResult.status) {
      params.messages =  chatResult.data?.imgMessages
      if (params.messages.length >= 2 && isRefresh) {
        params.messages.splice(-2)
      }
    }
  }
}

// 当当前智能体ID与正在跑的智能体ID不同时
const checkWhetherCreateNewChat = () => {
  if (!currentIntelId.value || !loadingIntelId.value) return
  if (currentIntelId.value === loadingIntelId.value) return
  if (!conversationId.value) {
    // 如果切到其他智能体且没有点击会话，则新建会话
    createNewConversation()
  } else {
    intelQuestion.value = ''
    isIntelStop.value = false
    limitIntelLoading.value = false
    fileInputAry.value = []
    getChatByAgentChatId(conversationId.value)
  }
}

const submitSample = async (val, isRefresh) => {
  // 有问答正在进行不允许提交
  if (intelQuery && intelQuery.isLoading) {
    ElMessage.warning('有问答正在进行中,请稍后再试')
    return
  }

  // 提交的一瞬间使用临时变量保存当前对话ID
  if (conversationId.value) {
    tempChatId.value = conversationId.value
  } else {
    tempChatId.value = ''
  }

  const fileInput = fileInputAry.value
  if (fileInput.length === 0 || !fileInput) {
    if (!checkIntelData(val)) {
      return
    }
  }
  if (val) {
    intelQuestion.value = val
  }
  const queryValue = intelQuestion.value
  isIntelStop.value = false
  limitQuery.value = intelQuestion.value
  limitIntelLoading.value = true
  dynamicRows.value = 1
  isIntelLoad.value = true
  loadingIntelId.value = currentIntelId.value
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  if (intelQuery.messages.length === 1 && intelQuery.messages[0].files) {
    intelQuery.messages = []
  }
  let filesSample = []
  if (fileInput && fileInput.length > 0) {
    for (let me = 0; me < fileInput.length; me++) {
      if (isPureObject(fileInput[me].fileId)) {
        filesSample.push(fileInput[me].fileId)
      } else {
        const objSample = {
          fileId: fileInput[me].fileId,
          local: fileInput[me].local
        }
        filesSample.push(objSample)
      }

      fileInput[me].local = fileInput[me].fileId.local === false ? fileInput[me].fileId.local : fileInput[me].local
      fileInput[me].fileId = fileInput[me].fileId.fileId ? fileInput[me].fileId.fileId : fileInput[me].fileId
    }
  }
  const currentData = {
    role: 'user',
    content: queryValue ? queryValue : '',
    files: toRaw(JSON.parse(JSON.stringify(fileInput)))
  }
  let mes
  if (isRefresh) {
    intelQuery.messages.length -= 2
  }
  mes = JSON.parse(JSON.stringify(intelQuery))
  mes.messages.push(currentData)
  const params = JSON.parse(JSON.stringify(mes))
  let images = filesSample.map(file => file.fileId)
  let chatUrl = '/AI/agentChat'
  for (let j = 0; j < params.messages.length; j++) {
    if (j % 2 === 0) {
      params.messages[j].role = 'user'
    } else {
      params.messages[j].role = 'assistant'
    }
  }
  if (currentAgentType.value === 'compare') {
    params.messages = []
    await setMessages(params, isRefresh)
    params.userId = userInfo.id
    params.content = intelQuestion.value
    params.images = images
    chatUrl = '/AI/imageRecognition'
  } else {
    params.userId = userInfo.id
    params.model = 0
    params.files = filesSample
    params.agentId = currentIntelId.value
  }
  intelQuestion.value = ''
  interval = setInterval(updateDots, 500)

  nextTick(() => {
    if (messageContainerIntel.value) {
      messageContainerIntel.value.scrollTop = messageContainerIntel.value.scrollHeight
    }
  })
  const assistantMsg = { role: 'assistant', content: '', before: '', after: '', hasSplit: false, isNewData: true }
  mes.messages.push(assistantMsg)
  // 使用一个对象记录哪些 content 已经有 user 了
  intelCurrent.messages = mes.messages
  intelQuery.isLoading = true
  const isThink = false
  fileInputAry.value = []
  fileAry.value = []
  try {
    // 替换为实际的后端接口地址
    const res = await fetch(import.meta.env.VITE_API_BASE_URL + chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })
    // 处理流式数据
    const reader = res.body.getReader()
    if (res.status === 429) {
      ElMessage.error('服务器繁忙,请稍后再试')
      return
    }
    const decoder = new TextDecoder() // 启用流模式解码
    let buffer = '' // 缓冲区用于存储不完整的数据

    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        clearInterval(interval)
        isIntelLoad.value = false
        limitIntelLoading.value = false
        intelQuery.isLoading = false
        limitIntelId.value = ''
        currentRequestUrl.value = ''

        let saveAgentId = currentIntelId.value
        if (!loadingIntelId.value || loadingIntelId.value === currentIntelId.value) {
          intelQuery.messages = JSON.parse(JSON.stringify(intelCurrent.messages))
          scrollToLastestMessage()
        }
        // 如果存在正在加载的智能体 则保存时保存此智能体
        if (loadingIntelId.value) {
          saveAgentId = loadingIntelId.value
        }
        await postSample(saveAgentId, JSON.parse(JSON.stringify(intelCurrent.messages)), tempChatId.value)
        checkWhetherCreateNewChat()
        // 再执行完save以后再把loading状态清空
        loadingIntelId.value = ''
        break
      }
      buffer += decoder.decode(value, { stream: true })
      // 使用更安全的分割方式（避免截断 JSON 结构）[3](@ref)
      const chunks = buffer.split(/(?=data:)/g)
      buffer = chunks.pop() || ''
      if (quickJSONCheck(buffer)) {
        const jsonData = JSON.parse(buffer)
        if (jsonData.code === 400) {
          ElMessage.warning(jsonData.message)
        }
      }

      chunks.forEach(chunk => {
        // 1. 修复正则匹配语法
        const jsonMatch = chunk.match(/data:\s*({[\s\S]*?})(?=\ndata:|\n\n|$)/)
        // 2. 添加条件判断包裹
        if (jsonMatch) {
          autoScroll()
          try {
            const { content, type } = JSON.parse(jsonMatch[1])
            // 核心逻辑：逐字处理
            if ('compare' !== currentAgentType.value) {
              if (assistantMsg.hasSplit) {
                // 已遇到分隔符，内容追加到后半部分
                assistantMsg.after += content
              } else {
                const sp = isThink ? '</think>' : ''
                // 检查当前数据块是否包含分隔符
                const splitIndex = content.indexOf(sp)
                if (splitIndex === -1) {
                  // 未找到分隔符，全部追加到前半部分
                  assistantMsg.before += content
                } else {
                  // 找到分隔符，分割内容
                  assistantMsg.before += content.slice(0, splitIndex)
                  assistantMsg.after += content.slice(splitIndex + sp.length)
                  assistantMsg.hasSplit = true
                }
              }
            } else {
              if (type === 'model_streaming') {
                assistantMsg.after += content
              }
              assistantMsg.hasSplit = true
            }

            // 立即更新视图（更新最后一条消息）
            intelCurrent.messages.splice(-1, 1, {
              ...toRaw(assistantMsg),
              before: assistantMsg.before,
              after: assistantMsg.after,
              content: assistantMsg.before + assistantMsg.after // 兼容旧字段
            })
          } catch (e) {
            loadingIntelId.value = ''
            console.error('JSON 解析失败:', jsonMatch[1], '错误:', e)
            ElMessage.error('数据格式异常')
          }
        }
      })
    }
  } catch (error) {
    intelQuery.isLoading = false
    loadingIntelId.value = ''
    isIntelLoad.value = false
    limitIntelId.value = ''
    nextTick(() => {
      adjustTextareaHeight('textareaInputIntel')
    })
    ElMessage.error('服务器繁忙,请稍后再试')
  }
}
const showListFile = val => {
  fileAry.value = []
  fileAry.value.push(val)
  filePreRef.value.openFile('sample')
}
const saveData = () => {}
const createData = val => {
  if (!formIntel.value.name) {
    ElMessage.warning('请输入智能体名称')
    return
  }
  if (!formIntel.value.nickName) {
    ElMessage.warning('请输入智能体角色')
    return
  }

  if (!formIntel.value.description) {
    ElMessage.warning('请输入智能体设定')
    return
  }
  let id = ''
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  const params = JSON.parse(JSON.stringify(formIntel.value))

  request
    .post('/Agent/saveAgent ', {
      id: params.id,
      userId: userInfo.id,
      persona: {
        name: params.name,
        role: params.nickName,
        description: params.description,
        tone: params.tone
      }
    })
    .then(res => {
      if (res.status) {
        currentIntel.value.name = params.name
        currentIntel.value.role = params.role
        currentIntel.value.tone = params.tone
        currentIntel.value.agentId = params.agentId
        if (!val) {
          intelList.value.push(formIntel.value.name)
        }
        getHistory()
      } else {
        ElMessage.error(res.message)
      }
    })
    .catch(err => {
      ElMessage.warning('创建智能体失败,请稍后再试')
      console.error(err)
    })
}
const isPureObject = value => {
  // 排除 null 和基础类型
  if (typeof value !== 'object' || value === null) return false

  // 排除数组、日期、正则等
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}
const submitSampleFile = val => {
  // isDragOver.value = false
  for (let i = 0; i < val.length; i++) {
    val[i].fileName = decodeURIComponent(val[i].fileName)
    val[i].originalFileName = decodeURIComponent(val[i].originalFileName)
  }
  fileAry.value = val
  fileInputAry.value = JSON.parse(JSON.stringify(val))
  nextTick(() => {
    adjustTextareaHeight('textareaInputIntel')
  })
}

const getInfo = async id => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  request
    .post('/Agent/findAgentChat?userId=' + userInfo.id + '&agentId=' + id)
    .then(res => {
      if (res.status) {
        intelQuery.messages = res?.data[0]?.messages ? res?.data[0]?.messages : []
        if (res.data && res.data.length > 0) {
          recordId.value = res.data[0].id
        } else {
          recordId.value = ''
        }
        nextTick(() => {
          // 滚动到底部
          if (messageContainerIntel.value) {
            const messages = messageContainerIntel.value.children
            if (messages.length > 0) {
              const lastMessage = messages[messages.length - 2]
              if (lastMessage) {
                // 滚动到最后一个消息的开头部分
                lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }
          }
        })
      }
    })
    .catch(err => {
      console.error('获取回复失败:', err)
    })
}

const getChatByAgentChatId = async chatId => {
  conversationId.value = chatId
  if (intelQuery.isLoading) {
    // 如果当前对话ID与正在输出的流式回答ID一致 则显示流式问答框 否则不显示
    limitIntelLoading.value = chatId === tempChatId.value
  }
  let chatResults
  if (currentAgentType.value === 'compare') {
    chatResults = await getImgRecognitionById(chatId)
  } else {
    chatResults = await getAgentChatByChatId(chatId)
  }
  if (chatResults.status) {
    if (currentAgentType.value === 'compare') {
      intelQuery.messages = chatResults?.data?.imgMessages ? chatResults?.data?.imgMessages : []
      for (let i = 0; i < intelQuery.messages.length; i++) {
        let oriContent = intelQuery.messages[i].content
        if (oriContent && Array.isArray(oriContent)) {
          let files = []
          for (let j = 0; j < oriContent.length; j++) {
            if (oriContent[j].type === 'image_url') {
              files.push(oriContent[j]?.image_url?.image)
            }
          }
          intelQuery.messages[i].files = files
          intelQuery.messages[i].content = oriContent.find(content_item => content_item.type === 'text').text
        }
      }
    } else {
      intelQuery.messages = chatResults?.data?.messages ? chatResults?.data?.messages : []
    }
    if (chatResults.data) {
      recordId.value = chatResults.data.id
    } else {
      recordId.value = ''
    }
    nextTick(() => {
      // 滚动到底部
      if (messageContainerIntel.value) {
        const messages = messageContainerIntel.value.children
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 2]
          if (lastMessage) {
            // 滚动到最后一个消息的开头部分
            lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }
      }
    })
  }
}
const getHistory = async val => {
  let agentHistoryList
  if ('compare' === currentAgentType.value) {
    agentHistoryList = await getImageRecognitionsByUserId(currentIntelId.value, val)
  } else {
    agentHistoryList = await getAgentChatByAgentId(currentIntelId.value, val)
  }

  if (agentHistoryList.status) {
    agentChatList.value = agentHistoryList.data
  }
}
// 格式化服务器返回的内容
const formatServerContent = content => {
  return content.replace(/\\n/g, '\n').replace(/\\t/g, '    ').replace(/\\r/g, '\r')
}
const addIntel = async () => {
  if (!isComputed.value) {
    if (!formIntel.value.name) {
      ElMessage.warning('请输入智能体名称')
      return
    }
    if (!formIntel.value.nickName) {
      ElMessage.warning('请输入智能体角色')
      return
    }
    isComputed.value = true
    request
      .post('/Agent/generateAgentDescription', {
        agent_name: formIntel.value.name,
        agent_role: formIntel.value.nickName,
        agent_tone: formIntel.value.tone,
        agent_description: formIntel.value.description
      })
      .then(res => {
        isComputed.value = false
        if (res.status) {
          formIntel.value.description = formatServerContent(res.data)
        }
      })
      .catch(err => {
        isComputed.value = false
        console.error('获取回复失败:', err)
      })
  } else {
    isComputed.value = false
    request.cancelRequest('/Agent/generateAgentDescription')
    ElMessage.success('请求已中止')
  }
}
// 组件挂载时订阅事件
onMounted(() => {
  eventBus.on('getHistoryData', getHistory)
  eventBus.on('setInfo', createIntel)
  eventBus.on('closeIntel', cancelIntel)

  eventBus.on('submit-sampleFile', submitSampleFile)
  eventBus.on('getRecord', getInfo)
  eventBus.on('getChatByAgentChatId', getChatByAgentChatId)
  eventBus.on('changeInfo', setInfo)
  eventBus.on('createNewConversation', createNewConversation)
  activeIndexIntel.value = -1
  adjustTextareaHeight('textareaInputIntel')
  getHistory()
  // 初始化时不展示流式输出
  limitIntelLoading.value = false
  intelQuery.messages = []
})
// 组件卸载时关闭 SSE 连接
onUnmounted(() => {
  eventBus.off('getHistoryData', getHistory)
  eventBus.off('setInfo', createIntel)
  eventBus.off('closeIntel', cancelIntel)
  eventBus.off('submit-sampleFile', submitSampleFile)
  eventBus.off('getRecord', getInfo)
  eventBus.off('getChatByAgentChatId', getChatByAgentChatId)
  eventBus.off('changeInfo', setInfo)
  eventBus.off('createNewConversation', createNewConversation)
  if (interval) {
    clearInterval(interval)
  }
  // 卸载时清空缓存文件
  fileInputAry.value = []
})
</script>
<style lang="less" scoped>
.scroll-to-bottom {
  position: absolute;
  right: 30px;
  bottom: 120px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1b6cff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(27, 108, 255, 0.3);
  transition: all 0.3s ease;
  z-index: 10;
}

/* 旋转圆环 */
.loading-ring {
  position: absolute;
  width: 52px; /* 比按钮稍大一些 */
  height: 52px; /* 比按钮稍大一些 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid #66c7d8;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.scroll-to-bottom:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(27, 108, 255, 0.4);
}

.scroll-to-bottom svg {
  width: 24px;
  height: 24px;
  color: white;
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
.sample_item::-webkit-scrollbar {
  width: 1px; /* 滚动条宽度 */
}
.sample_item::-webkit-scrollbar-track {
  background: #fff; /* 轨道背景颜色 */
  border-radius: 0px; /* 轨道圆角 */
}
.sample_item::-webkit-scrollbar-thumb {
  background: #fff; /* 滑块颜色 */
  border-radius: 0px; /* 滑块圆角 */
  border: 1px solid #fff; /* 滑块边框 */
}
.sample_item::-webkit-scrollbar-thumb:hover {
  background: #fff; /* 滑块悬停时的颜色 */
}
.sample_item {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  margin-top: 20px;
  scroll-behavior: smooth;
  .content_title {
    color: #333333;
    padding-top: 10px;
    font-size: 16px;
  }
  .content_tip {
    display: flex;
    flex-direction: row;
    margin-top: 20px;
    .content_robot {
      width: 46px;
      height: 46px;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        width: 36px;
        height: 36px;
      }
    }
    .tip_text {
      width: 100%;
      background-color: #fafafa;
      padding: 0px 20px;
      font-size: 14px;
      height: 46px;
      line-height: 46px;
      border-radius: 10px;
      letter-spacing: 1px;
      box-sizing: border-box;
      margin-left: 15px;
    }
  }
  .sample_chat {
    font-size: 14px;
    letter-spacing: 1px;
    width: 100%;
    .sample_chat_file {
      display: flex;
      flex-wrap: nowrap; /* 不允许换行 */
      gap: 10px 20px; /* 元素间距(可选) */
      justify-content: end; /* 左对齐(默认) */
      flex-direction: row-reverse;
      .item_files {
        display: flex;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 7px 15px;
        color: rgb(51, 51, 51);
        background-color: #eff6ff;
        display: flex;
        align-items: center;
        border-radius: 10px;
        cursor: pointer;
        box-sizing: border-box;
        flex: 1 0 calc(20% - 25px); /* 基础宽度25% 减间距 */
        max-width: calc(20% - 25px); /* 防止内容撑破 */
        .file_name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    .sample_chat_query {
      background-color: #1b6cff;
      border-radius: 10px;
      padding: 13px 15px;
      float: right;
      color: #fff;
      max-width: 600px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
.tip_load {
  font-size: 12px;
  padding-left: 5px;
  letter-spacing: 1px;
  line-height: 20px;
}
.select_content {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-radius: 10px;
  flex-direction: column;
  margin-bottom: 10px;
  .textarea {
    width: 862px;
  }
}
.tooltip-wrapper {
  position: relative;
  display: flex;
  .triangle {
    position: absolute;
    bottom: -9px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #fff;
  }
  .file-menu {
    position: absolute;
    bottom: 140%;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 8px 0;
    margin-bottom: 12px;
    z-index: 2000;
    min-width: 140px;
  }

  .menu-item {
    padding: 8px 16px;
    cursor: pointer;
    color: #333;
  }

  .menu-item:hover {
    background-color: #e6f4ff;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
}
.sampleArea {
  .el-textarea__inner {
    padding: 18px 100px 18px 15px !important;
  }
}
.sampleAreaAry {
  .el-textarea__inner {
    padding: 56px 100px 18px 15px !important;
  }
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
    right: 20px;
    bottom: 13px;
    cursor: pointer;
    transition: color 0.3s;
    display: flex;
  }
  .send-icon img {
    width: 30px;
    height: 30px;
  }
}

.empty {
  width: 80%;
  margin-left: 10%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .empty_create {
    width: 140px;
    height: 40px;
    border-radius: 10px;
    cursor: pointer;
    background-color: #1b6cff;
    color: #fff;
    text-align: center;
    line-height: 40px;
    font-size: 14px;
    margin-top: 40px;
  }
  .empty_text {
    color: #6a6a6a;
    font-size: 16px;
    margin-top: 40px;
  }
  .empty_img {
    width: 100px;
    height: 100px;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
.create_main {
  width: 80%;
  margin-left: 10%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: #fff;
  .create_ask {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    .main_content::-webkit-scrollbar {
      width: 1px; /* 滚动条宽度 */
    }
    .main_content::-webkit-scrollbar-track {
      background: #fff; /* 轨道背景颜色 */
      border-radius: 0px; /* 轨道圆角 */
    }
    .main_content::-webkit-scrollbar-thumb {
      background: #fff; /* 轨道背景颜色 */
      border-radius: 0px; /* 滑块圆角 */
      border: 1px solid #fff; /* 滑块边框 */
    }
    .main_content::-webkit-scrollbar-thumb:hover {
      background: #fff; /* 滑块悬停时的颜色 */
    }
    .main_content {
      width: 862px;
      box-sizing: border-box;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin: 0 auto 10px;
    }
  }
  .create_title {
    font-size: 18px;
    width: 100%;
    color: #262626;
    padding-top: 25px;
    display: flex;
    height: 26px;
    line-height: 26px;
    align-items: center;
    .create_back {
      width: 26px;
      height: 26px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      border: 1px solid #d0e4ff;
      border-radius: 26px;
      cursor: pointer;
      img {
        width: 14px;
        height: 14px;
        float: left;
      }
    }
  }
  .create_content {
    width: 726px;
    display: flex;
    flex-direction: column;
    margin-top: 100px;
    color: #333333;
    font-size: 14px;
    line-height: 18px;
    margin-left: 50px;
    .create_name {
      display: flex;
      flex-direction: column;
      .create_input {
        margin-top: 5px;
        :deep(.el-input__wrapper) {
          border: 1px solid #b7b8b9;
          height: 36px;
          border-radius: 4px;
          line-height: 36px;
          box-sizing: border-box;
          padding-left: 15px;
        }
      }
    }

    .create_set {
      display: flex;
      flex-direction: column;
      margin-top: 30px;
      position: relative;
      .create_ai {
        width: 116px;
        border-radius: 4px;
        height: 32px;
        font-size: 14px;
        text-align: center;
        box-sizing: border-box;
        background-color: #e6f4ff;
        color: #1b6cff;
        line-height: 32px;
        position: absolute;
        text-indent: 20px;
        right: 0;
        top: -15px;
        background-image: url('@/assets/ai.png');
        background-repeat: no-repeat;
        background-size: 19px 16px;
        background-position: 16px 8px;
        cursor: pointer;
      }
      .create_loading {
        width: 86px;
        border-radius: 4px;
        height: 32px;
        font-size: 14px;
        text-align: center;
        box-sizing: border-box;
        background-color: #e6f4ff;
        color: #1b6cff;
        line-height: 32px;
        position: absolute;
        text-indent: 20px;
        right: 0;
        top: -15px;
        background-image: url('@/assets/loading.gif');
        background-repeat: no-repeat;
        background-size: 19px 16px;
        background-position: 16px 8px;
        cursor: pointer;
      }
      .create_input {
        margin-top: 5px;
        :deep(.el-textarea__inner) {
          border-radius: 4px !important;
          padding: 10px 15px !important;
          height: 200px;
          resize: none;
          border-radius: 4px;
        }
      }
    }
    .create_btn {
      display: flex;
      margin-top: 25px;
      justify-content: center;
      font-size: 14px;
      .create_cancel {
        width: 120px;
        height: 32px;
        text-align: center;
        line-height: 32px;
        border: 1px solid #dedede;
        border-radius: 4px;
        color: #333333;
        cursor: pointer;
      }
      .create_confirm {
        width: 120px;
        height: 32px;
        text-align: center;
        line-height: 32px;
        border: 1px solid #1b6cff;
        border-radius: 4px;
        background-color: #1b6cff;
        color: #fff;
        margin-left: 10px;
        cursor: pointer;
      }
    }
  }
}
</style>
