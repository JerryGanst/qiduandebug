<template>
  <div class="main_content">
    <div class="title" v-if="pageType === 'query' || pageType === 'sample' || pageType === 'it'">
      <img src="@/assets/chat.deepseek.com_.png" class="title_src" />
      <div>
        <div class="title_top" style="line-height: 33px; font-weight: bold">
          Hello!我是立讯技术百事通，有什么问题欢迎咨询
        </div>
        <div class="title_item">
          <span>我可以帮您做这些事情</span>
        </div>
      </div>
    </div>
    <div class="content_list" v-if="pageType === 'query' || pageType === 'it'">
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
        <div class="list_title">效率工具</div>
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
              <div class="text_content">开发中,敬请期待</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content_list" v-if="pageType === 'sample'">
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
        <div class="list_title">效率工具</div>
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
              <div class="text_content">开发中,敬请期待</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="title" v-if="pageType === 'tran'">
      <img src="@/assets/chat.deepseek.com_.png" class="title_src" />
      <div>
        <div class="title_top" style="line-height: 30px; font-weight: bold">立讯技术AI翻译专家</div>
        <div class="title_top" style="font-size: 16px; font-weight: 400; line-height: 36px">
          熟练掌握翻译技巧～您的翻译好帮手
        </div>
      </div>
    </div>

    <div class="title_tran_tip" v-if="pageType === 'tran'">
      <div
        v-if="
          (transQuest.includes('txt') && transQuest.endsWith('txt')) ||
          (transQuest.includes('doc') && transQuest.endsWith('doc')) ||
          (transQuest.includes('docx') && transQuest.endsWith('docx'))
        "
        :style="{
          padding: transQuest ? '7px 15px' : '0px'
        }"
        @click="showFile('tran')"
        style="color: #333; background-color: #fdfdfd; display: flex; align-items: center; cursor: pointer"
      >
        <span style="display: flex; align-items: center">
          <img :src="transQuest.endsWith('txt') ? text : word" style="width: 24px; height: 30px" />
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
    <div v-if="pageType === 'tran' && finalIng && docIng" class="title_wait">
      <span>
        <img src="@/assets/robot.png" style="width: 36px; height: 36px" />
      </span>
      <span style="padding-left: 10px">正在为您翻译,请稍等</span>
      <span v-if="!transData">{{ dots }}</span>
    </div>
    <div class="title_tran_data" v-if="pageType === 'tran'" :style="{ padding: transData ? '0px 15px' : '0px' }">
      <p>{{ transData }}</p>
    </div>

    <div class="query_common" v-if="pageType === 'tran' && transData">
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

    <div class="title" v-if="pageType === 'final'">
      <img src="@/assets/chat.deepseek.com_.png" class="title_src" />
      <div>
        <div class="title_top" style="line-height: 30px; font-weight: bold">立讯技术AI智能总结</div>
        <div class="title_top" style="font-size: 16px; font-weight: 400; line-height: 36px">
          精准概括，助您快速理解长文本
        </div>
      </div>
    </div>

    <div class="title_final_tip" v-if="pageType === 'final'">
      <div
        v-if="
          (finalQuest.includes('txt') && finalQuest.endsWith('txt')) ||
          (finalQuest.includes('doc') && finalQuest.endsWith('doc')) ||
          (finalQuest.includes('docx') && finalQuest.endsWith('docx'))
        "
        @click="showFile('final')"
        :style="{
          padding: finalQuest ? '7px 15px' : '0px'
        }"
        style="
          color: #333;
          background-color: #fdfdfd;
          display: flex;
          align-items: center;
          margin-top: 34px;
          border-radius: 10px;
          cursor: pointer;
        "
      >
        <span style="display: flex; align-items: center">
          <img :src="finalQuest.endsWith('txt') ? text : word" style="width: 24px; height: 30px" />
        </span>
        <span style="padding-left: 10px">{{ finalQuest }}</span>
      </div>
      <div v-else class="title_final_query" :style="{ padding: finalQuest ? '10px 15px' : '0px' }">
        <div>{{ finalQuest }}</div>
      </div>
    </div>
    <div v-if="pageType === 'final' && docIng" class="title_wait">
      <span>
        <img src="@/assets/robot.png" style="width: 36px; height: 36px" />
      </span>
      <span style="padding-left: 10px">正在为您总结,请稍等</span>
      <span v-if="!finalData.title">{{ dots }}</span>
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
    <div class="query_common" v-if="pageType === 'final' && finalData.title">
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
    <div class="tran_select" v-if="pageType === 'query' || pageType === 'sample' || pageType === 'it'">
      <el-radio-group v-model="selectedMode" @change="changeMode" :disabled="isSampleLoad">
        <el-radio-button label="通用模式" value="通用模式">通用模式</el-radio-button>
        <el-radio-button label="人资行政专题" value="人资行政专题">人资行政专题</el-radio-button>
        <el-radio-button label="IT专题" value="IT专题">IT专题</el-radio-button>
      </el-radio-group>
    </div>
    <div class="textarea" v-if="pageType === 'query' || pageType === 'it'">
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
        <!-- <el-tooltip content="仅支持 text/pdf/excel/doc 格式" placement="top">
          <el-upload
            action="#"
            :http-request="handleUpload"
            :before-upload="beforeUpload"
            :show-file-list="false"
            :accept="allowedTypes"
          >
            <el-icon class="upload-icon" :size="42">
              <Document />
            </el-icon>
          </el-upload>
        </el-tooltip> -->
        <!-- <img
          :src="deepType ? deepSelect : deep"
          class="arrow"
          @click="checkDeepType"
          style="margin-right: 10px"
          v-if="pageType === 'it'"
        /> -->
        <div
          class="tooltip-wrapper"
          @mouseenter="showFileTip = true"
          @mouseleave="showFileTip = false"
          v-if="pageType === 'it'"
        >
          <img :src="deepType ? deepSelect : deep" class="arrow" @click="checkDeepType" style="margin-right: 10px" />

          <transition name="fade">
            <div v-if="showFileTip" class="tooltip">{{ !deepType ? '切换成深度思考模式' : '切换成普通模式' }}</div>
          </transition>
        </div>
        <img :src="isSampleLoad ? imageC : newQuestion ? imageB : imageA" class="arrow" @click="submitQuestionSend" />
      </div>
    </div>
    <div class="textarea" v-if="pageType === 'sample'">
      <el-input
        v-model="newQuestion"
        placeholder="请输入您的问题,换行请按下Shift+Enter"
        style="width: 100%"
        class="custom-input"
        clearable
        @keydown.enter.prevent="samplePost"
        @keyup.shift.enter.prevent="handleShiftEnter('textareaInputSample')"
        ref="textareaInputSample"
        type="textarea"
        :maxlength="4096"
        :rows="dynamicRows"
        @input="adjustTextareaHeight('textareaInputSample')"
      />
      <!-- 发送图标 -->
      <div class="send-icon">
        <!-- <el-tooltip content="仅支持 text/pdf/excel/doc 格式" placement="top">
          <el-upload
            action="#"
            :http-request="handleUpload"
            :before-upload="beforeUpload"
            :show-file-list="false"
            :accept="allowedTypes"
          >
            <el-icon class="upload-icon" :size="42">
              <Document />
            </el-icon>
          </el-upload>
        </el-tooltip> -->
        <!-- <img
          :src="deepType ? deepSelect : deep"
          class="arrow"
          @click="checkDeepType"
          style="margin-right: 10px; position: relative"
        /> -->
        <div class="tooltip-wrapper" @mouseenter="showFileTip = true" @mouseleave="showFileTip = false">
          <img :src="deepType ? deepSelect : deep" class="arrow" @click="checkDeepType" style="margin-right: 10px" />

          <transition name="fade">
            <div v-if="showFileTip" class="tooltip">{{ !deepType ? '切换成深度思考模式' : '切换成普通模式' }}</div>
          </transition>
        </div>
        <img :src="isSampleLoad ? imageC : newQuestion ? imageB : imageA" class="arrow" @click="submitSampleSend" />
      </div>
    </div>
    <div class="tran_select" v-if="pageType === 'tran'">
      <el-radio-group v-model="selectedLan">
        <el-radio-button v-for="item in lanList" :label="item" :value="item">{{ item }}</el-radio-button>
      </el-radio-group>
    </div>
    <div class="textarea" v-if="pageType === 'tran'">
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
        <!-- <el-tooltip content="仅支持 txt/doc/docx 格式" placement="top">
          <el-upload
            action="#"
            :multiple="true"
            :http-request="handleAutoUpload"
            :before-upload="beforeUpload"
            :show-file-list="false"
            :accept="allowedTypes"
            :auto-upload="true"
          >
            <el-icon class="upload-icon" :size="42">
              <Document />
            </el-icon>
          </el-upload>
        </el-tooltip> -->
        <!-- <el-icon class="upload-icon" :size="30" @click="showFile('tran')" style="margin-right: 10px">
          <Document />
        </el-icon> -->
        <div class="tooltip-wrapper" @mouseenter="showFileTip = true" @mouseleave="showFileTip = false">
          <img src="@/assets/file.png" class="arrow" @click="showFile('tran')" style="margin-right: 10px" />

          <transition name="fade">
            <div v-if="showFileTip" class="tooltip">添加文件,大小不能超过50M且文本长度不超过9000字</div>
          </transition>
        </div>
        <img :src="finalIng ? imageC : newQuestion ? imageB : imageA" class="arrow" @click="submitTranSend" />
      </div>
    </div>

    <div class="textarea" v-if="pageType === 'final'">
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
        <!-- <el-tooltip content="仅支持 txt/doc/docx 格式" placement="top">
          <el-upload
            action="#"
            :multiple="true"
            :http-request="handleAutoUpload"
            :before-upload="beforeUpload"
            :show-file-list="false"
            :accept="allowedTypes"
            :auto-upload="true"
          >
            <el-icon class="upload-icon" :size="42">
              <Document />
            </el-icon>
          </el-upload>
        </el-tooltip> -->

        <!-- <el-icon class="upload-icon" :size="30" @click="showFile('final')" style="margin-right: 10px">
          <Document />
        </el-icon> -->
        <!-- <img src="@/assets/file.png" class="arrow" @click="showFile('final')" style="margin-right: 10px" /> -->
        <div class="tooltip-wrapper" @mouseenter="showFileTip = true" @mouseleave="showFileTip = false">
          <img src="@/assets/file.png" class="arrow" @click="showFile('final')" style="margin-right: 10px" />

          <transition name="fade">
            <div v-if="showFileTip" class="tooltip">添加文件,大小不能超过50M且文本长度不超过9000字</div>
          </transition>
        </div>
        <img :src="finalIng ? imageC : newQuestion ? imageB : imageA" class="arrow" @click="submitFinalSend" />
      </div>
    </div>
  </div>
  <FileUpload ref="fileRef" @submit-tran="submitFileTran" @submit-final="submitFileFinal"></FileUpload>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus' // 引入 ElMessage
