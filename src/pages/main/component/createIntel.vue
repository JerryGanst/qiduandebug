<template>
  <div class="create_main" v-if="isCreate">
    <div class="create_title">
      <span class="create_back" @click="cancelIntel"><img src="@/assets/return.png" /></span>
      <span style="padding-left: 12px">{{ type === 'edit' ? '编辑智能体' : '创建智能体' }}</span>
    </div>
    <div class="create_content">
      <div class="create_name">
        <div class="create_text">
          <span style="color: #ff4d4f">*</span>
          <span style="padding-left: 5px">智能体名称</span>
        </div>
        <div class="create_input">
          <el-input placeholder="给您的智能体取个名字吧" style="width: 100%" v-model="formIntel.name" maxlength="15">
            <template #suffix>
              <span class="char-counter">{{ formIntel.name.length }}/15</span>
            </template>
          </el-input>
        </div>
      </div>
      <div class="create_name" style="margin-top: 20px">
        <div class="create_text">
          <span style="color: #ff4d4f">*</span>
          <span style="padding-left: 5px">智能体应该扮演什么角色</span>
        </div>
        <div class="create_input">
          <el-input placeholder="输入你的角色" style="width: 100%" v-model="formIntel.nickName" maxlength="15">
            <template #suffix>
              <span class="char-counter">{{ formIntel.nickName.length }}/15</span>
            </template>
          </el-input>
        </div>
      </div>
      <div class="create_name" style="margin-top: 20px">
        <div class="create_text">
          <span style="padding-left: 5px">智能体和您对话时的语气</span>
        </div>
        <div class="create_input">
          <el-input
            placeholder="给你的智能体设定一个语气吧"
            style="width: 100%"
            v-model="formIntel.tone"
            maxlength="15"
          >
            <template #suffix>
              <span class="char-counter">{{ formIntel.tone.length }}/15</span>
            </template>
          </el-input>
        </div>
      </div>
      <div class="create_set">
        <div @click="addIntel" :class="isComputed ? 'create_loading' : 'create_ai'">
          {{ isComputed ? '停止' : '智能补充' }}
        </div>
        <div class="create_text">
          <span style="color: #ff4d4f">*</span>
          <span style="padding-left: 5px">设定</span>
        </div>
        <div class="create_input">
          <el-input
            :placeholder="placeholderText"
            style="width: 100%; white-space: pre; font-family: monospace"
            v-model="formIntel.description"
            type="textarea"
          ></el-input>
        </div>
      </div>
      <div class="create_btn">
        <div class="create_cancel" @click="cancelIntel">取消</div>
        <div class="create_confirm" @click="createData()" v-if="type === 'create'">创建</div>
        <div class="create_confirm" @click="createData('edit')" v-if="type === 'edit'">保存</div>
      </div>
    </div>
  </div>
  <div v-else class="create_main">
    <div v-if="intelList.length > 0" class="create_ask">
      <div class="main_content">
        <div class="sample_item" ref="messageContainerIntel">
          <div class="content_title">{{ currentIntel.name }}</div>
          <div class="content_tip">
            <div class="content_robot"><img src="@/assets/robot.png" /></div>
            <div class="tip_text">
              Hi,我是你创建的智能体{{ currentIntel.name }},在这段对话中，我将扮演{{ currentIntel.role }}的角色
            </div>
          </div>
          <div
            class="sample_chat"
            v-if="intelQuery.messages.length > 0 && !limitIntelLoading"
            v-for="(item, index) in intelQuery.messages"
          >
            <div
              v-if="index % 2 === 0 && item.files && item.files.length > 0"
              class="sample_chat_file"
              :style="{ marginTop: index === 0 ? '28px' : '40px' }"
            >
              <div v-for="its in item.files" class="item_files" @click="showListFile(its)">
                <span style="display: flex; align-items: center">
                  <img
                    :src="
                      its.originalFileName.endsWith('txt')
                        ? text
                        : its.originalFileName.endsWith('pdf')
                          ? pdf
                          : its.originalFileName.endsWith('ppt') || its.originalFileName.endsWith('pptx')
                            ? ppt
                            : its.originalFileName.endsWith('xls') || its.originalFileName.endsWith('xlsx')
                              ? excel
                              : word
                    "
                    style="width: 24px; height: 30px"
                  />
                </span>
                <span style="padding-left: 10px" class="file_name">{{ its.originalFileName }}</span>
              </div>
            </div>
            <!-- <div class="tip_load" v-if="index === intelQuery.messages.length - 1 && limitIntelLoading">
              <span><img src="@/assets/robot.png" style="width: 36px; height: 36px" /></span>
              <span style="padding-left: 10px">正在为您解答,请稍等</span>
              <span>{{ dots }}</span>
            </div> -->
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
          <div
            class="sample_chat"
            v-if="intelCurrent.messages.length > 0 && limitIntelLoading"
            v-for="(item, index) in intelCurrent.messages"
          >
            <div
              v-if="index % 2 === 0 && item.files && item.files.length > 0"
              class="sample_chat_file"
              :style="{ marginTop: index === 0 ? '30px' : '40px' }"
            >
              <div v-for="its in item.files" class="item_files" @click="showListFile(its)">
                <span style="display: flex; align-items: center">
                  <img
                    :src="
                      its.originalFileName.endsWith('txt')
                        ? text
                        : its.originalFileName.endsWith('pdf')
                          ? pdf
                          : its.originalFileName.endsWith('ppt') || its.originalFileName.endsWith('pptx')
                            ? ppt
                            : its.originalFileName.endsWith('xls') || its.originalFileName.endsWith('xlsx')
                              ? excel
                              : word
                    "
                    style="width: 24px; height: 30px"
                  />
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
            <!-- <div v-if="index % 2 !== 0" class="stream-response">
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
              <MarkdownRenderer v-if="item.hasSplit" :markdown="item.after" class="normal-text" />
            </div> -->
          </div>
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
                <img
                  :src="
                    item.originalFileName.endsWith('txt')
                      ? text
                      : item.originalFileName.endsWith('pdf')
                        ? pdf
                        : item.originalFileName.endsWith('ppt') || item.originalFileName.endsWith('pptx')
                          ? ppt
                          : item.originalFileName.endsWith('xls') || item.originalFileName.endsWith('xlsx')
                            ? excel
                            : word
                  "
                  style="width: 22px; height: 28px"
                />
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
                  <div class="menu-item" @click="handleFileSelect('knowledge', 'sample')">从知识库读取</div>
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
    <div class="empty" v-else>
      <div class="empty_img"><img src="@/assets/kong.png" /></div>
      <div class="empty_text">暂无智能体</div>
      <div class="empty_create" @click="createIntel('create')">创建智能体</div>
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
import { ref, onMounted, onUnmounted, nextTick, toRaw } from 'vue'
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
import word from '@/assets/w.png'
import text from '@/assets/text.png'
import pdf from '@/assets/pdf.png'
import excel from '@/assets/excl.png'
import ppt from '@/assets/ppt.png'
import MarkdownRenderer from '../component/markdown.vue' // 引入 Markdown 渲染组件
const {
  intelList,
  isCreate,
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
  recordId
} = useShared()
const formIntel = ref({
  name: '',
  description: '',
  nickName: '',
  tone: '',
  id: ''
})
const isIntelLoad = ref(false)
const loadingIntelId = ref('')
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
let interval
const placeholderText = ref(`# 设定
你是一位营销文案奇才，擅长通过对话引导用户明确其产品或服务需求，并能创作出既幽默诙谐又信息准确、吸引力十足的广告语、宣传文案和社交媒体内容。

#  技能
## 技能1：需求挖掘与沟通
- 通过提问和互动，帮助用户清晰定义他们的产品特性和目标受众。
- 识别用户的核心价值主张，并将其转化为文案的关键信息。`)

