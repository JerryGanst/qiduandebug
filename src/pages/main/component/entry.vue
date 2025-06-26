<template>
  <DragUpload
    ref="dragUploads"
    @submit-tran="submitFileTran"
    @submit-final="submitFileFinal"
    v-if="isDragOver && (pageType === 'sample' || pageType === 'tran' || pageType === 'final')"
  ></DragUpload>
  <div class="main_content" :style="{ marginBottom: isDragOver ? '0px' : '10px' }" v-if="!isDragOver">
    <div
      class="title"
      v-if="pageType === 'query' || pageType === 'it' || pageType === 'law' || (pageType === 'sample' && !isDragOver)"
    >
      <img src="@/assets/logo2.png" class="title_src" />
      <div>
        <div class="title_top" style="line-height: 33px; font-weight: bold">
          Hello!我是立讯技术百事通，有什么问题欢迎咨询
        </div>
        <div class="title_item">
          <span>我可以帮您做这些事情</span>
        </div>
      </div>
    </div>
    <div class="content_list" v-if="pageType === 'query' || pageType === 'it' || pageType === 'law'">
      <div class="list_item">
        <div class="list_title">近期热搜</div>
        <div class="list_tip">深度搜索您关心的问题</div>
        <div class="list_arry">
          <div v-for="(item, index) in arrList" class="arr_item" v-if="pageType === 'query'">
            <span>{{ index + 1 }}.</span>
            <span class="item_hover" @click="submitQuestionCurrent(item.name)">
              {{ item.name }}
            </span>
          </div>
          <div v-for="(item, index) in itList" class="arr_item" v-if="pageType === 'it'">
            <span>{{ index + 1 }}.</span>
            <span class="item_hover" @click="submitQuestionCurrent(item.name)">{{ item.name }}</span>
          </div>
        </div>
      </div>
      <div class="list_item" style="margin-left: 20px">
        <div class="list_title">知识工坊</div>
        <div class="list_tip">办公学习必备</div>
        <div class="img_list">
          <div class="img_item" @click="changeType('tran')">
            <div class="image"><img src="@/assets/1.png" /></div>
            <div class="img_text">
              <div class="text_title">翻译</div>
              <div class="text_content">准确翻译成多国语言</div>
            </div>
          </div>
          <div class="img_item" style="margin-top: 15px" @click="changeType('final')">
            <div class="image"><img src="@/assets/2.png" /></div>
            <div class="img_text">
              <div class="text_title">总结</div>
              <div class="text_content">AI智能总结,让复杂信息一目了然</div>
            </div>
          </div>
          <div class="img_item" style="margin-top: 15px">
            <div class="image"><img src="@/assets/3.png" /></div>
            <div class="img_text">
              <div class="text_title">更多功能</div>
              <div class="text_content">敬请期待...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content_list" v-if="pageType === 'sample' && !isDragOver">
      <div class="list_item">
        <div class="list_title">近期热搜</div>
        <div class="list_tip">深度搜索您关心的问题</div>
        <div class="list_arry">
          <div v-for="(item, index) in historyList" class="arr_item">
            <span>{{ index + 1 }}.</span>
            <span class="item_hover" @click="submitSampleTitle(item.name)">
              {{ item.name }}
            </span>
          </div>
        </div>
      </div>
      <div class="list_item" style="margin-left: 20px">
        <div class="list_title">知识工坊</div>
        <div class="list_tip">办公学习必备</div>
        <div class="img_list">
          <div class="img_item" @click="changeType('tran')">
            <div class="image"><img src="@/assets/1.png" /></div>
            <div class="img_text">
              <div class="text_title">翻译</div>
              <div class="text_content">准确翻译成多国语言</div>
            </div>
          </div>
          <div class="img_item" style="margin-top: 15px" @click="changeType('final')">
            <div class="image"><img src="@/assets/2.png" /></div>
            <div class="img_text">
              <div class="text_title">总结</div>
              <div class="text_content">AI智能总结,让复杂信息一目了然</div>
            </div>
          </div>
          <div class="img_item" style="margin-top: 15px">
            <div class="image"><img src="@/assets/3.png" /></div>
            <div class="img_text">
              <div class="text_title">更多功能</div>
              <div class="text_content">敬请期待...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="title" v-if="pageType === 'tran' && !isDragOver">
      <img src="@/assets/logo2.png" class="title_src" />
      <div>
        <div class="title_top" style="line-height: 30px; font-weight: bold">立讯技术AI翻译专家</div>
        <div class="title_top" style="font-size: 16px; font-weight: 400; line-height: 36px">
          熟练掌握翻译技巧～您的翻译好帮手
        </div>
      </div>
    </div>
    <div class="title_tran_tip" v-if="pageType === 'tran' && !isDragOver">
      <div
        v-if="
          (transQuest && transQuest.includes('txt') && transQuest.endsWith('txt')) ||
          (transQuest && transQuest.includes('doc') && transQuest.endsWith('doc')) ||
          (transQuest && transQuest.includes('docx') && transQuest.endsWith('docx')) ||
          (transQuest && transQuest.includes('pdf') && transQuest.endsWith('pdf')) ||
          (transQuest && transQuest.includes('ppt') && transQuest.endsWith('ppt')) ||
          (transQuest && transQuest.includes('pptx') && transQuest.endsWith('pptx')) ||
          (transQuest && transQuest.includes('xls') && transQuest.endsWith('xls')) ||
          (transQuest && transQuest.includes('xlsx') && transQuest.endsWith('xlsx'))
        "
        :style="{
          padding: transQuest ? '7px 15px' : '0px'
        }"
        @click="showPreFile('tran')"
        style="color: #333; background-color: #eff6ff; display: flex; align-items: center; cursor: pointer"
      >
        <span style="display: flex; align-items: center">
          <img
            :src="
              transQuest.endsWith('txt')
                ? text
                : transQuest.endsWith('pdf')
                  ? pdf
                  : transQuest.endsWith('ppt') || transQuest.endsWith('pptx')
                    ? ppt
                    : transQuest.endsWith('xls') || transQuest.endsWith('xlsx')
                      ? excel
                      : word
            "
            style="width: 24px; height: 30px"
          />
        </span>
        <span style="padding-left: 10px">{{ transQuest }}</span>
      </div>
      <div
        v-else
        :style="{
          padding: transQuest ? '10px 15px' : '0px'
        }"
      >
        {{ transQuest }}
      </div>
    </div>
    <div v-if="pageType === 'tran' && finalIng && tranIng && !isDragOver" class="title_wait">
      <span>
        <img src="@/assets/robot.png" style="width: 36px; height: 36px" />
      </span>
      <span style="padding-left: 10px">正在为您翻译,请稍等</span>
      <span v-if="!transData">{{ dots }}</span>
    </div>
    <MarkdownRenderer
      class="title_tran_data"
      v-if="pageType === 'tran' && !isDragOver"
      :style="{ padding: transData ? '0px 15px' : '0px' }"
      :markdown="transData"
    />
    <!-- <div class="title_tran_data" v-if="pageType === 'tran'" :style="{ padding: transData ? '0px 15px' : '0px' }">
      <p>{{ transData }}</p>
    </div> -->

    <div class="query_common" v-if="pageType === 'tran' && transQuest && !tranIng && !isDragOver">
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

    <div class="title" v-if="pageType === 'final' && !isDragOver">
      <img src="@/assets/logo2.png" class="title_src" />
      <div>
        <div class="title_top" style="line-height: 30px; font-weight: bold">立讯技术AI智能总结</div>
        <div class="title_top" style="font-size: 16px; font-weight: 400; line-height: 36px">
          精准概括，助您快速理解长文本
        </div>
      </div>
    </div>

    <div class="title_final_tip" v-if="pageType === 'final' && !isDragOver">
      <div
        v-if="
          (finalQuest && finalQuest.includes('txt') && finalQuest.endsWith('txt')) ||
          (finalQuest && finalQuest.includes('doc') && finalQuest.endsWith('doc')) ||
          (finalQuest && finalQuest.includes('docx') && finalQuest.endsWith('docx')) ||
          (finalQuest && finalQuest.includes('pdf') && finalQuest.endsWith('pdf')) ||
          (finalQuest && finalQuest.includes('ppt') && finalQuest.endsWith('ppt')) ||
          (finalQuest && finalQuest.includes('pptx') && finalQuest.endsWith('pptx')) ||
          (finalQuest && finalQuest.includes('xls') && finalQuest.endsWith('xls')) ||
          (finalQuest && finalQuest.includes('xlsx') && finalQuest.endsWith('xlsx'))
        "
        @click="showPreFile('final')"
        :style="{
          padding: finalQuest ? '7px 15px' : '0px'
        }"
        style="
          color: #333;
          background-color: #eff6ff;
          display: flex;
          align-items: center;
          border-radius: 10px;
          cursor: pointer;
        "
      >
        <span style="display: flex; align-items: center">
          <img
            :src="
              finalQuest.endsWith('txt')
                ? text
                : finalQuest.endsWith('pdf')
                  ? pdf
                  : finalQuest.endsWith('ppt') || finalQuest.endsWith('pptx')
                    ? ppt
                    : finalQuest.endsWith('xls') || finalQuest.endsWith('xlsx')
                      ? excel
                      : word
            "
            style="width: 24px; height: 30px"
          />
        </span>
        <span style="padding-left: 10px">{{ finalQuest }}</span>
      </div>
      <div v-else class="title_final_query" :style="{ padding: finalQuest ? '10px 15px' : '0px' }">
        <div>{{ finalQuest }}</div>
      </div>
    </div>
    <div v-if="pageType === 'final' && docIng && !isDragOver" class="title_wait">
      <span>
        <img src="@/assets/robot.png" style="width: 36px; height: 36px" />
      </span>
      <span style="padding-left: 10px">正在为您总结,请稍等</span>
      <span v-if="!finalData.title">{{ dots }}</span>
    </div>
    <div
      class="title_final_data"
      v-if="pageType === 'final' && !isDragOver"
      :style="{ padding: finalData.title ? '15px 15px' : '0px' }"
    >
      <div v-if="finalData.title">
        <span>概括 :</span>
        <span>{{ finalData.title }}</span>
      </div>
      <div v-if="finalData?.data?.length > 0" style="margin-top: 15px">
        <div>关键词 :</div>
        <div v-for="items in finalData?.data">
          {{ items }}
        </div>
      </div>
    </div>
    <div class="query_common" v-if="pageType === 'final' && finalQuest && !docIng && !isDragOver">
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
  <div class="select_content" v-if="!isDragOver">
    <div
      class="tran_select"
      v-if="pageType === 'query' || pageType === 'it' || pageType === 'law' || (pageType === 'sample' && !isDragOver)"
    >
      <el-radio-group v-model="selectedMode" @change="changeMode" :disabled="isSampleLoad">
        <el-radio-button label="通用模式" value="通用模式">通用模式</el-radio-button>
        <!-- <el-tooltip content="该模式仅支持通过office网络访问" placement="top" v-if="!isNet">
          <el-radio-button label="人资行政专题" value="人资行政专题" disabled>人资行政专题</el-radio-button>
        </el-tooltip>
        <el-radio-button label="人资行政专题" value="人资行政专题" v-if="isNet">人资行政专题</el-radio-button> -->
        <!-- <el-tooltip content="该模式仅支持通过office网络访问" placement="top" v-if="!isNet">
          <el-radio-button label="IT专题" value="IT专题" disabled>IT专题</el-radio-button>
        </el-tooltip> -->
        <!-- <el-radio-button label="IT专题" value="IT专题" v-if="isNet">IT专题</el-radio-button> -->
        <el-radio-button label="人资行政专题" value="人资行政专题">人资行政专题</el-radio-button>
        <el-radio-button label="IT专题" value="IT专题">IT专题</el-radio-button>
        <el-tooltip content="该模式仅支持通过office网络访问" placement="top" v-if="isLaw === 'true' && !isNet">
          <el-radio-button label="法务专题" value="法务专题" disabled>法务专题</el-radio-button>
        </el-tooltip>
        <el-radio-button label="法务专题" value="法务专题" v-if="isLaw === 'true' && isNet">法务专题</el-radio-button>
      </el-radio-group>
    </div>
    <div class="textarea" v-if="pageType === 'query' || pageType === 'it' || pageType === 'law'">
      <el-input
        v-model="newQuestion"
        placeholder="请输入您的问题,换行请按下Shift+Enter"
        style="width: 100%"
        class="custom-input"
        clearable
        @keydown.enter.prevent="summitPost"
        @keyup.shift.enter.prevent="handleShiftEnter('textareaInputQuery')"
        ref="textareaInputQuery"
        type="textarea"
        :maxlength="4096"
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
          <img :src="deepType ? deepSelect : deep" class="arrow" @click="checkDeepType" style="margin-right: 10px" />

          <transition name="fade">
            <div v-if="showModelTip" class="tooltip">{{ !deepType ? '切换成deepSeek-R1模式' : '切换成普通模式' }}</div>
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
          @click="submitQuestionSend"
          v-if="pageType === 'query'"
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
          @click="submitItSend"
          v-if="pageType === 'it'"
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
          @click="submitLawSend"
          v-if="isNet && pageType === 'law'"
        />
      </div>
    </div>
    <div class="textarea sampleArea" v-if="pageType === 'sample' && !isDragOver">
      <el-input
        v-model="newQuestion"
        placeholder="请输入您的问题,换行请按下Shift+Enter"
        style="width: 100%"
        class="custom-input"
        clearable
        @keydown.enter.prevent="samplePost"
        @keyup.shift.enter.prevent="handleShiftEnter(' textareaInputSampleCurrent')"
        ref=" textareaInputSampleCurrent"
        type="textarea"
        :maxlength="4096"
        :rows="dynamicRows"
        @input="adjustTextareaHeight(' textareaInputSampleCurrent')"
      />
      <!-- 发送图标 -->
      <div class="send-icon">
        <!-- <div class="tooltip-wrapper" @mouseenter="showFileTip = true" @mouseleave="showFileTip = false">
          <img src="@/assets/file.png" class="arrow" @click="showFile('sample')" style="margin-right: 10px" />
          <transition name="fade">
            <div v-if="showFileTip" class="tooltip">添加文件,单个大小不能超过50M</div>
          </transition>
        </div> -->
        <div class="tooltip-wrapper" ref="wrapperRef">
          <img src="@/assets/file.png" class="arrow" @click="showFile('sample')" style="margin-right: 10px" />
          <transition name="fade">
            <div v-if="showFileMenu" class="file-menu" @click.stop>
              <div class="triangle"></div>
              <div class="menu-item" @click="handleFileSelect('local', 'sample')">从本地读取</div>
              <div class="menu-item" @click="handleFileSelect('knowledge', 'sample')">从知识库读取</div>
            </div>
          </transition>
        </div>
        <div class="tooltip-wrapper" @mouseenter="showModelTip = true" @mouseleave="showModelTip = false">
          <img :src="deepType ? deepSelect : deep" class="arrow" @click="checkDeepType" style="margin-right: 10px" />

          <transition name="fade">
            <div v-if="showModelTip" class="tooltip">{{ !deepType ? '切换成deepSeek-R1模式' : '切换成普通模式' }}</div>
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
    <div class="tran_select" v-if="pageType === 'tran' && !isDragOver">
      <el-radio-group v-model="selectedLan">
        <el-radio-button v-for="item in lanList" :label="item" :value="item">{{ item }}</el-radio-button>
      </el-radio-group>
    </div>
    <div class="textarea" v-if="pageType === 'tran' && !isDragOver">
      <el-input
        v-model="newQuestion"
        placeholder="请输入您想翻译的文本,换行请按下Shift+Enter"
        style="width: 100%"
        class="custom-input"
        clearable
        @keydown.enter.prevent="tranPost"
        @keyup.shift.enter.prevent="handleShiftEnter('textareaInputTran')"
        ref="textareaInputTran"
        type="textarea"
        :maxlength="4096"
        :rows="dynamicRowFinal"
        @input="adjustTextareaHeight('textareaInputTran')"
      />
      <!-- 发送图标 -->
      <div class="send-icon">
        <!-- <div class="tooltip-wrapper" @mouseenter="showFileTip = true" @mouseleave="showFileTip = false">
          <img src="@/assets/file.png" class="arrow" @click="showFile('tran')" style="margin-right: 10px" />

          <transition name="fade">
            <div v-if="showFileTip" class="tooltip">添加文件,大小不能超过50M</div>
          </transition>
        </div> -->
        <div class="tooltip-wrapper" ref="wrapperRef">
          <img src="@/assets/file.png" class="arrow" @click="showFile('tran')" style="margin-right: 10px" />
          <transition name="fade">
            <div v-if="showFileMenu" class="file-menu" @click.stop>
              <div class="triangle"></div>
              <div class="menu-item" @click="handleFileSelect('local', 'tran')">从本地读取</div>
              <div class="menu-item" @click="handleFileSelect('knowledge', 'tran')">从知识库读取</div>
            </div>
          </transition>
        </div>
        <img
          :src="
            finalIng && (currentIndex || currentIndex == 0) && currentIndex == activeIndex
              ? imageC
              : newQuestion
                ? imageB
                : imageA
          "
          class="arrow"
          @click="submitTranSend"
        />
      </div>
    </div>

    <div class="textarea" v-if="pageType === 'final' && !isDragOver">
      <el-input
        v-model="newQuestion"
        placeholder="请输入您想总结的文本,换行请按下Shift+Enter"
        style="width: 100%"
        class="custom-input"
        clearable
        @keydown.enter.prevent="finalPost"
        @keyup.shift.enter.prevent="handleShiftEnter('textareaInputFinal')"
        ref="textareaInputFinal"
        type="textarea"
        :maxlength="4096"
        :rows="dynamicRowFinal"
        @input="adjustTextareaHeight('textareaInputFinal')"
      />
      <!-- 发送图标 -->
      <div class="send-icon">
        <!-- <div class="tooltip-wrapper" @mouseenter="showFileTip = true" @mouseleave="showFileTip = false">
          <img src="@/assets/file.png" class="arrow" @click="showFile('final')" style="margin-right: 10px" />

          <transition name="fade">
            <div v-if="showFileTip" class="tooltip">添加文件,大小不能超过50M</div>
          </transition>
        </div> -->
        <div class="tooltip-wrapper" ref="wrapperRef">
          <img src="@/assets/file.png" class="arrow" @click="showFile('final')" style="margin-right: 10px" />
          <transition name="fade">
            <div v-if="showFileMenu" class="file-menu" @click.stop>
              <div class="triangle"></div>
              <div class="menu-item" @click="handleFileSelect('local', 'final')">从本地读取</div>
              <div class="menu-item" @click="handleFileSelect('knowledge', 'final')">从知识库读取</div>
            </div>
          </transition>
        </div>
        <img
          :src="
            finalIng && (currentIndex || currentIndex == 0) && currentIndex == activeIndex
              ? imageC
              : newQuestion
                ? imageB
                : imageA
          "
          class="arrow"
          @click="submitFinalSend"
        />
      </div>
    </div>
  </div>
  <FileUpload ref="fileRef" @submit-tran="submitFileTran" @submit-final="submitFileFinal"></FileUpload>
  <FilePreUpload ref="filePreRef"></FilePreUpload>
  <commonUploadModal
    ref="commonUploadModals"
    @submit-tran="submitFileTran"
    @submit-final="submitFileFinal"
  ></commonUploadModal>
  <Knowledge ref="knowledge"></Knowledge>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus' // 引入 ElMessage
