<template>
  <el-container class="container">
    <!-- 左侧栏 -->
    <AsizeComponent
      @change-history="getHistory"
      @set-isLaw="setlaw"
      @set-message="setMessage"
      @set-FileModel="setFileModel"
      @set-Net="setNet"
      ref="asizeRef"
    ></AsizeComponent>

    <!-- 右侧内容 -->
    <el-container>
      <el-main>
        <div
          v-if="contentType === 1"
          style="width: 100%; height: 100vh"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          @drop.prevent="handleDrop"
          :class="{ 'drag-over': isDragOver }"
        >
          <div v-if="!currentQuestion" class="center-container" :style="{ paddingTop: isDragOver ? '0px' : '80px' }">
            <Entry
              @submit-tran="submitTran"
              @submit-final="submitFinal"
              @submit-question="submitQuestion"
              @cancel-currentRequest="cancelCurrentRequest(val)"
              @submit-sample-title="submitSampleTitle"
              @sample-post="samplePost"
              @summit-post="summitPost"
              @submit-tranSend="submitTranSend"
              @submit-finalSend="submitFinalSend"
              @up-common="upCommon"
              @down-common="downCommon"
              @refresh-data="refreshData"
              @submit-questionSend="submitQuestionSend"
              @submit-itSend="submitITSend"
              @submit-lawSend="submitLawSend"
              @submit-sampleSend="submitSampleSend"
              ref="entryRef"
            ></Entry>
          </div>

          <div v-else class="center-container" style="padding-top: 0px">
            <DragUpload v-if="isDragOver" ref="dragUploads"></DragUpload>
            <div class="main_content" v-if="!isDragOver" style="width: 860px">
              <div v-if="pageType === 'query' || pageType === 'it' || pageType === 'law'" class="title_tiQuery">
                <div class="title_tiQuery_text" :style="{ padding: tipQuery ? '13px 15px' : '0px' }">
                  {{ tipQuery }}
                </div>
              </div>
              <div class="title_float" v-if="pageType === 'query' || pageType === 'it' || pageType === 'law'">
                <span v-if="!currentObj.messages.type">
                  <img src="@/assets/robot.png" style="width: 36px; height: 36px" />
                </span>
                <span style="padding-left: 10px" v-if="!currentObj.messages.type">
                  {{ currentObj.messages.isHistory ? '' : currentMessage }}
                </span>
              </div>
              <div
                class="title_float"
                :style="{ paddingTop: currentObj.list?.content ? '10px' : '0px' }"
                v-if="
                  (pageType === 'query' || pageType === 'it' || pageType === 'law') &&
                  currentObj.messages.type === 'final_answer'
                "
              >
                <span>
                  {{ currentObj.list?.content }}
                </span>
              </div>
              <MarkdownRenderer
                v-if="
                  (pageType === 'query' || pageType === 'it' || pageType === 'law') &&
                  currentObj.messages.type === 'final_answer' &&
                  currentObj.messages.content
                "
                :markdown="currentObj.messages.content"
              />
              <div
                v-if="
                  (pageType === 'query' || pageType === 'it' || pageType === 'law') &&
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
                  (pageType === 'query' || pageType === 'it' || pageType === 'law') &&
                  currentObj.messages.type === 'final_answer' &&
                  currentObj.messages.sources
                "
                @click="toDoc(it)"
              >
                {{ it.document_title }}(第{{ it.page.join('/') }}页)
              </a>
              <div
                class="query_common"
                v-if="
                  (pageType === 'query' || pageType === 'it' || pageType === 'law') &&
                  currentObj.messages.type === 'final_answer'
                "
              >
                <div>
                  <img
                    src="@/assets/refresh.png"
                    style="margin-left: 10px"
                    class="query_common_img"
                    @click="refreshData"
                  />
                </div>
                <div>
                  <img src="@/assets/up.png" @click="upCommon" class="query_common_img" style="margin-left: 15px" />
                </div>
                <div>
                  <img src="@/assets/down.png" style="margin-left: 15px" @click="downCommon" class="query_common_img" />
                </div>
              </div>

              <div class="sample_item" ref="messageContainer">
                <div
                  class="sample_chat"
                  v-if="pageType === 'sample' && chatQuery.messages.length > 0 && !limitLoading"
                  v-for="(item, index) in chatQuery.messages"
                >
                  <div
                    v-if="index % 2 === 0 && item.files && item.files.length > 0"
                    class="sample_chat_file"
                    :style="{ marginTop: index === 0 ? '68px' : '40px' }"
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
                            ? '70px'
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
                  v-if="pageType === 'sample' && limitLoading && chatCurrent.messages.length > 0 && limitLoading"
                  v-for="(item, index) in chatCurrent.messages"
                >
                  <div
                    v-if="index % 2 === 0 && item.files && item.files.length > 0"
                    class="sample_chat_file"
                    :style="{ marginTop: index === 0 ? '70px' : '40px' }"
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
                            ? '70px'
                            : '40px'
                        : '0px',
                      padding: item.content ? '13px 15px' : '0px'
                    }"
                  >
                    {{ item.content }}
                  </div>
                  <div class="tip_load" v-if="index === chatCurrent.messages.length - 1">
                    <span><img src="@/assets/robot.png" style="width: 36px; height: 36px" /></span>
                    <span style="padding-left: 10px">正在为您解答,请稍等</span>
                    <span>{{ dots }}</span>
                  </div>
                  <!-- <MarkdownRenderer v-if="index % 2 !== 0" :markdown="item.content" type="answer" /> -->
                  <div v-if="index % 2 !== 0" class="stream-response">
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
                </div>
              </div>

              <div class="query_common" v-if="pageType === 'sample' && !limitLoading && chatQuery.messages.length > 0">
                <div>
                  <img
                    src="@/assets/refresh.png"
                    style="margin-left: 10px"
                    class="query_common_img"
                    @click="refreshData"
                  />
                </div>
                <div>
                  <img src="@/assets/up.png" @click="upCommon" class="query_common_img" style="margin-left: 15px" />
                </div>
                <div>
                  <img src="@/assets/down.png" style="margin-left: 15px" @click="downCommon" class="query_common_img" />
                </div>
              </div>
            </div>
            <div class="query_content" v-if="!isDragOver">
              <div
                class="tran_select"
                v-if="pageType === 'query' || pageType === 'sample' || pageType === 'it' || pageType === 'law'"
              >
                <el-radio-group v-model="selectedMode" @change="changeMode" :disabled="isSampleLoad">
                  <el-radio-button label="通用模式" value="通用模式">通用模式</el-radio-button>
                  <!-- <el-radio-button label="人资行政专题" value="人资行政专题" :disabled="!isNet">人资行政专题</el-radio-button>
                  <el-radio-button label="IT专题" value="IT专题" :disabled="!isNet">IT专题</el-radio-button> -->
                  <!-- <el-tooltip content="该模式仅支持通过office网络访问" placement="top" v-if="!isNet">
                    <el-radio-button label="人资行政专题" value="人资行政专题" disabled>人资行政专题</el-radio-button>
                  </el-tooltip>
                  <el-radio-button label="人资行政专题" value="人资行政专题" v-if="isNet">人资行政专题</el-radio-button>
                  <el-tooltip content="该模式仅支持通过office网络访问" placement="top" v-if="!isNet">
                    <el-radio-button label="IT专题" value="IT专题" disabled>IT专题</el-radio-button>
                  </el-tooltip>
                  <el-radio-button label="IT专题" value="IT专题" v-if="isNet">IT专题</el-radio-button> -->
                  <el-radio-button label="人资行政专题" value="人资行政专题">人资行政专题</el-radio-button>
                  <el-radio-button label="IT专题" value="IT专题">IT专题</el-radio-button>
                  <el-tooltip
                    content="该模式仅支持通过office网络访问"
                    placement="top"
                    v-if="isLaw === 'true' && !isNet"
                  >
                    <el-radio-button label="法务专题" value="法务专题" disabled>法务专题</el-radio-button>
                  </el-tooltip>
                  <el-radio-button label="法务专题" value="法务专题" v-if="isLaw === 'true' && isNet">
                    法务专题
                  </el-radio-button>
                </el-radio-group>
              </div>
              <div class="textarea" v-if="pageType === 'query' || pageType === 'it' || pageType === 'law'">
                <el-input
                  v-model="newQuestion"
                  placeholder="请输入您的问题,换行请按下Shift+Enter"
                  class="custom-input"
                  style="width: 100%"
                  @keydown.enter.prevent="summitPost"
                  @keyup.shift.enter.prevent="handleShiftEnter('textareaInputQuery')"
                  type="textarea"
                  :maxlength="4096"
                  ref="textareaInputQuery"
                  :rows="dynamicRows"
                  @input="adjustTextareaHeight('textareaInputQuery')"
                />
                <!-- 发送图标 -->
                <div class="send-icon">
                  <div
                    class="tooltip-wrapper"
                    @mouseenter="showModelTip = true"
                    @mouseleave="showModelTip = false"
                    v-if="pageType === 'query' || pageType === 'it'"
                  >
                    <img
                      :src="deepType ? deepSelect : deep"
                      class="arrow"
                      @click="checkDeepType"
                      style="margin-right: 10px"
                    />

                    <transition name="fade">
                      <div v-if="showModelTip" class="tooltip">
                        {{ !deepType ? '切换成deepSeek-R1模式' : '切换成普通模式' }}
                      </div>
                    </transition>
                  </div>
                  <img
                    :src="
                      isSampleLoad && (currentIndex || currentIndex == 0) && currentIndex == activeIndex
                        ? imageC
                        : newQuestion
                          ? imageB
                          : imageA
                    "
                    class="arrow"
                    v-if="isNet && pageType === 'query'"
                    @click="submitQuestionSend"
                  />
                  <img
                    :src="
                      isSampleLoad && (currentIndex || currentIndex == 0) && currentIndex == activeIndex
                        ? imageC
                        : newQuestion
                          ? imageB
                          : imageA
                    "
                    class="arrow"
                    v-if="isNet && pageType === 'it'"
                    @click="submitITSend"
                  />
                  <img
                    :src="
                      isSampleLoad && (currentIndex || currentIndex == 0) && currentIndex == activeIndex
                        ? imageC
                        : newQuestion
                          ? imageB
                          : imageA
                    "
                    class="arrow"
                    v-if="isNet && pageType === 'law'"
                    @click="submitLawSend"
                  />
                </div>
              </div>
              <div
                class="textarea"
                :class="[fileInputAry && fileInputAry.length > 0 ? 'sampleAreaAry' : 'sampleArea']"
                v-if="pageType === 'sample'"
              >
                <el-input
                  v-model="newQuestion"
                  placeholder="请输入您的问题,换行请按下Shift+Enter"
                  style="width: 100%"
                  class="custom-input"
                  clearable
                  @keydown.enter.prevent="samplePost"
                  @keyup.shift.enter.prevent="handleShiftEnter('textareaInputSample')"
                  ref="textareaInputSample"
                  :maxlength="4096"
                  type="textarea"
                  :rows="dynamicRows"
                  @input="adjustTextareaHeight('textareaInputSample')"
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
                    <img
                      src="@/assets/file.png"
                      class="arrow"
                      @click="showFileSample('sample')"
                      style="margin-right: 10px"
                    />
                    <!-- <transition name="fade">
                      <div v-if="showFileTip" class="tooltip">添加附件,单个大小不能超过50M</div>
                    </transition> -->
                    <transition name="fade">
                      <div v-if="showFileMenu" class="file-menu" @click.stop>
                        <div class="triangle"></div>
                        <div class="menu-item" @click="handleFileSelect('local', 'sample')">从本地读取</div>
                        <div class="menu-item" @click="handleFileSelect('knowledge', 'sample')">从知识库读取</div>
                      </div>
                    </transition>
                  </div>
                  <div class="tooltip-wrapper" @mouseenter="showModelTip = true" @mouseleave="showModelTip = false">
                    <img
                      :src="deepType ? deepSelect : deep"
                      class="arrow"
                      @click="checkDeepType"
                      style="margin-right: 10px"
                    />

                    <transition name="fade">
                      <div v-if="showModelTip" class="tooltip">
                        {{ !deepType ? '切换成deepSeek-R1模式' : '切换成普通模式' }}
                      </div>
                    </transition>
                  </div>
                  <img
                    :src="
                      isSampleLoad && (currentIndex || currentIndex == 0) && currentIndex == activeIndex
                        ? imageC
                        : newQuestion || fileInputAry.length > 0
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
          <FileUpload ref="fileRefs"></FileUpload>
          <commonUploadModal ref="commonUploadModals"></commonUploadModal>
          <FilePreUpload ref="filePreRef"></FilePreUpload>
        </div>
        <div v-if="contentType === 2" style="width: 100%; height: 100vh">
          <personModal v-if="fileModal === 1"></personModal>
          <commonModal ref="commonLedge" v-if="fileModal === 2"></commonModal>
        </div>
        <div v-if="contentType === 3">
          <createIntel></createIntel>
        </div>
      </el-main>
    </el-container>
  </el-container>
  <!-- 弹窗 -->

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
// 10.180.248.140
import AsizeComponent from './component/asize.vue'
import Entry from './component/entry.vue'
import FileUpload from './component/fileUploadModal.vue'
import FilePreUpload from './component/filePreModal.vue'
import commonUploadModal from './component/commonUploadModal.vue'
import commonModal from './component/commonModal.vue'
import personModal from './component/personModal.vue'
import DragUpload from './component/dragUpload.vue'
import createIntel from './component/createIntel.vue'
import { Document } from '@element-plus/icons-vue' // 引入需要的图标
import { useShared } from '@/utils/useShared'
import eventBus from '@/utils/eventBus'
import { componentSizeMap, ElButton, ElMessage } from 'element-plus' // 引入 ElMessage
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch, toRaw, onBeforeUnmount } from 'vue'
import imageB from '@/assets/arrow_blue.png'
import imageA from '@/assets/arrow_gray.png'
import imageC from '@/assets/stop.png'
import deep from '@/assets/deep.png'
import deepSelect from '@/assets/deepSelect.png'
import word from '@/assets/w.png'
import text from '@/assets/text.png'
import pdf from '@/assets/pdf.png'
import excel from '@/assets/excl.png'
import ppt from '@/assets/ppt.png'
import request from '@/utils/request' // 导入封装的 axios 方法
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
  chatCurrent,
  limitId,
  checkData,
  dots,
  messageContainer,
  deepType,
  checkDeepType,
  docIng,
  tranIng,
  limitAry,
  fileObj,
  showFileTip,
  showModelTip,
  fileAry,
  fileInputAry,
  isLaw,
  contentType,
  dragUploads,
  isDragOver,
  isNet,
  isCreate,
  currentIndex
} = useShared()

