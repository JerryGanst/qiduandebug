<template>
  <el-container class="container">
    <!-- 左侧栏 -->
    <AsizeComponent @change-history="getHistory"></AsizeComponent>
    <!-- 右侧内容 -->
    <el-container>
      <el-main>
        <div v-if="!currentQuestion" class="center-container">
          <div class="main_content">
            <div
              class="title"
              v-if="
                pageType === 'query' ||
                pageType === 'sample' ||
                pageType === 'it'
              "
            >
              <img
                src="../../assets/chat.deepseek.com_.png"
                class="title_src"
              />
              <div>
                <div class="title_top" style="line-height: 33px">
                  Hello!我是立讯技术百事通，有什么问题欢迎咨询
                </div>
                <div class="title_item">
                  <span>我可以帮您做这些事情</span>
                </div>
              </div>
            </div>
            <div
              class="content_list"
              v-if="pageType === 'query' || pageType === 'it'"
            >
              <div class="list_item">
                <div class="list_title">今日热搜</div>
                <div class="list_tip">深度搜索您关心的问题</div>
                <div class="list_arry">
                  <div
                    v-for="item in arrList"
                    class="arr_item"
                    v-if="pageType === 'query'"
                  >
                    <span>{{ item.index }}.</span>
                    <span class="item_hover" @click="submitQuestion(item.name)">
                      {{ item.name }}
                    </span>
                  </div>
                  <!-- <div v-for="item in itList" class="arr_item" v-if="pageType==='it'">
                      <span>{{ item.index }}.</span>
                      <span class="item_hover" @click="submitQuestion(item.name)">{{ item.name }}</span>
                    </div> -->
                </div>
              </div>
              <div class="list_item" style="margin-left: 20px">
                <div class="list_title">效率工具</div>
                <div class="list_tip">办公学习必备</div>
                <div class="img_list">
                  <div class="img_item" @click="changeType('tran')">
                    <div class="image"><img src="../../assets/1.png" /></div>
                    <div class="img_text">
                      <div class="text_title">翻译</div>
                      <div class="text_content">准确将各国语言翻译成中文</div>
                    </div>
                  </div>
                  <div
                    class="img_item"
                    style="margin-top: 10px"
                    @click="changeType('final')"
                  >
                    <div class="image"><img src="../../assets/2.png" /></div>
                    <div class="img_text">
                      <div class="text_title">总结</div>
                      <div class="text_content">
                        AI智能总结,让复杂信息一目了然
                      </div>
                    </div>
                  </div>
                  <div class="img_item" style="margin-top: 10px">
                    <div class="image"><img src="../../assets/3.png" /></div>
                    <div class="img_text">
                      <div class="text_title">更多功能</div>
                      <div class="text_content">开发中,敬请期待</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="content_list" v-if="pageType === 'sample'">
              <div class="list_item">
                <div class="list_title">今日热搜</div>
                <div class="list_tip">深度搜索您关心的问题</div>
                <div class="list_arry">
                  <div v-for="item in historyList" class="arr_item">
                    <span>{{ item.index }}.</span>
                    <span
                      class="item_hover"
                      @click="submitSampleTitle(item.name)"
                    >
                      {{ item.name }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="list_item" style="margin-left: 20px">
                <div class="list_title">效率工具</div>
                <div class="list_tip">办公学习必备</div>
                <div class="img_list">
                  <div class="img_item" @click="changeType('tran')">
                    <div class="image"><img src="../../assets/1.png" /></div>
                    <div class="img_text">
                      <div class="text_title">翻译</div>
                      <div class="text_content">准确将各国语言翻译成中文</div>
                    </div>
                  </div>
                  <div
                    class="img_item"
                    style="margin-top: 10px"
                    @click="changeType('final')"
                  >
                    <div class="image"><img src="../../assets/2.png" /></div>
                    <div class="img_text">
                      <div class="text_title">总结</div>
                      <div class="text_content">
                        AI智能总结,让复杂信息一目了然
                      </div>
                    </div>
                  </div>
                  <div class="img_item" style="margin-top: 10px">
                    <div class="image"><img src="../../assets/3.png" /></div>
                    <div class="img_text">
                      <div class="text_title">更多功能</div>
                      <div class="text_content">开发中,敬请期待</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="title" v-if="pageType === 'tran'">
              <img
                src="../../assets/chat.deepseek.com_.png"
                class="title_src"
              />
              <div>
                <div class="title_top" style="line-height: 33px">
                  立讯技术AI翻译专家
                </div>
                <div class="title_top">熟练掌握翻译技巧～您的翻译好帮手</div>
              </div>
            </div>
            <div v-if="pageType === 'tran' && finalIng" class="title_wait">
              <span>正在为您翻译,请稍等</span>
              <span v-if="!transData">{{ dots }}</span>
            </div>
            <div class="title_tran_tip">
              <div
                v-if="pageType === 'tran'"
                :style="{ padding: transQuest ? '13px 15px' : '0px' }"
              >
                {{ transQuest }}
              </div>
            </div>

            <div
              class="title_tran_data"
              v-if="pageType === 'tran'"
              :style="{ padding: transData ? '0px 15px' : '0px' }"
            >
              <p>{{ transData }}</p>
            </div>

            <div class="title" v-if="pageType === 'final'">
              <img
                src="../../assets/chat.deepseek.com_.png"
                class="title_src"
              />
              <div>
                <div class="title_top" style="line-height: 33px">
                  立讯技术AI智能总结
                </div>
                <div class="title_top">精准概括，助您快速理解长文本</div>
              </div>
            </div>
            <div v-if="pageType === 'final' && finalIng" class="title_wait">
              <span>正在为您总结,请稍等</span>
              <span v-if="!finalData.title">{{ dots }}</span>
            </div>
            <div class="title_final_tip">
              <div
                class="title_final_query"
                v-if="pageType === 'final'"
                :style="{ padding: finalData.title ? '10px 15px' : '0px' }"
              >
                <div>{{ finalQuest }}</div>
              </div>
            </div>
            <div
              class="title_final_data"
              v-if="pageType === 'final'"
              :style="{ padding: finalData.title ? '15px 15px' : '0px' }"
            >
              <div v-if="finalData.title">
                <span>概括 :</span>
                <span>{{ finalData.title }}</span>
              </div>
              <div v-if="finalData.data.length > 0" style="margin-top: 15px">
                <div>关键词 :</div>
                <div v-for="items in finalData.data">
                  {{ items }}
                </div>
              </div>
            </div>
          </div>
          <div class="select_content">
            <div
              class="tran_select"
              v-if="
                pageType === 'query' ||
                pageType === 'sample' ||
                pageType === 'it'
              "
            >
              <el-radio-group
                v-model="selectedMode"
                @change="changeMode(selectedMode)"
                :disabled="isSampleLoad"
              >
                <el-radio label="通用模式">通用模式</el-radio>
                <el-radio label="人资行政专题">人资行政专题</el-radio>
                <!-- <el-radio label="IT专题">IT专题</el-radio> -->
              </el-radio-group>
              <div class="mode_title">模式选择 :</div>
            </div>
            <div
              class="textarea"
              v-if="pageType === 'query' || pageType === 'it'"
            >
              <el-input
                v-model="newQuestion"
                placeholder="请输入您的问题,换行请按下Shift+Enter"
                style="width: 100%"
                class="custom-input"
                clearable
                @keydown="summitPost"
                @keyup.shift.enter="handleShiftEnter"
                ref="textareaInputQuery"
                type="textarea"
                :rows="dynamicRows"
                @input="adjustTextareaHeight('textareaInputQuery')"
              />
              <!-- 发送图标 -->
              <div
                class="send-icon"
                :class="{ hovered: isHovered }"
                @click="submitQuestionSend"
              >
                <img
                  :src="isSampleLoad ? imageC : newQuestion ? imageB : imageA"
                  class="arrow"
                />
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
              <div
                class="send-icon"
                :class="{ hovered: isHovered }"
                @click="submitSampleSend"
              >
                <img
                  :src="isSampleLoad ? imageC : newQuestion ? imageB : imageA"
                  class="arrow"
                />
              </div>
            </div>
            <div class="tran_select" v-if="pageType === 'tran'">
              <el-radio-group v-model="selectedLan">
                <el-radio label="中文">中文</el-radio>
                <el-radio label="英文">英文</el-radio>
                <el-radio label="西班牙语">西班牙语</el-radio>
                <el-radio label="越南语">越南语</el-radio>
              </el-radio-group>
              <div class="mode_title">翻译成 :</div>
            </div>
            <div class="textarea" v-if="pageType === 'tran'">
              <el-input
                v-model="newQuestion"
                placeholder="请输入您想翻译的文本,换行请按下Shift+Enter"
                style="width: 100%"
                class="custom-input"
                clearable
                @keydown="tranPost"
                @keyup.shift.enter="handleShiftEnter"
                ref="textareaInputTran"
                type="textarea"
                :rows="dynamicRows"
                @input="adjustTextareaHeight('textareaInputTran')"
              />
              <!-- 发送图标 -->
              <div
                class="send-icon"
                :class="{ hovered: isHovered }"
                @click="submitTranSend"
              >
                <img
                  :src="finalIng ? imageC : newQuestion ? imageB : imageA"
                  class="arrow"
                />
              </div>
            </div>

            <div class="textarea" v-if="pageType === 'final'">
              <el-input
                v-model="newQuestion"
                placeholder="请输入您想总结的文本,换行请按下Shift+Enter"
                style="width: 100%"
                class="custom-input"
                clearable
                @keydown="finalPost"
                @keyup.shift.enter="handleShiftEnter"
                ref="textareaInputFinal"
                type="textarea"
                :rows="dynamicRows"
                @input="adjustTextareaHeight('textareaInputFinal')"
              />
              <!-- 发送图标 -->
              <div
                class="send-icon"
                :class="{ hovered: isHovered }"
                @click="submitFinalSend"
              >
                <img
                  :src="finalIng ? imageC : newQuestion ? imageB : imageA"
                  class="arrow"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="center-container" style="padding-top: 0px">
          <div class="main_content" style="width: 860px">
            <div
              class="text_item"
              v-if="pageType === 'query' || pageType === 'it'"
            >
              <img
                src="../../assets/chat.deepseek.com_.png"
                class="title_src"
              />
              <div class="title_final">
                {{
                  isQueryStop
                    ? '请重新提出您的问题'
                    : currentObj.messages.type
                      ? '最佳答案已生成'
                      : '开始总结答案...'
                }}
              </div>
            </div>
            <div
              class="title_float"
              v-if="pageType === 'query' || pageType === 'it'"
            >
              <div>
                {{ currentObj.messages.isHistory ? '' : currentMessage }}
              </div>
            </div>
            <div
              v-if="pageType === 'query' || pageType === 'it'"
              class="title_tiQuery"
            >
              <div
                class="title_tiQuery_text"
                :style="{ padding: tipQuery ? '13px 15px' : '0px' }"
              >
                {{ tipQuery }}
              </div>
            </div>

            <MarkdownRenderer
              v-if="
                (pageType === 'query' || pageType === 'it') &&
                currentObj.messages.type === 'final_answer'
              "
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
              <!-- {{ it.document_title }}  ( 第 {{ it.page }} 页 ) -->
              {{ it.document_title }}(第{{ it.page.join('/') }}页)
            </a>
            <div
              class="query_common"
              v-if="
                (pageType === 'query' || pageType === 'it') &&
                currentObj.messages.type === 'final_answer'
              "
            >
              <!-- <div><img src='../../assets/refresh.png' style="width: 18px;height: 18px;margin-left: 10px;cursor: pointer;"></div> -->
              <div>
                <img
                  src="../../assets/up.png"
                  style="margin-left: 10px"
                  @click="upCommon"
                  class="query_common_img"
                />
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
              <img
                src="../../assets/chat.deepseek.com_.png"
                class="title_src"
              />
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

            <div
              class="tip_load"
              v-if="pageType === 'sample' && isSampleLoad && limitLoading"
            >
              <span>正在为您解答,请稍等</span>
              <span>{{ dots }}</span>
            </div>
            <div class="sample_item" ref="messageContainer">
              <div
                class="sample_chat"
                v-if="pageType === 'sample' && chatQuery.messages.length > 0"
                v-for="(item, index) in chatQuery.messages"
              >
                <div v-if="index % 2 === 0" class="sample_chat_query">
                  {{ item.content }}
                </div>
                <MarkdownRenderer
                  v-if="index % 2 !== 0"
                  :markdown="item.content"
                  type="answer"
                />
              </div>
            </div>
          </div>
          <div class="query_content">
            <!-- <el-button type="primary" @click="startNewConversation" class="back_set">
              开启新对话
            </el-button> -->
            <div
              class="tran_select"
              v-if="
                pageType === 'query' ||
                pageType === 'sample' ||
                pageType === 'it'
              "
            >
              <el-radio-group
                v-model="selectedMode"
                @change="changeMode(selectedMode)"
                :disabled="isSampleLoad"
              >
                <el-radio label="通用模式">通用模式</el-radio>
                <el-radio label="人资行政专题">人资行政专题</el-radio>
                <!-- <el-radio label="IT专题">IT专题</el-radio> -->
              </el-radio-group>
              <div class="mode_title">模式选择 :</div>
            </div>
            <div
              class="textarea"
              v-if="pageType === 'query' || pageType === 'it'"
            >
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
              <div
                class="send-icon"
                :class="{ hovered: isHovered }"
                @click="submitQuestionSend"
              >
                <img
                  :src="isSampleLoad ? imageC : newQuestion ? imageB : imageA"
                  class="arrow"
                />
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
              <div
                class="send-icon"
                :class="{ hovered: isHovered }"
                @click="submitSampleSend"
              >
                <img
                  :src="isSampleLoad ? imageC : newQuestion ? imageB : imageA"
                  class="arrow"
                />
              </div>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </el-container>
  <!-- 弹窗 -->


  <el-dialog
    v-model="commonVisible"
    title="评价"
    width="40%"
    :before-close="handleCommonClose"
  >
    <el-input
      v-model="commonQuestion"
      placeholder="请输入您的宝贵建议"
      style="width: 100%"
      class="custom-input"
      clearable
      type="textarea"
      rows="5"
    />
    <div
      class="button-item"
      style="
        display: flex;
        width: 100%;
        margin-top: 40px;
        flex-direction: row-reverse;
        margin-bottom: 20px;
      "
    >
      <el-button
        @click="commonVisible = false"
        style="width: 100px; height: 40px; margin-left: 15px"
      >
        取消
      </el-button>
      <el-button
        type="primary"
        @click="submitCommon"
        style="width: 100px; height: 40px"
      >
        提交
      </el-button>
    </div>
  </el-dialog>
</template>

<script setup>
// 10.180.248.140
import AsizeComponent from './component/asize.vue'
import { useShared } from '../../utils/useShared'
import { ElButton,  ElMessage} from 'element-plus' // 引入 ElMessage
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from 'vue'

import imageB from '../../../src/assets/arrow_blue.png'
import imageA from '../../../src/assets/arrow_gray.png'
import imageC from '../../../src/assets/stop.png'
import request from '../../utils/request' // 导入封装的 axios 方法
import MarkdownRenderer from './component/markdown.vue' // 引入 Markdown 渲染组件
// 静态导入图片

// 变量区域
const { currentQuestion,newQuestion,isSampleStop,isQueryStop,limitLoading,questions,answerList,currentId,pageType,selectedMode,currentObj,tipQuery,imitLoading,userInfo,activeIndex,queryTypes,chatQuery,currentAnswer,isLogin,dynamicRows,isSampleLoad  } = useShared()

const currentData = ref({})
const currentImage = ref(imageA) // 默认显示图片 B

const textareaInputQuery = ref(null) // 获取 textarea 元素的引用
const textareaInputSample = ref(null) // 获取 textarea 元素的引用
const textareaInputTran = ref(null) // 获取 textarea 元素的引用
const textareaInputFinal = ref(null) // 获取 textarea 元素的引用
const queryIng = ref(false)
const passwordVisible = ref(false)
const selectedLan = ref('中文')
const transData = ref('')
const transQuest = ref('')
const messageContainer = ref(null)
const sampleData = ref('')
const isTranStop = ref(false)
const isFinalStop = ref(false)
const finalData = ref({
  title: '',
  data: [],
})
const finalQuest = ref('')
const commonQuestion = ref('')
// 当前显示的消息内容
const currentMessage = ref('')
const dots = ref('.') // 初始点号
const commonVisible = ref(false)
// 用于存储每条消息的当前显示内容
const displayedMessages = ref([])
// 当前正在显示的消息索引
const currentMessageIndex = ref(0)
const sampleMessageIndex = ref(0)
// 消息数据
const mesObj = ref({
  messages: [],
  messageList: [],
})
const arrList = ref([
  {
    index: 1,
    name: '我进入立讯技术后如何选择导师',
  },
  {
    index: 2,
    name: '员工延假与销假如何进行',
  },
  {
    index: 3,
    name: '公司实习生的待遇怎么样',
  },
  {
    index: 4,
    name: '亲属回避包括哪些等级',
  },
  {
    index: 5,
    name: '工人是否有宗教信仰的自由',
  },
])
const itList = ref([
  {
    index: 1,
    name: 'mes系统的基础数据怎么维护',
  },
  {
    index: 2,
    name: 'mes操作的常见异常处理',
  },
  {
    index: 3,
    name: '会议室建设标准',
  },
  {
    index: 4,
    name: '桌面云规划怎么做？',
  },
  {
    index: 5,
    name: '产线设备数据采集怎么做？',
  },
])
const historyList = ref([
  {
    index: 1,
    name: '中国的传统节日',
  },
  {
    index: 2,
    name: '国务院发布的法定节假日安排',
  },
  {
    index: 3,
    name: '如何锻炼腹肌',
  },
  {
    index: 4,
    name: '工作压力大如何缓解压力',
  },
  {
    index: 5,
    name: '东莞的旅游景点',
  },
])


const displayedText = ref('') // 当前显示的内容
let currentItemIndex = 0 // 当前显示的数据索引
let currentCharIndex = 0 // 当前显示的字符索引

const isDisabled = ref(false)

const limitQuery = ref('')
const limitSample = ref({
  messages: [],
})
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
const changeMode = (val) => {
  currentQuestion.value = false
  activeIndex.value = ''
  newQuestion.value = ''
  dynamicRows.value = 1
  currentId.value = ''
  pageType.value =
    selectedMode.value === '通用模式'
      ? 'sample'
      : selectedMode.value === '人资行政专题'
        ? 'query'
        : 'it'
  chatQuery.messages = []
}




// 点击取消
const handleCancel = () => {
  // ElMessage.info('已取消删除');
}

const changeImage = (newImage) => {
  currentImage.value = newImage
}

// 点号变化逻辑
const updateDots = () => {
  if (dots.value.length >= 5) {
    dots.value = '.' // 重置为一个点
  } else {
    dots.value += '.' // 增加一个点
  }
}
const toDoc = async (data) => {
  const query = {
    fileName: data.document_title,
  }
  try {
    // 替换为实际的后端接口地址
    const response = await fetch(
      'http://10.180.248.140:8080/Files/getFileInfoByName',
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      }
    )
    const res = await response.json()
    if (res.status) {
      if (res.data && res.data.fileLink) {
        window.open(res.data.fileLink, '_blank')
      }
    }
  } catch (error) {
    // loadingInstance.close();
    console.error('获取回复失败:', error)
    // botMessage.text = '抱歉，暂时无法获取回复';
  }
}
const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}