import FileUpload from './fileUploadModal.vue'
import FilePreUpload from './filePreModal.vue'
import Knowledge from './KnowledgeModal.vue'
import commonUploadModal from './commonUploadModal.vue'
import DragUpload from './dragUpload.vue'
import { useShared } from '@/utils/useShared'
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
import MarkdownRenderer from './markdown.vue' // 引入 Markdown 渲染组件
const emit = defineEmits([
  'submit-tran',
  'submit-final',
  'cancel-currentRequest',
  'submit-question',
  'submit-sample-title',
  'sample-post',
  'summit-post',
  'submit-tranSend',
  'submit-finalSend',
  'up-common',
  'down-common',
  'refresh-data',
  'submit-questionSend',
  'submit-sampleSend',
  'submit-itSend',
  'submit-lawSend'
])
const {
  selectedMode,
  newQuestion,
  pageType,
  dynamicRows,
  finalData,
  answerList,
  handleShiftEnter,
  adjustTextareaHeight,
  textareaInputQuery,
  textareaInputSample,
  textareaInputSampleCurrent,
  textareaInputTran,
  textareaInputFinal,
  finalIng,
  docIng,
  tranIng,
  isSampleLoad,
  updateFinalQuest,
  selectedLan,
  changeMode,
  transData,
  activeIndex,
  finalQuest,
  transQuest,
  dots,
  fileObj,
  fileAry,
  deepType,
  checkDeepType,
  questions,
  currentQuestion,
  showFileTip,
  showModelTip,
  fileInputAry,
  isLaw,
  isNet,
  isLogin,
  dragUploads,
  isDragOver,
  currentIndex
} = useShared()
const fileRef = ref(null)
const filePreRef = ref(null)
const knowledge = ref(null)
const wrapperRef = ref(null)
const commonUploadModals = ref(null)