const queryIng = ref(false)
const asizeRef = ref(null)
const entryRef = ref(null)

const sampleData = ref('')
const commonLedge = ref(null)
const commonQuestion = ref('')
// 当前显示的消息内容
const currentMessage = ref('')
const filePreRef = ref(null)
const commonVisible = ref(false)
// 当前正在显示的消息索引
const currentMessageIndex = ref(0)
const isDisabled = ref(false)
const limitQuery = ref('')
const currentRequestUrl = ref('')
const fileRefs = ref(null)
const commonUploadModals = ref(null)
let interval
const wrapperRef = ref(null)
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
const fileModal = ref(1)
const setFileModel = val => {
  fileModal.value = val
}

const setNet = () => {
  nextTick(() => {
    const isNetValue = localStorage.getItem('isNet')
    isNet.value = isNetValue === 'true'
  })
}

const showListFile = val => {
  fileAry.value = []
  fileAry.value.push(val)
  filePreRef.value.openFile('sample')
}
const setMessage = val => {
  nextTick(() => {
    contentType.value = val
  })
}
const showFileMenu = ref(false)
const showFileSample = val => {
  showFileMenu.value = !showFileMenu.value
}
const handleDragOver = () => {
  if (pageType.value === 'query' || pageType.value === 'it' || pageType.value === 'law') {
    return
  }

  isDragOver.value = true
  nextTick(() => {
    if (entryRef.value) {
      entryRef.value.setDrag(isDragOver.value)
    }
  })
}
const getTextAfterLastDot = str => {
  const lastDotIndex = str.lastIndexOf('.')
  if (lastDotIndex === -1) return '' // 没有点号时返回空字符串
  return str.slice(lastDotIndex + 1)
}
const handleDragLeave = () => {
  if (pageType.value === 'query' || pageType.value === 'it' || pageType.value === 'law') {
    return
  }
  isDragOver.value = false
  nextTick(() => {
    if (entryRef.value) {
      entryRef.value.setDrag(isDragOver.value)
    }
  })
}
const handleDrop = e => {
  if (!isLogin.value) {
    isDragOver.value = false
    ElMessage.warning('请先登录再使用')
    return false
  }
  const files = Array.from(e.dataTransfer.files)
  if (!files[0]) {
    isDragOver.value = false
    return
  }
  const exception = getTextAfterLastDot(files[0].name)
  if (
    exception !== 'txt' &&
    exception !== 'doc' &&
    exception !== 'docx' &&
    exception !== 'ppt' &&
    exception !== 'pptx' &&
    exception !== 'xls' &&
    exception !== 'xlsx' &&
    exception !== 'pdf'
  ) {
    isDragOver.value = false
    ElMessage.warning('暂不支持此格式上传')
    return
  }
  const data = {
    name: files[0].name,
    percentage: 0,
    size: files[0].size,
    status: 'ready',
    raw: files[0]
  }
  nextTick(() => {
    dragUploads.value.setFiles(data)
  })

  // handleFileAdd(data)
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

// 点号变化逻辑
const updateDots = () => {
  if (dots.value.length >= 5) {
    dots.value = '.' // 重置为一个点
  } else {
    dots.value += '.' // 增加一个点
  }
}

const toDoc = async data => {
  if (!isNet.value) {
    ElMessage.warning('该模式仅支持通过office网络访问')
    return
  }
  request
    .post(
      '/Files/getFileLinkByName?fileName=' +
        data.document_title +
        '&target=' +
        (selectedMode.value === 'IT专题' ? 'IT' : selectedMode.value === '人资行政专题' ? 'HR' : 'Law')

      // showLoading: true
    )
    .then(res => {
      if (res.status) {
        if (res.data) {
          window.open(res.data, '_blank')
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

const submitFinal = async (val, isRefresh, ob) => {
  if (queryIng.value || docIng.value || tranIng.value || finalIng.value) {
    ElMessage.warning('有问答正在进行中,请稍后再试')
    return
  }
  if (!ob && !checkData(val)) {
    return
  }
  isDragOver.value = false
  const queryData = newQuestion.value
  limitAry.value = JSON.parse(JSON.stringify(answerList.value))
  newQuestion.value = ''
  finalData.value = {
    title: '',
    data: []
  }
  finalQuest.value = ''
  finalIng.value = true
  docIng.value = true
  let title = ''
  if (isRefresh) {
    let current = currentId.value
    if (!current) {
      current = answerList.value[activeIndex.value].id
    }
    const idx = answerList.value.findIndex(item => item.id === current)
    title = answerList.value[idx].title.replace(/\([^)]*\)/g, '')
    let limitTitle = ''
    limitTitle = questions.value[idx]
    questions.value.splice(idx, 1)
    answerList.value.splice(idx, 1)
    await asizeRef.value.deleteData(current, true)
    activeIndex.value = 0
    currentIndex.value = 0
    questions.value.unshift(limitTitle)
    const data = {
      data: {
        answer: '',
        question: '桌面云规划怎么做？',
        think: {}
      }
    }
  }
  if (!isRefresh) {
    const qData = '新对话' + '(final)'
    currentIndex.value = 0
    currentIndex.value = 0
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
  finalQuest.value = ob ? ob.originalFileName : queryData
  const passQuery = ob ? ob.originalFileName : queryData
  entryRef.value.changeDynamicRows()
  if (ob && !isPureObject(ob.fileId)) {
    const objSample = {
      fileId: ob.fileId,
      local: ob.local
    }
    ob.fileId = objSample
  }
  nextTick(() => {
    if (entryRef.value?.fileRef) {
      entryRef.value.fileRef.closeFile()
    }
  })
  activeIndex.value = 0
  request
    .post('/AI/summarize', {
      user_id: userInfo.value.id,
      question: passQuery,
      file: ob
        ? ob.fileId
        : {
            fileId: ''
          }
      // showLoading: true
    })
    .then(res => {
      finalIng.value = false
      docIng.value = false
      currentRequestUrl.value = ''
      currentIndex.value = ''
      clearInterval(interval)
      nextTick(() => {
        adjustTextareaHeight('textareaInputFinal')
      })
      if (res.status) {
        finalData.value.title = res.data.summary

        if (res.data.key_points) {
          finalData.value.data = res.data.key_points
        }
        const obj = {
          question: passQuery,
          answer: finalData.value
        }
        postFinal(obj, title.replace(/\([^)]*\)/g, ''), ob)
      } else {
        if (res.code === 400) {
          const obj = {
            question: passQuery,
            answer: ''
          }
          postFinal(obj, title.replace(/\([^)]*\)/g, ''), ob)
          ElMessage.warning(res.message)
        }
      }
    })
    .catch(err => {
      currentIndex.value = ''
      if (err.message !== 'canceled') {
        ElMessage.error('总结失败' + err.message)
      }

      finalIng.value = false
      docIng.value = false
      clearInterval(interval)
      nextTick(() => {
        adjustTextareaHeight('textareaInputFinal')
      })
    })
}
const samplePost = event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认的换行行为
    if (isSampleLoad.value || queryIng.value || docIng.value || tranIng.value || finalIng.value) {
      ElMessage.warning('有问答正在进行中,请稍后再试')
      return
    }
    submitSample()
  }
}

const refreshData = () => {
  if (isSampleLoad.value || queryIng.value || docIng.value || tranIng.value || finalIng.value) {
    ElMessage.warning('有问答正在进行中,请稍后再试')
    return
  }
  const anList = answerList.value
  if (pageType.value === 'query' || pageType.value === 'it' || pageType.value === 'law') {
    queryIng.value = false
    submitQuestion(tipQuery.value, true)
  } else if (pageType.value === 'tran') {
    let obj = ''
    if (activeIndex.value || activeIndex.value == 0) {
      const idx = anList.findIndex(item => item.data.question === transQuest.value)
      obj = anList[idx]?.data?.files
    }
    const val = transQuest.value
    submitTran(val, true, obj)
  } else if (pageType.value === 'final') {
    let obj = ''
    if (activeIndex.value || activeIndex.value == 0) {
      const idx = anList.findIndex(item => item.data.question === finalQuest.value)
      obj = anList[idx]?.data?.files
    }
    const val = finalQuest.value
    submitFinal(finalQuest.value, true, obj)
  } else if (pageType.value === 'sample') {
    let ary = []
    if (activeIndex.value || activeIndex.value == 0) {
      const length = anList[activeIndex.value].data.length
      if (length === 1) {
        ary = anList[activeIndex.value].data[0].files
      } else if (length > 1) {
        if (anList[activeIndex.value].data[length - 1].role === 'user') {
          ary = anList[activeIndex.value].data[length - 1].files
        } else {
          ary = anList[activeIndex.value].data[length - 2].files
        }
      }
    }
    fileInputAry.value = ary
    submitSample(chatQuery.messages[chatQuery.messages.length - 2].content, true)
  }
}
const upCommon = async () => {
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return false
  }
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
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return false
  }
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
  if (
    isSampleLoad.value &&
    (currentIndex.value || currentIndex.value == 0) &&
    currentIndex.value == activeIndex.value
  ) {
    stopQuery('query')
    return
  }
  submitQuestion()
}
const submitITSend = () => {
  if (
    isSampleLoad.value &&
    (currentIndex.value || currentIndex.value == 0) &&
    currentIndex.value == activeIndex.value
  ) {
    stopQuery('it')
    return
  }
  submitQuestion()
}
const submitLawSend = () => {
  if (
    isSampleLoad.value &&
    (currentIndex.value || currentIndex.value == 0) &&
    currentIndex.value == activeIndex.value
  ) {
    stopQuery('law')
    return
  }
  submitQuestion()
}