const handleCommonClose = (done) => {
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
  currentObj.value.messages.sources.forEach((item) => {
    const key = `${item.document_id}-${item.document_title}`
    if (!map.has(key)) {
      map.set(key, {
        document_id: item.document_id,
        document_title: item.document_title,
        page: new Set(),
      })
    }
    map.get(key).page.add(item.page)
  })

  map.forEach((value) => {
    result.push({
      document_title: value.document_title,
      page: Array.from(value.page).sort((a, b) => a - b),
    })
  })

  return result
})
// 动态调整 textarea 高度的方法
const adjustTextareaHeight = (val) => {
  const textareaRef =
    val === 'textareaInputQuery'
      ? textareaInputQuery
      : val === 'textareaInputSample'
        ? textareaInputSample
        : val === 'textareaInputTran'
          ? textareaInputTran
          : textareaInputFinal
  const textarea = textareaRef.value?.textarea // 获取 textarea 元素
  if (textarea) {
    // 重置行高，以便重新计算
    textarea.style.height = 'auto'
    // 获取计算后的样式
    const computedStyle = window.getComputedStyle(textarea)
    // 计算 lineHeight（考虑 Element Plus 的默认 line-height: 1.5）
    const lineHeight = parseFloat(computedStyle.lineHeight)
    // 计算 paddingTop 和 paddingBottom
    const paddingTop = parseFloat(computedStyle.paddingTop)
    const paddingBottom = parseFloat(computedStyle.paddingBottom)
    // 计算内容高度（减去 padding）
    const scrollHeight = textarea.scrollHeight - paddingTop - paddingBottom
    // 计算行数
    const rows = Math.floor(scrollHeight / lineHeight)

    // 只有当行数变化时，才更新 dynamicRows
    if (rows !== dynamicRows.value) {
      dynamicRows.value = Math.min(Math.max(rows, 1), 4) // 限制行数在 1 到 5 之间
    }

    // 根据行数动态设置 overflow-y
    if (rows > 4) {
      textarea.style.overflowY = 'auto' // 超过 5 行时显示滚动条
    } else {
      textarea.style.overflowY = 'hidden' // 小于等于 5 行时隐藏滚动条
    }
  }
}