const arrList = ref([
  {
    index: 1,
    name: '我进入立讯技术后如何选择导师'
  },
  {
    index: 2,
    name: '员工延假与销假如何进行'
  },
  {
    index: 3,
    name: '公司实习生的待遇怎么样'
  },
  {
    index: 4,
    name: '亲属回避包括哪些等级'
  },
  {
    index: 5,
    name: '工人是否有宗教信仰的自由'
  }
])
const itList = ref([
  {
    index: 1,
    name: 'mes系统的基础数据怎么维护'
  },
  {
    index: 2,
    name: 'mes操作的常见异常处理'
  },
  {
    index: 3,
    name: '会议室建设标准'
  },
  {
    index: 4,
    name: '桌面云规划怎么做？'
  },
  {
    index: 5,
    name: '产线设备数据采集怎么做？'
  }
])
const historyList = ref([
  {
    index: 1,
    name: '工作中遇到棘手问题怎么办'
  },
  {
    index: 2,
    name: '国务院发布的2025年法定节假日安排'
  },
  {
    index: 3,
    name: '如何锻炼身体'
  },
  {
    index: 4,
    name: '如何缓解工作压力'
  },
  {
    index: 5,
    name: '平常该如何注意营养搭配'
  }
])
const lanList = ref(['中文', '英文', '西班牙语', '越南语'])
const dynamicRowFinal = ref(1)
const isDeepShow = ref(false)
const tranPost = event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认的换行行为
    emit('submit-tran')
  }
}
const submitFileTran = obj => {
  emit('submit-tran', '', false, obj)
}
const submitFileFinal = obj => {
  emit('submit-final', '', false, obj)
}
// const submitSampleFile = obj => {
//   console.log(obj)
//   emit('submit-sampleFile', obj)
// }