const submitSampleSend = () => {
  if (
    isSampleLoad.value &&
    (currentIndex.value || currentIndex.value == 0) &&
    currentIndex.value == activeIndex.value
  ) {
    stopQuery('sample')
    // cancelCurrentRequest('sample')
    return
  }
  submitSample()
}
const submitTranSend = () => {
  if (finalIng.value && (currentIndex.value || currentIndex.value == 0) && currentIndex.value == activeIndex.value) {
    cancelCurrentRequest('tran')
    return
  }
  submitTran()
}
const submitFinalSend = () => {
  if (finalIng.value && (currentIndex.value || currentIndex.value == 0) && currentIndex.value == activeIndex.value) {
    cancelCurrentRequest('final')
    return
  }
  submitFinal()
}

const deleteImg = index => {
  fileInputAry.value.splice(index, 1)
  if (!fileInputAry.value || fileInputAry.value.length === 0) {
    fileInputAry.value = []
    nextTick(() => {
      adjustTextareaHeight('textareaInputSample')
    })
  }
}
const submitSampleFile = val => {
  currentQuestion.value = true
  isDragOver.value = false
  for (var i = 0; i < val.length; i++) {
    val[i].fileName = decodeURIComponent(val[i].fileName)
    val[i].originalFileName = decodeURIComponent(val[i].originalFileName)
  }
  fileAry.value = val
  fileInputAry.value = JSON.parse(JSON.stringify(val))
  nextTick(() => {
    adjustTextareaHeight('textareaInputSample')
  })
}