const isObject = (variable) => {
  const type = Object.prototype.toString.call(variable)
  return type === '[object PointerEvent]' || type === '[object KeyboardEvent]'
}
// 逐个字显示消息内容的函数
const displayMessage = async (message) => {
  return new Promise((resolve) => {
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
const handleShiftEnter = () => {
  // Shift + Enter 时允许换行
  newQuestion.value += '\n'
}
const changeType = (val) => {
  activeIndex.value = ''
  pageType.value = val
}
const finalIng = ref(false)
const finalPost = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认的换行行为
    submitFinal()
  }
}
const submitFinal = async (val) => {
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
  changeImage(imageA)
  dynamicRows.value = 1
  const data = {
    user_id: userInfo.value.userid,
    question: newQuestion.value,
  }
  const limitQuery = newQuestion.value
  newQuestion.value = ''
  finalData.value = {
    title: '',
    data: [],
  }
  finalQuest.value = ''
  finalIng.value = true
  interval = setInterval(updateDots, 500) // 每 500ms 更新一次
  currentRequestUrl.value = '/AI/summarize'
  request
    .post('/AI/summarize', {
      user_id: userInfo.value.userid,
      question: limitQuery,
      // showLoading: true
    })
    .then((res) => {
      finalIng.value = false
      currentRequestUrl.value = ''
      clearInterval(interval)
      if (res.status) {
        finalQuest.value = limitQuery
        finalData.value.title = res.data.summary
        if (res.data.key_points) {
          finalData.value.data = res.data.key_points
        }
      }
    })
    .catch((err) => {
      console.error(err)
      finalIng.value = false
      clearInterval(interval)
    })
}
const samplePost = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认的换行行为
    if (isSampleLoad.value) {
      ElMessage.warning('有问答正在进行中,请稍后再试')
      return
    }
    submitSample()
  }
}
const tranPost = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认的换行行为
    submitTran()
  }
}
const upCommon = async () => {
  if (isDisabled.value) return // 如果按钮已禁用，直接返回
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
        content: '',
      },
      // showLoading: true
    })
    .then((res) => {
      if (res.status) {
        ElMessage.success('谢谢您的点赞,您的支持是我们最大的动力！')
      }
    })
    .catch((err) => {
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
        content: commonQuestion.value,
      },
      // showLoading: true
    })
    .then((res) => {
      if (res.status) {
        ElMessage.success('评价成功,我们会继续努力的！')
        commonVisible.value = false
        commonQuestion.value = ''
      }
    })
    .catch((err) => {
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
const submitFinalSend = () => {
  if (finalIng.value) {
    cancelCurrentRequest('final')
    return
  }
  submitFinal()
}

const submitSampleTitle = (val) => {
  if (isSampleLoad.value) {
    ElMessage.warning('有问答正在进行中,请稍后再试')
    return
  }
  submitSample(val)
}
const stopQuery = async () => {
  request
    .post('/AI/stop?userId=' + userInfo.value.userid, {
      // showLoading: true
    })
    .then((res) => {
      if (res.status) {
        // ElMessage.success('中止请求成功');
        cancelCurrentRequest('query')
      }
    })
    .catch((err) => {})
}
const submitSample = async (val) => {
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
  changeImage(imageA)
  dynamicRows.value = 1
  sampleMessageIndex.value = 0
  isSampleLoad.value = true
  limitLoading.value = true
  displayedText.value = '' // 当前显示的内容
  currentItemIndex = 0 // 当前显示的数据索引
  currentCharIndex = 0 // 当前显示的字符索引

  const currentData = {
    role: 'user',
    content: newQuestion.value,
  }
  let mes = {
    messages: [],
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
    queryAn(qData, '')
    isSampleLoad.value = false
    return
  }

  const anList = JSON.parse(JSON.stringify(answerList.value))
  const hasId = anList.some((item) => item.id === currentId.value)
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
      type: '',
    }
    queryObj.name = questions.value[k]
    queryObj.type = 'sample'
    const hasVal = limitData.some((item) => item.name === queryObj.name)
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
    .then((res) => {
      clearInterval(interval)
      isSampleLoad.value = false
      limitLoading.value = false
      currentRequestUrl.value = ''
      if (res.status) {
        limitSample.value = {
          messages: [],
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
    .catch((err) => {
      currentRequestUrl.value = ''
      clearInterval(interval)
      console.error(err)
    })
}
const submitTran = async (val) => {
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
  changeImage(imageA)
  dynamicRows.value = 1
  finalIng.value = true
  interval = setInterval(updateDots, 500) // 每 500ms 更新一次
  const limitQuest = newQuestion.value

  newQuestion.value = ''
  transQuest.value = ''
  transData.value = ''
  currentRequestUrl.value = '/AI/translate'
  request
    .post('/AI/translate', {
      user_id: userInfo.value.userid,
      source_text: limitQuest,
      target_language: selectedLan.value,
      // showLoading: true
    })
    .then((res) => {
      finalIng.value = false
      currentRequestUrl.value = ''
      clearInterval(interval)
      if (res.status) {
        transQuest.value = limitQuest
        transData.value = res.data
      }
    })

    .catch((err) => {
      finalIng.value = false
      clearInterval(interval)
    })
}
const summitPost = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认的换行行为
    submitQuestion()
  }
} 

const submitQuestion = async (val) => {
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
  changeImage(imageA)
  dynamicRows.value = 1
  currentMessageIndex.value = 0
  currentObj.value.messages = {}
  currentObj.value.messageList = []
  displayedMessages.value = []
  const queryValue = newQuestion.value
  tipQuery.value = queryValue
  newQuestion.value = ''
  queryIng.value = true
  isSampleLoad.value = true
  const addTitle = pageType.value === 'query' ? '(query)' : '(it)'
  if (questions.value.includes(queryValue + addTitle)) {
    queryIng.value = false
    const qData = queryValue + addTitle
    for (var i = 0; i < questions.value.length; i++) {
      if (qData === questions.value[i]) {
        activeIndex.value = i
      }
    }
    queryAn(qData, '')
    isSampleLoad.value = false
    return
  }
  if (!questions.value.includes(queryValue)) {
    questions.value.unshift(queryValue + addTitle)
    activeIndex.value = '0'
  }
  const limitData = JSON.parse(JSON.stringify(queryTypes.value))
  for (var k = 0; k < questions.value.length; k++) {
    const queryObj = {
      name: '',
      type: '',
    }
    queryObj.name = questions.value[k]
    queryObj.type = pageType.value
    const hasVal = limitData.some((item) => item.name === queryObj.name)
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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: queryValue,
        user_id: userInfo.value.userid,
        type: pageType.value === 'query' ? '人资行政专题' : 'IT专题',
      }),
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

      jsonStr.forEach((element) => {
        const type = JSON.parse(element).type
        if (type === 'final_answer') {
          queryIng.value = false
          isSampleLoad.value = false
          // loadingInstance.close();
          currentObj.value.messages = JSON.parse(element)
          currentObj.value.messages.isHistory = true
          postQuestion(JSON.parse(element), queryValue, pageType.value)
        } else {
          currentObj.value.messageList.push(JSON.parse(element))
        }
        if (currentObj.value.messageList.length > 0) {
          currentObj.value.messageList = Array.from(
            new Set(
              currentObj.value.messageList.map((message) => message.content)
            )
          ).map((content) => {
            return currentObj.value.messageList.find(
              (message) => message.content === content
            )
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

const postSample = async (ids) => {
  request
    .post('/Message/save', {
      userId: userInfo.value.userid,
      type: '通用模式',
      id: ids,
      data: chatQuery.messages,
      title: chatQuery.messages[0].content,
      // showLoading: true
    })
    .then((res) => {
      if (res.status) {
        currentId.value = res.data
        const id = currentId.value
        getHistory(id, 'sample')
      }
    })
    .catch((err) => {
      console.error('获取回复失败:', err)
    })
}

const postQuestion = async (obj, val, type) => {
  request
    .post('/Message/save', {
      userId: userInfo.value.userid,
      type: type === 'query' ? '人资行政专题' : 'IT专题',
      title: val,
      id: '',
      data: {
        question: val,
        answer: obj,
      },
      // showLoading: true
    })
    .then((res) => {
      if (res.status) {
        getHistory('', type, val)
      }
    })
    .catch((err) => {
      console.error('获取回复失败:', err)
    })
}

const getHistory = async (id, page, val) => {
  request
    .post('/Message/getMessageByUserId', {
      userId: userInfo.value.userid,
      // showLoading: true
    })
    .then((res) => {
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
            } else {
              answerList.value[i].title = answerList.value[i].title + '(sample)'
              questions.value.push(answerList.value[i].title)
            }
          }
          questions.value = questions.value.reduce((acc, current) => {
            if (!acc.find((item) => item === current)) {
              acc.push(current)
            }
            return acc
          }, [])
          for (var k = 0; k < answerList.value.length; k++) {
            const obj = {
              name: '',
              type: '',
            }
            obj.name = answerList.value[k].title
            obj.type =
              answerList.value[k].type === '人资行政专题'
                ? 'query'
                : answerList.value[k].type === 'IT专题'
                  ? 'it'
                  : 'sample'
            const hasVal = limitData.some((item) => item.name === obj.name)
            if (!hasVal) {
              limitData.push(obj)
            }
          }
          queryTypes.value = JSON.parse(JSON.stringify(limitData))
        }
        for (var j = 0; j < answerList.value.length; j++) {
          if (
            res.data[j].type === '人资行政专题' ||
            res.data[j].type === 'IT专题'
          ) {
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
          if (page === 'query' || page === 'it') {
            for (var h = 0; h < answerList.value.length; h++) {
              if (val === answerList.value[h].title.replace(/\([^)]*\)/g, '')) {
                activeIndex.value = h
                tipQuery.value = answerList.value[h].title.replace(
                  /\([^)]*\)/g,
                  ''
                )
              }
            }
          }
        }
      }
    })
    .catch((err) => {
      console.error('获取回复失败:', err)
    })
}



// 终止请求方法
const cancelCurrentRequest = (val) => {
  request.cancelRequest(currentRequestUrl.value)
  ElMessage.success('请求已中止')
  if (val === 'sample') {
    isSampleLoad.value = false
    limitLoading.value = false
    isSampleStop.value = true
    chatQuery.messages.pop()
    activeIndex.value = ''
    // currentQuestion.value = false
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
    // currentQuestion.value = false
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

watch(isSampleLoad, (newValue) => {
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

// 组件挂载后初始化
onMounted(() => {
  adjustTextareaHeight(textareaInputSample.value) // 初始调整高度
})
// 组件卸载时关闭 SSE 连接
onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>

<style lang="less">
.el-container {
  background-color: #fff;
}
.user-info-popup {
  text-align: center;
  .user-info {
    display: flex;
    align-items: center;
    justify-content: center;
    .el_avatar {
      img {
        width: 100%;
        height: 100%;
      }
    }
    .user-details {
      margin-left: 10px;
      text-align: center;

      .username {
        font-weight: bold;
      }
    }
  }
}

.el-main {
  padding: 0px !important;
  background: linear-gradient(
    to bottom,
    rgba(197, 208, 213, 0.2),
    /* 淡蓝色，透明度 60% */ rgba(188, 214, 218, 0.1)
      /* 更淡的蓝色，透明度 60% */
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
            margin-top: 70px;
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
            /* 淡蓝色，透明度 60% */ rgba(224, 247, 250, 0.3)
              /* 更淡的蓝色，透明度 60% */
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