const setInfo = id => {
  const anList = JSON.parse(JSON.stringify(answerListIntel.value))
  for (var i = 0; i < answerListIntel.value.length; i++) {
    if (id === answerListIntel.value[i].id) {
      currentIntel.value = anList[i].persona
    }
  }
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
  isCreate.value = true
}
const cancelIntel = () => {
  isCreate.value = false
}
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
  if (isIntelLoad && loadingIntelId.value && loadingIntelId.value === currentIntelId.value) {
    stopQuery()
    return
  }
  submitSample()
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
  // let title = ''
  // for (var i = 0; i < answerListIntel.value.length; i++) {
  //   if (
  //     intelQuery.messages[intelQuery.messages.length - 2].content ===
  //     answerListIntel.value[i].data[answerListIntel.value[i].data.length - 2].content
  //   ) {
  //     title = answerListIntel.value[i].title
  //   }
  // }
  const id = recordId.value
  const agentId = currentIntelId.value
  postSample(id, agentId, '11', mes)
  // limitIntelId.value = ''
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
const postSample = async (id, agentId, title, mes) => {
  let num = parseInt(sessionStorage.getItem('count'))
  num = num + 1
  sessionStorage.setItem('count', num)
  // let titleStr = ''
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  request
    .post('/Agent/saveAgentChat', {
      userId: userInfo.id,
      id: id,
      agentId: agentId,
      messages: mes,
      title: title
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        // recordId.value = res.data.id
        getHistory()
        // currentIntelId.value = res.data
        // const id = currentIntelId.value
        // getHistory(id)
      } else {
        ElMessage.warning(res.message)
      }
    })
    .catch(err => {
      console.error('获取回复失败:', err)
    })
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
  let id = recordId.value
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
    const container = document.querySelector('.message-container')
    if (container) {
      container.scrollTop = container.scrollHeight + 100
    }
  })
}
const quickJSONCheck = str => {
  if (typeof str !== 'string') return false
  str = str.trim()
  return (str.startsWith('{') && str.endsWith('}')) || (str.startsWith('[') && str.endsWith(']'))
}
const submitSample = async (val, isRefresh) => {
  const fileInput = fileInputAry.value
  if (fileInput.length === 0 || !fileInput) {
    if (!checkIntelData(val)) {
      return
    }
  }
  if (val) {
    intelQuestion.value = val
  }
  const id = recordId.value
  const agentId = currentIntelId.value
  loadingIntelId.value = agentId
  const queryValue = intelQuestion.value
  isIntelStop.value = false
  limitQuery.value = intelQuestion.value
  limitIntelLoading.value = true
  dynamicRows.value = 1
  isIntelLoad.value = true

  const userInfo = JSON.parse(localStorage.getItem('userInfo'))

  if (intelQuery.messages.length === 1 && intelQuery.messages[0].files) {
    intelQuery.messages = []
  }
  let filesSample = []
  if (fileInput && fileInput.length > 0) {
    for (var me = 0; me < fileInput.length; me++) {
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
  let mes = {
    messages: []
  }
  if (isRefresh) {
    intelQuery.messages.length -= 2
  }
  mes = JSON.parse(JSON.stringify(intelQuery))
  mes.messages.push(currentData)
  const params = JSON.parse(JSON.stringify(mes))
  for (var j = 0; j < params.messages.length; j++) {
    if (j % 2 === 0) {
      params.messages[j].role = 'user'
    } else {
      params.messages[j].role = 'assistant'
    }
  }
  params.userId = userInfo.id
  params.model = 0
  params.files = filesSample
  params.agentId = currentIntelId.value
  intelQuestion.value = ''
  let title = ''

  interval = setInterval(updateDots, 500)

  nextTick(() => {
    if (messageContainerIntel.value) {
      messageContainerIntel.value.scrollTop = messageContainerIntel.value.scrollHeight
    }
  })
  // currentRequestUrl.value = '/AI/chatStream'
  const controller = new AbortController()
  const assistantMsg = { role: 'assistant', content: '', before: '', after: '', hasSplit: false, isNewData: true }
  mes.messages.push(assistantMsg)
  // 使用一个对象记录哪些 content 已经有 user 了
  intelCurrent.messages = mes.messages
  intelQuery.isLoading = true
  const isThink = false
  fileInputAry.value = []
  fileAry.value = []
  // intelQuery.messages = params.messages
  try {
    // 替换为实际的后端接口地址
    const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/AI/agentChat', {
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
    let isFirstChunk = true // 标记是否为第一个数据块

    // 新增防抖更新机制
    let updateTimer
    const scheduleUpdate = () => {
      clearTimeout(updateTimer)
      updateTimer = setTimeout(() => {
        intelCurrent.messages.splice(intelCurrent.messages.length - 1, 1, { ...assistantMsg })
        autoScroll()
      }, 100) // 100ms更新间隔
    }

    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        clearInterval(interval)
        isIntelLoad.value = false
        limitIntelLoading.value = false
        intelQuery.isLoading = false
        limitIntelId.value = ''
        currentRequestUrl.value = ''
        loadingIntelId.value = ''
        intelQuery.messages = JSON.parse(JSON.stringify(intelCurrent.messages))
        const query = intelQuery.messages
        nextTick(() => {
          // dynamicRows.value = 1
          adjustTextareaHeight('textareaInputIntel')
          // adjustTextareaHeight('textareaInputSampleCurrent')
          // 滚动到底部
          if (messageContainerIntel.value) {
            const messages = messageContainerIntel.value.children
            if (messages.length > 0) {
              const lastMessage = messages[messages.length - 2]
              // 滚动到最后一个消息的开头部分
              lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            // messageContainerIntel.value.scrollTop = messageContainerIntel.value.scrollHeight
          }
        })
        postSample(id, agentId, queryValue, query)
        break
      }
      buffer += decoder.decode(value, { stream: true })
      // 使用更安全的分割方式（避免截断 JSON 结构）[3](@ref)
      const chunks = buffer.split(/(?=data:)/g)
      buffer = chunks.pop() || ''
      if (quickJSONCheck(buffer)) {
        const jsonData = JSON.parse(buffer)
        if (jsonData.code === 400) {
          ElMessage.error('文本过长，请重新尝试')
        }
      }

      chunks.forEach(chunk => {
        // 1. 修复正则匹配语法
        const jsonMatch = chunk.match(/data:\s*({[\s\S]*?})(?=\ndata:|\n\n|$)/)
        // 2. 添加条件判断包裹
        if (jsonMatch) {
          if (messageContainerIntel.value) {
            messageContainerIntel.value.scrollTop = messageContainerIntel.value.scrollHeight
          }
          try {
            const { content } = JSON.parse(jsonMatch[1])

            // 核心逻辑：逐字处理
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

            // 立即更新视图（无需防抖）
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
    // queryIng.value = false
    nextTick(() => {
      // dynamicRows.value = 1
      adjustTextareaHeight('textareaInputIntel')
      // adjustTextareaHeight('textareaInputSampleCurrent')
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
        currentIntel.value.description = params.description
        isCreate.value = false
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
  for (var i = 0; i < val.length; i++) {
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
const getHistory = async val => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  request
    .post('/Agent/findAgentByUserId?userId=' + userInfo.id + '&keyword=' + (val ? val : ''))
    .then(res => {
      if (res.status) {
        answerListIntel.value = res.data
        intelList.value = []
        for (var i = 0; i < res.data.length; i++) {
          intelList.value.push(res.data[i].persona.name)
        }
        if (res.data.length > 0) {
          activeIndexIntel.value = 0
          currentIntel.value = answerListIntel.value[0].persona
          currentIntelId.value = answerListIntel.value[0].id
          getInfo(answerListIntel.value[0].id)
        }
      }
    })
    .catch(err => {
      console.error('获取回复失败:', err)
    })
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
  isCreate.value = false
  eventBus.on('getHistoryData', getHistory)
  eventBus.on('setInfo', createIntel)
  eventBus.on('closeIntel', cancelIntel)

  eventBus.on('submit-sampleFile', submitSampleFile)
  eventBus.on('getRecord', getInfo)
  eventBus.on('changeInfo', setInfo)
  activeIndexIntel.value = 0
  adjustTextareaHeight('textareaInputIntel')
  getHistory()
  intelQuery.messages = []
})
// 组件卸载时关闭 SSE 连接
onUnmounted(() => {
  eventBus.off('getHistoryData', getHistory)
  eventBus.off('setInfo', createIntel)
  eventBus.off('closeIntel', cancelIntel)
  eventBus.off('submit-sampleFile', submitSampleFile)
  eventBus.off('getRecord', getInfo)
  eventBus.off('changeInfo', setInfo)
  if (interval) {
    clearInterval(interval)
  }
})
</script>
<style lang="less" scoped>
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
    margin-left: 30px;
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
    align-items: center;
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
      max-width: 862px;
      box-sizing: border-box;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 10px;
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