const submitSampleTitle = val => {
  if (isSampleLoad.value || queryIng.value || docIng.value || tranIng.value || finalIng.value) {
    ElMessage.warning('有问答正在进行中,请稍后再试')
    return
  }
  submitSample(val)
}
const stopQuery = async type => {
  request
    .post('/AI/stop?userId=' + userInfo.value.id, {
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        cancelCurrentRequest(type)
      }
    })
    .catch(err => {})
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
const isPureObject = value => {
  // 排除 null 和基础类型
  if (typeof value !== 'object' || value === null) return false

  // 排除数组、日期、正则等
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}
const submitSample = async (val, isRefresh) => {
  const fileInput = fileInputAry.value
  if (fileInput.length === 0 || !fileInput) {
    if (!checkData(val)) {
      return
    }
  }
  if (val) {
    newQuestion.value = val
  }
  currentQuestion.value = true
  const queryValue = newQuestion.value
  isSampleStop.value = false
  dynamicRows.value = 1
  isSampleLoad.value = true
  limitLoading.value = true
  if (chatQuery.messages.length === 1 && chatQuery.messages[0].files) {
    chatQuery.messages = []
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
    chatQuery.messages.length -= 2
    currentIndex.value = activeIndex.value
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
  params.userId = userInfo.value.id
  params.model = deepType.value ? 1 : 0
  params.files = filesSample

  tipQuery.value = queryValue
  newQuestion.value = ''
  let title = ''

  if (!questions.value.includes(queryValue + '(sample)') && isRefresh && mes.messages.length === 1) {
    for (var m = 0; m < answerList.value.length; m++) {
      if (
        answerList.value[m].type === '通用模式' &&
        queryValue === answerList.value[m].data[answerList.value[m].data.length - 2].content &&
        answerList.value[m].data[answerList.value[m].data.length - 2].files.length === 0
      ) {
        const id = answerList.value[m].id
        title = answerList.value[m].title.replace(/\([^)]*\)/g, '')
        const index = questions.value.findIndex(item => item === title + '(sample)')
        if (index !== -1) {
          questions.value.splice(index, 1)
        }
        await asizeRef.value.deleteData(id, true)
        questions.value.unshift(title + '(sample)')

        activeIndex.value = 0
      }
    }
  }

  const anList = JSON.parse(JSON.stringify(answerList.value))
  const hasId = anList.some(item => item.id === currentId.value)
  let id = ''
  if (!hasId) {
    let titleStr = ''
    for (var i = 0; i < fileInput.length; i++) {
      titleStr += fileInput[i].originalFileName + ','
    }
    questions.value.unshift('新对话' + '(sample)')
    currentIndex.value = 0
    activeIndex.value = '0'
  }
  if (hasId) {
    id = currentId.value
    limitId.value = id
    const index = answerList.value.findIndex(item => item.id === id)
    for (var k = 0; k < answerList.value.length; k++) {
      if (id === answerList.value[k].id) {
        title = answerList.value[k].title.replace(/\([^)]*\)/g, '')
      }
    }
    currentIndex.value = activeIndex.value
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

  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
  // currentRequestUrl.value = '/AI/chatStream'
  const controller = new AbortController()
  const assistantMsg = { role: 'assistant', content: '', before: '', after: '', hasSplit: false, isNewData: true }
  mes.messages.push(assistantMsg)
  // 使用一个对象记录哪些 content 已经有 user 了
  chatCurrent.messages = mes.messages
  chatQuery.isLoading = true
  const isThink = deepType.value
  fileInputAry.value = []
  fileAry.value = []
  try {
    // 替换为实际的后端接口地址
    const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/AI/chatStream', {
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
        chatCurrent.messages.splice(chatCurrent.messages.length - 1, 1, { ...assistantMsg })
        autoScroll()
      }, 100) // 100ms更新间隔
    }

    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        clearInterval(interval)
        currentIndex.value = ''
        isSampleLoad.value = false
        limitLoading.value = false
        chatQuery.isLoading = false
        limitId.value = ''
        currentRequestUrl.value = ''
        chatQuery.messages = JSON.parse(JSON.stringify(chatCurrent.messages))

        nextTick(() => {
          // dynamicRows.value = 1
          adjustTextareaHeight('textareaInputSample')
          // adjustTextareaHeight('textareaInputSampleCurrent')
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
        postSample(id, title, isThink, filesSample)
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
          if (messageContainer.value) {
            messageContainer.value.scrollTop = messageContainer.value.scrollHeight
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
            chatCurrent.messages.splice(-1, 1, {
              ...toRaw(assistantMsg),
              before: assistantMsg.before,
              after: assistantMsg.after,
              content: assistantMsg.before + assistantMsg.after // 兼容旧字段
            })
          } catch (e) {
            currentIndex.value = ''
            console.error('JSON 解析失败:', jsonMatch[1], '错误:', e)
            ElMessage.error('数据格式异常')
          }
        }
      })
    }
  } catch (error) {
    currentIndex.value = ''
    chatQuery.isLoading = false
    isSampleLoad.value = false
    limitId.value = ''
    queryIng.value = false
    nextTick(() => {
      // dynamicRows.value = 1
      adjustTextareaHeight('textareaInputSample')
      // adjustTextareaHeight('textareaInputSampleCurrent')
    })
    ElMessage.error('服务器繁忙,请稍后再试')
  }
}
const submitTran = async (val, isRefresh, obj) => {
  if (queryIng.value || docIng.value || tranIng.value || finalIng.value) {
    ElMessage.warning('有问答正在进行中,请稍后再试')
    return
  }
  if (!obj && !checkData(val)) {
    return
  }
  isDragOver.value = false
  finalIng.value = true
  tranIng.value = true
  interval = setInterval(updateDots, 500) // 每 500ms 更新一次
  limitQuery.value = newQuestion.value
  const passData = newQuestion.value
  limitAry.value = JSON.parse(JSON.stringify(answerList.value))
  newQuestion.value = ''
  transQuest.value = ''
  transData.value = ''
  let title = ''
  if (isRefresh) {
    let current = currentId.value
    if (!current) {
      current = answerList.value[activeIndex.value].id
    }
    const idx = answerList.value.findIndex(item => item.id === current)
    title = answerList.value[idx].title.replace(/\([^)]*\)/g, '')
    let limitTitle = ''
    limitTitle = questions.value[idx]
    questions.value.splice(idx, 1)
    answerList.value.splice(idx, 1)
    await asizeRef.value.deleteData(current, true)
    activeIndex.value = 0
    currentIndex.value = 0
    questions.value.unshift(limitTitle)
  }
  if (!isRefresh) {
    const qData = '新对话' + '(tran)'
    currentIndex.value = activeIndex.value
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
  transQuest.value = obj ? obj.originalFileName : passData
  const passQuery = obj ? obj.originalFileName : passData

  currentRequestUrl.value = '/AI/translate'
  if (obj && !isPureObject(obj.fileId)) {
    const objSample = {
      fileId: obj.fileId,
      local: obj.local
    }
    obj.fileId = objSample
  }
  nextTick(() => {
    if (entryRef.value?.fileRef) {
      entryRef.value.fileRef.closeFile()
    }
  })
  activeIndex.value = 0
  request
    .post('/AI/translate', {
      user_id: userInfo.value.id,
      source_text: obj ? '' : passData,
      target_language: selectedLan.value,
      file: obj
        ? obj.fileId
        : {
            fileId: ''
          }
      // showLoading: true
    })
    .then(res => {
      currentRequestUrl.value = ''
      currentIndex.value = ''
      clearInterval(interval)
      nextTick(() => {
        adjustTextareaHeight('textareaInputTran')
      })
      if (res.status) {
        transData.value = res.data
        const passData = {
          question: passQuery,
          answer: res.data
        }

        postTran(passData, title.replace(/\([^)]*\)/g, ''), obj)
      } else {
        if (res.code === 400) {
          const passData = {
            question: passQuery,
            answer: ''
          }
          postTran(passData, title.replace(/\([^)]*\)/g, ''), obj)
          ElMessage.warning(res.message)
        }
      }
    })

    .catch(err => {
      currentIndex.value = ''
      if (err.message !== 'canceled') {
        ElMessage.error('翻译失败' + err.message)
      }

      finalIng.value = false
      tranIng.value = false
      clearInterval(interval)
      nextTick(() => {
        adjustTextareaHeight('textareaInputTran')
      })
    })
}
const summitPost = event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认的换行行为
    submitQuestion()
  }
}