import FileUpload from './fileUploadModal.vue'
import { useShared } from '@/utils/useShared'
import imageB from '@/assets/arrow_blue.png'
import imageA from '@/assets/arrow_gray.png'
import imageC from '@/assets/stop.png'
import deep from '@/assets/deep.png'
import deepSelect from '@/assets/deepSelect.png'
import word from '@/assets/w.png'
import text from '@/assets/text.png'
import request from '@/utils/request' // 导入封装的 axios 方法
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
  'submit-sampleSend'
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
  textareaInputTran,
  textareaInputFinal,
  finalIng,
  docIng,
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
  deepType,
  checkDeepType
} = useShared()
const fileRef = ref(null)
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
const showFileTip = ref(false)
// 文件验证
// const allowedTypes =
//   '.txt,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

// // 文件类型验证
// const beforeUpload = file => {
//   const isValidType = ['doc', 'docx', 'txt'].some(ext => file.name.toLowerCase().endsWith(`.${ext}`))
//   const maxSize = 1 * 1024 * 1024
//   if (!isValidType) {
//     ElMessage.error('仅支持 txt/doc/docx 格式!')
//     return false
//   }
//   if (file.size > maxSize) {
//     ElMessage.error('文件大小不能超过1MB')
//     return false
//   }
//   return true
// }