const openKnowledge = () => {
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return false
  }
  knowledge.value.openFile('')
}
const showFileMenu = ref(false)

const showPreFile = val => {
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return false
  }
  if (activeIndex.value || activeIndex.value == 0) {
    if (val === 'tran') {
      for (var i = 0; i < answerList.value.length; i++) {
        if (transQuest.value === answerList.value[i].data.question) {
          fileObj.value = answerList.value[i]?.data?.files
        }
      }
    }
    if (val === 'final') {
      for (var i = 0; i < answerList.value.length; i++) {
        if (finalQuest.value === answerList.value[i].data.question) {
          fileObj.value = answerList.value[i]?.data?.files
        }
      }
    }
  } else {
    fileObj.value = ''
    fileAry.value = ''
  }
  filePreRef.value.openFile(val)
}
const showFile = val => {
  showFileMenu.value = !showFileMenu.value
}
const handleFileSelect = (val1, val2) => {
  showFileMenu.value = false
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return false
  }
  if (val1 === 'local') {
    if (activeIndex.value || activeIndex.value == 0) {
      if (val2 === 'tran') {
        for (var i = 0; i < answerList.value.length; i++) {
          if (transQuest.value === answerList.value[i].data.question) {
            fileObj.value = answerList.value[i]?.data?.files
          }
        }
      }
      if (val2 === 'final') {
        for (var i = 0; i < answerList.value.length; i++) {
          if (finalQuest.value === answerList.value[i].data.question) {
            fileObj.value = answerList.value[i]?.data?.files
          }
        }
      }
    } else {
      fileObj.value = ''
      fileAry.value = ''
    }
    fileRef.value.openFile(val2)
  } else {
    commonUploadModals.value.openFile(val2)
  }
}