const submitQuestion = async (val, isRefresh) => {
  if (queryIng.value || docIng.value || tranIng.value || finalIng.value) {
    ElMessage.warning('有问答正在进行中,请稍后再试')
    return
  }
  if (!isNet.value) {
    ElMessage.warning('该模式仅支持通过office网络访问')
    return
  }
  if (!checkData(val)) {
    return
  }
  currentQuestion.value = true
  isQueryStop.value = false
  dynamicRows.value = 1
  currentMessageIndex.value = 0
  currentObj.value.list = {}
  currentObj.value.messages = {}
  currentObj.value.messageList = []
  const queryValue = newQuestion.value
  tipQuery.value = queryValue
  newQuestion.value = ''
  queryIng.value = true
  isSampleLoad.value = true
  const pgType = pageType.value
  const addTitle = pageType.value === 'query' ? '(query)' : pageType.value === 'it' ? '(it)' : '(law)'
  let title = ''
  // if (addTitle === '(query)') {
  //   deepType.value = 0
  // }
  limitAry.value = JSON.parse(JSON.stringify(answerList.value))
  if (isRefresh) {
    let current = currentId.value
    const idx = answerList.value.findIndex(item => item.id === current)
    title = answerList.value[idx].title.replace(/\([^)]*\)/g, '')
    let limitTitle = ''
    let limitObj = {}
    limitTitle = questions.value[idx]
    questions.value.splice(idx, 1)
    limitObj = answerList.value[idx]
    answerList.value.splice(idx, 1)
    await asizeRef.value.deleteData(current, true)
    activeIndex.value = 0
    currentIndex.value = 0
    questions.value.unshift(title + addTitle)
    answerList.value.unshift(limitObj)
  }

  if (!questions.value.includes(queryValue) && !title) {
    questions.value.unshift('新对话' + addTitle)
    const data = {
      data: {
        answer: '',
        question: queryValue,
        think: ''
      },
      title: queryValue
    }
    answerList.value.unshift(data)
    activeIndex.value = '0'
    currentIndex.value = 0
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
  const isThink = deepType.value === true ? true : false
  let list = {}
  try {
    // 替换为实际的后端接口地址
    const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/AI/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: queryValue,
        user_id: userInfo.value.id,
        model: deepType.value ? 1 : 0,
        type: pageType.value === 'query' ? '人资行政专题' : pageType.value === 'it' ? 'IT专题' : '法务专题'
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
      if (done) {
        currentIndex.value = ''
        nextTick(() => {
          adjustTextareaHeight('textareaInputQuery')
        })
        break
      }
      // 将二进制数据解码并添加到缓冲区
      buffer += decoder.decode(value, { stream: true })
      //处理buffer数据
      // 清理数据
      buffer = buffer.replace(/data:\s*/g, '')
      // 尝试按分隔符分割数据
      const jsonStr = buffer.split('\n\n')
      // 如果最后一个部分不完整，保留在缓冲区中
      buffer = jsonStr.pop() || ''
      let finalAnswer = {}

      jsonStr.forEach(element => {
        const type = JSON.parse(element).type
        if (type === 'reasoning') {
          currentObj.value.list = JSON.parse(element)
          list = JSON.parse(JSON.stringify(currentObj.value.list))
        }
        if (type === 'final_answer') {
          queryIng.value = false

          // loadingInstance.close();
          currentObj.value.messages = JSON.parse(element)
          finalAnswer = JSON.parse(element)
          currentObj.value.messages.isHistory = true
          const query = title ? title : queryValue
          const paramsQuery = {
            title: title ? title : queryValue,
            queryValue: queryValue
          }
          setTimeout(() => {
            const think = isThink ? JSON.parse(JSON.stringify(list)) : {}
            postQuestion(think, finalAnswer, paramsQuery, pgType, isThink)
          }, 200)
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
    currentIndex.value = ''
    isSampleLoad.value = false
    queryIng.value = false
    nextTick(() => {
      adjustTextareaHeight('textareaInputQuery')
    })
    ElMessage.error('服务器繁忙,请稍后再试')
  }
}

const postSample = async (ids, title, isThink, postSample) => {
  let titleStr = ''
  if (chatQuery.messages[0].files && chatQuery.messages[0].files.length > 0) {
    for (var i = 0; i < chatQuery.messages[0].files.length; i++) {
      titleStr += chatQuery.messages[0].files[i].originalFileName + ','
    }
    titleStr = titleStr.substring(0, titleStr.length - 1)
  }
  request
    .post('/Message/save', {
      userId: userInfo.value.id,
      type: '通用模式',
      id: ids,
      data: chatQuery.messages,
      isThink: isThink ? true : false,
      title: title ? title : chatQuery.messages[0].content ? chatQuery.messages[0].content + titleStr : titleStr
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

const postQuestion = async (think, obj, val, type, isThink) => {
  request
    .post('/Message/save', {
      userId: userInfo.value.id,
      type: type === 'query' ? '人资行政专题' : type === 'it' ? 'IT专题' : '法务专题',
      title: val.title,
      id: '',
      isThink: isThink,
      data: {
        think: think,
        question: val.queryValue,
        answer: obj
      }
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        isSampleLoad.value = false
        getHistory('', type, val, res.data)
      } else {
        isSampleLoad.value = false
      }
    })
    .catch(err => {
      isSampleLoad.value = false
      console.error('获取回复失败:', err)
    })
}

const postTran = async (obj, title, ob) => {
  request
    .post('/Message/save', {
      userId: userInfo.value.id,
      type: '翻译',
      title: title ? title : obj.question,
      id: '',
      data: {
        question: obj.question,
        answer: obj.answer,
        target: selectedLan.value,
        files: ob ? ob : ''
      }
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        finalIng.value = false
        tranIng.value = false
        getHistory('', 'tran', obj.question, res.data)
      } else {
        finalIng.value = false
        tranIng.value = false
      }
    })
    .catch(err => {
      finalIng.value = false
      tranIng.value = false
      console.error('获取回复失败:', err)
    })
}

const postFinal = async (obj, title, ob) => {
  request
    .post('/Message/save', {
      userId: userInfo.value.id,
      type: '总结',
      title: title ? title : obj.question,
      id: '',
      data: {
        question: obj.question,
        answer: {
          key_points: obj.answer.data,
          summary: obj.answer.title
        },
        files: ob ? ob : ''
      }
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        finalIng.value = false
        docIng.value = false
        getHistory('', 'final', obj.question, res.data)
      } else {
        finalIng.value = false
        docIng.value = false
      }
    })
    .catch(err => {
      console.error('获取回复失败:', err)
    })
}

const getHistory = async (id, page, val, ids) => {
  request
    .post('/Message/getMessageByUserId?userId=' + userInfo.value.id)
    .then(res => {
      if (res.status) {
        // getMessageTitle()
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
            } else if (res.data[i].type === '法务专题') {
              answerList.value[i].title = answerList.value[i].title + '(law)'
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
          // questions.value = questions.value.reduce((acc, current) => {
          //   if (!acc.find(item => item === current)) {
          //     acc.push(current)
          //   }
          //   return acc
          // }, [])
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
                  : answerList.value[k].type === '法务专题'
                    ? 'law'
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
          if (res.data[j].type === '人资行政专题' || res.data[j].type === 'IT专题' || res.data[j].type === '') {
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
            currentQuestion.value = true
            activeIndex.value = s
            selectedMode.value = answerList.value[0].type
            deepType.value = answerList.value[s].isThink
            nextTick(() => {
              // 滚动到底部
              if (messageContainer.value) {
                const messages = messageContainer.value.children
                if (messages.length > 0) {
                  const lastMessage = messages[messages.length - 2]
                  // 滚动到最后一个消息的开头部分
                  lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }
            })
          }
        }
        if (page) {
          pageType.value = page
          const type =
            page === 'query'
              ? '人资行政专题'
              : page === 'it'
                ? 'IT专题'
                : page === 'law'
                  ? '法务专题'
                  : page === 'sample'
                    ? '通用模式'
                    : page === 'tran'
                      ? '翻译'
                      : '总结'
          if (page === 'query' || page === 'it' || page === 'law' || page === 'tran' || page === 'final') {
            for (var h = 0; h < answerList.value.length; h++) {
              if (ids === answerList.value[h].id) {
                activeIndex.value = h
                selectedMode.value = answerList.value[0].type
                if (page === 'query' || page === 'it' || page === 'law') {
                  currentQuestion.value = true
                  tipQuery.value = answerList.value[h].data.question
                  currentObj.value.list = answerList.value[h].data.think
                  deepType.value = answerList.value[h].isThink
                }
                if (page === 'tran') {
                  currentQuestion.value = false
                  transQuest.value = answerList.value[h].data.question
                }
                if (page === 'final') {
                  currentQuestion.value = false
                  finalQuest.value = answerList.value[h].data.question
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
const cancelCurrentRequest = async val => {
  request.cancelRequest(currentRequestUrl.value)
  ElMessage.success('请求已中止')
  if (val === 'sample') {
    isSampleLoad.value = false
    limitLoading.value = false
    isSampleStop.value = true
    chatQuery.messages = JSON.parse(JSON.stringify(chatCurrent.messages))
    let title = ''
    for (var i = 0; i < answerList.value.length; i++) {
      if (answerList.value[i].type === '通用模式') {
        if (
          chatQuery.messages[chatQuery.messages.length - 2].content ===
          answerList.value[i].data[answerList.value[i].data.length - 2].content
        ) {
          title = answerList.value[i].title
        }
      }
    }
    const id = limitId.value
    postSample(id, title.replace(/\([^)]*\)/g, ''), deepType.value)
    limitId.value = ''
  }
  if (val === 'query' || val === 'it' || val === 'law') {
    isSampleLoad.value = false
    limitLoading.value = false
    isQueryStop.value = true
    queryIng.value = false
    let title = ''
    for (var i = 0; i < answerList.value.length; i++) {
      if (
        answerList.value[i].type === '人资行政专题' ||
        answerList.value[i].type === 'IT专题' ||
        answerList.value[i].type === '法务专题'
      ) {
        if (answerList.value[i].data.question === tipQuery.value) {
          title = answerList.value[i].title.replace(/\([^)]*\)/g, '')
        }
      }
    }
    const paramsQuery = {
      title: title ? title : tipQuery.value,
      queryValue: tipQuery.value
    }
    currentObj.value.messages.type = 'final_answer'
    const isThink = deepType.value === true ? true : false
    postQuestion({}, { type: 'final_answer' }, paramsQuery, val, isThink)
  }
  if (val === 'tran') {
    finalIng.value = false
    tranIng.value = false
    let title = ''
    let obj = ''
    for (var i = 0; i < answerList.value.length; i++) {
      if (answerList.value[i].type === '翻译') {
        if (answerList.value[i].data.question === transQuest.value) {
          title = answerList.value[i].title.replace(/\([^)]*\)/g, '')
          obj = answerList.value[i].data.files
        }
      }
    }
    const passData = {
      question: transQuest.value,
      answer: ''
    }
    postTran(passData, title, obj)
  }
  if (val === 'final') {
    finalIng.value = false
    docIng.value = false
    let title = ''
    let ob = ''
    for (var i = 0; i < answerList.value.length; i++) {
      if (answerList.value[i].type === '总结') {
        if (answerList.value[i].data.question === finalQuest.value) {
          title = answerList.value[i].title.replace(/\([^)]*\)/g, '')
          ob = answerList.value[i].data.files
        }
      }
    }
    const obj = {
      question: finalQuest.value,
      answer: {
        title: '',
        data: []
      }
    }
    postFinal(obj, title, ob)
  }
}
const getPower = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  request
    .post('/Files/permissionCheck?userId=' + userInfo.id)
    .then(res => {
      if (res.status) {
        localStorage.setItem('powerList', JSON.stringify(res.data))
        asizeRef.value.setPower(JSON.stringify(res.data))
      }
    })
    .catch(err => {
      console.error(err)
    })
}
const setlaw = () => {
  isLaw.value = localStorage.getItem('isLaw')
  getPower()
}
const handleClickOutside = event => {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
    showFileMenu.value = false
  }
}
// 组件挂载时订阅事件
onMounted(() => {
  eventBus.on('submit-sampleFile', submitSampleFile)
  document.addEventListener('click', handleClickOutside)
  nextTick(() => {
    isLaw.value = localStorage.getItem('isLaw')
    isNet.value = localStorage.getItem('isNet')
  })
})
// 组件卸载时关闭 SSE 连接
onBeforeUnmount(() => {
  eventBus.off('submit-sampleFile', submitSampleFile)
  document.removeEventListener('click', handleClickOutside)
})
// 组件卸载时关闭 SSE 连接
onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>

<style lang="less">
.upload-layout.drag-over {
  border-color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}
.sampleArea {
  .el-textarea__inner {
    padding: 18px 135px 18px 15px !important;
  }
}
.sampleAreaAry {
  .el-textarea__inner {
    padding: 56px 135px 18px 15px !important;
  }
}
.filesList {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  font-size: 12px;
  div {
    margin-left: 10px;

    max-width: 80px;
    white-space: nowrap; /* 禁止换行 */
    overflow: hidden; /* 隐藏溢出内容 */
    text-overflow: ellipsis; /* 超出部分显示... */ /* 必须设置宽度（或父容器有明确宽度） */
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    padding: 6px 10px;
    border-radius: 6px;
    position: relative;
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
.tooltip {
  position: absolute;
  bottom: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  background: #000;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 添加淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 可选：现代浏览器箭头实现 */
.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #000;
}
.button-item_common {
  display: flex;
  width: 100%;
  margin-top: 25px;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 5px;
}
.el-container {
  background-color: #fff;
}

.el-main {
  padding: 0px !important;
  // background: linear-gradient(
  //   to bottom,
  //   rgba(197, 208, 213, 0.2),
  //   /* 淡蓝色，透明度 60% */ rgba(188, 214, 218, 0.1) /* 更淡的蓝色，透明度 60% */
  // );
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
        margin-left: 12px;
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
      color: #1b6cff;
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
        margin-left: 12px;
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
      width: 726px;
      overflow-y: auto;
      overflow-x: hidden;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 10px;
      /* WebKit 浏览器滚动条样式 */

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
        margin-top: 10px;
        scroll-behavior: smooth;
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
        width: calc(100% - 10px);
        font-size: 13px;
        display: flex;
        padding: 0px 10px;
        letter-spacing: 1px;
        line-height: 24px;
        color: #666;
      }
      .title_tiQuery {
        display: flex;
        flex-direction: row-reverse;
        width: 100%;
        margin-top: 80px;
        .title_tiQuery_text {
          background-color: #1b6cff;
          border-radius: 10px;
          padding: 13px 15px;
          float: right;
          color: #fff;
          max-width: 600px;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 14px;
          letter-spacing: 1px;
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
          margin-right: 15px;
        }
        .title_top {
          font-size: 20px;
          color: #262626;
        }
        .title_item {
          height: 20px;
          line-height: 20px;
          margin-top: 7px;
          display: flex;
          line-height: 18px;
          color: #262626;
        }
      }
      .title_wait {
        margin-top: 10px;
        letter-spacing: 1px;
        font-size: 12px;
        line-height: 20px;
      }
      .title_final_tip {
        width: 100%;
        display: flex;
        flex-direction: row-reverse;
        font-size: 14px;
        letter-spacing: 1px;
        .title_final_query {
          background-color: #1b6cff;
          border-radius: 10px;
          float: right;
          color: #fff;
          max-width: 600px;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: 1px;
          font-size: 14px;
          line-height: 24px;
        }
      }
      .title_final_data {
        margin-top: 10px;
        background-color: #fafafa;
        font-size: 14px;
        letter-spacing: 1px;
        line-height: 24px;
        border-radius: 10px;
        min-width: 696px;
      }
      .title_tran_tip {
        width: 100%;
        display: flex;
        flex-direction: row-reverse;
        div {
          background-color: #1b6cff;
          border-radius: 10px;
          float: right;
          color: #fff;
          max-width: 600px;
          line-height: 24px;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 14px;
          letter-spacing: 1px;
        }
      }
      .title_tran_data {
        margin-top: 10px;
        background-color: #fafafa;
        font-size: 14px;
        letter-spacing: 1px;
        line-height: 24px;
        border-radius: 10px;
        min-width: 696px;
      }
      .content_list {
        display: flex;
        margin-top: 20px;
        height: 300px;
        width: 100%;
        .list_item {
          flex: 1;
          height: 326px;
          background-image: url('@/assets/arr.png');
          background-size: 100% 100%;
          // background: linear-gradient(
          //   to bottom,
          //   rgba(135, 206, 235, 0.3),
          //   /* 淡蓝色，透明度 60% */ rgba(224, 247, 250, 0.3) /* 更淡的蓝色，透明度 60% */
          // );
          .list_title {
            padding-left: 20px;
            font-size: 18px;
            color: #262626;
            font-weight: bold;
            margin-top: 25px;
            letter-spacing: 1px;
          }
          .list_tip {
            padding-left: 20px;
            font-size: 14px;
            color: #646464;
            margin-top: 4px;
            letter-spacing: 1px;
          }
          .list_arry {
            padding-left: 20px;
            margin-top: 20px;
            color: #252525;
            font-size: 14px;
            line-height: 20px;
            .arr_item {
              line-height: 36px;
              cursor: pointer;
              display: flex;
              .item_hover {
                padding-left: 3px;
                display: -webkit-box;
                -webkit-line-clamp: 1; /* 显示行数 */
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
              .item_hover:hover {
                color: #1b6cff;
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
              border: 1px solid #1b6cff;
            }
            .img_item {
              display: flex;
              background-color: #fff;
              border-radius: 10px;
              height: 56px;
              cursor: pointer;
              flex-direction: row;
              border: 1px solid #e6f2ff;

              .image {
                width: 40px;
                height: 40px;
                margin-top: 8px;
                margin-left: 12px;
                img {
                  width: 100%;
                  height: 100%;
                }
              }
              .img_text {
                height: 30px;
                padding-left: 12px;
                padding-top: 12px;
                letter-spacing: 1px;
                .text_title {
                  font-size: 14px;
                  color: #252525;
                  font-weight: bold;
                  line-height: 18px;
                }
                .text_content {
                  font-size: 12px;
                  line-height: 15px;
                  max-width: 220px;
                  color: #646464;
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
  font-family: 'Source Han Sans CN';
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

/* 光标闪烁动画 */
@keyframes blink {
  50% {
    border-color: transparent;
  }
}
</style>