// const handleAutoUpload = ({ file }) => {
//   const formData = new FormData()
//   formData.append('files', file) // 字段名需与后端匹配[1,6](@ref)

//   request
//     .post('/AI/fileUpload', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data' // 必须设置[3,5](@ref)
//       }
//     })
//     .then(res => {
//       if (res.status) {
//         ElMessage.success('上传成功')
//       }
//     })
//     .catch(err => {
//       // loadingInstance.close();
//       ElMessage.error('上传失败')
//       // botMessage.text = '抱歉，暂时无法获取回复';
//     })

//   // try {
//   //   await axios.post('http://10.180.17.77:8080/upload', formData, {
//   //     headers: {
//   //       'Content-Type': 'multipart/form-data' // 必须设置[3,5](@ref)
//   //     }
//   //   })
//   //   ElMessage.success(`${file.name} 上传成功`)
//   // } catch (err) {
//   //   ElMessage.error(`${file.name} 上传失败: ${err.message}`)
//   // }
// }

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

const showFile = val => {
  console.log(activeIndex.value)
  if (activeIndex.value || activeIndex.value == 0) {
    fileObj.value = answerList.value[activeIndex.value]?.data?.files
  } else {
    fileObj.value = ''
  }
  fileRef.value.openFile(val)
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

// 组件挂载后初始化
// onMounted(() => {
//   nextTick(() => {
//     adjustTextareaHeight(textareaInputSample.value) // 初始调整高度
//     // getTopQuestion('通用模式')
//     // getTopQuestion('人资行政专题')
//     // getTopQuestion('IT专题')
//   })
// })
defineExpose({ changeDynamicRows, fileRef })
</script>

<style lang="less" scoped>
.tooltip-wrapper {
  position: relative;
  display: flex;
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