const finalPost = event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认的换行行为
    emit('submit-final')
  }
}
const hoverDeep = val => {
  isDeepShow.value = val
}
const samplePost = event => {
  emit('sample-post', event)
}
const upCommon = event => {
  emit('up-common', event)
}
const downCommon = event => {
  emit('down-common', event)
}
const refreshData = event => {
  emit('refresh-data', event)
}

const summitPost = event => {
  emit('summit-post', event)
}

const submitQuestionCurrent = val => {
  emit('submit-question', val)
}
const submitSampleTitle = val => {
  emit('submit-sample-title', val)
}
const submitTranSend = val => {
  emit('submit-tranSend', val)
}
const submitQuestionSend = () => {
  emit('submit-questionSend')
}
const submitItSend = () => {
  emit('submit-itSend')
}
const submitLawSend = () => {
  emit('submit-lawSend')
}

const submitSampleSend = () => {
  emit('submit-sampleSend')
}

const submitFinalSend = val => {
  emit('submit-finalSend', val)
}
const changeType = val => {
  activeIndex.value = ''
  transQuest.value = ''
  transData.value = ''
  finalData.value.data = []
  finalData.value.title = ''
  finalQuest.value = ''
  pageType.value = val
}
const changeDynamicRows = () => {
  dynamicRowFinal.value = 1
}

// const getTopQuestion = val => {
//   request
//     .post('/Message/getTopQuestion?type=' + val)
//     .then(res => {
//       if (res.status) {
//         if (val === '人资行政专题') {
//           arrList.value = res.data
//         } else if (val === '通用模式') {
//           historyList.value = res.data
//         } else if (val === 'IT专题') {
//           itList.value = res.data
//         }
//       }
//     })
//     .catch(err => {
//       console.error(err)
//     })
// }
const handleClickOutside = event => {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
    showFileMenu.value = false
  }
}
const setDrag = val => {
  if (pageType.value === 'query' || pageType.value === 'it' || pageType.value === 'law') {
    return
  }
  isDragOver.value = val
}

// 组件挂载后初始化
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  nextTick(() => {
    isLaw.value = localStorage.getItem('isLaw')
    const isNetValue = localStorage.getItem('isNet')
    isNet.value = isNetValue === 'true'
  })
})

// 组件卸载时关闭 SSE 连接
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
defineExpose({ changeDynamicRows, fileRef, setDrag })
</script>

<style lang="less" scoped>
.sampleArea {
  .el-textarea__inner {
    padding: 18px 135px 18px 15px !important;
  }
}
.tooltip-wrapper {
  position: relative;
  display: flex;
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
</style>
