<template>
  <div class="main_content">
    <div class="title" v-if="pageType === 'query' || pageType === 'sample' || pageType === 'it'">
      <img src="../../../assets/chat.deepseek.com_.png" class="title_src" />
      <div>
        <div class="title_top" style="line-height: 33px">Hello!我是立讯技术百事通，有什么问题欢迎咨询</div>
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
            <div class="image"><img src="../../../assets/1.png" /></div>
            <div class="img_text">
              <div class="text_title">翻译</div>
              <div class="text_content">准确翻译成多国语言</div>
            </div>
          </div>
          <div class="img_item" style="margin-top: 10px" @click="changeType('final')">
            <div class="image"><img src="../../../assets/2.png" /></div>
            <div class="img_text">
              <div class="text_title">总结</div>
              <div class="text_content">AI智能总结,让复杂信息一目了然</div>
            </div>
          </div>
          <div class="img_item" style="margin-top: 10px">
            <div class="image"><img src="../../../assets/3.png" /></div>
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
            <div class="image"><img src="../../../assets/1.png" /></div>
            <div class="img_text">
              <div class="text_title">翻译</div>
              <div class="text_content">准确翻译成多国语言</div>
            </div>
          </div>
          <div class="img_item" style="margin-top: 10px" @click="changeType('final')">
            <div class="image"><img src="../../../assets/2.png" /></div>
            <div class="img_text">
              <div class="text_title">总结</div>
              <div class="text_content">AI智能总结,让复杂信息一目了然</div>
            </div>
          </div>
          <div class="img_item" style="margin-top: 10px">
            <div class="image"><img src="../../../assets/3.png" /></div>
            <div class="img_text">
              <div class="text_title">更多功能</div>
              <div class="text_content">开发中,敬请期待</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="title" v-if="pageType === 'tran'">
      <img src="../../../assets/chat.deepseek.com_.png" class="title_src" />
      <div>
        <div class="title_top" style="line-height: 33px">立讯技术AI翻译专家</div>
        <div class="title_top">熟练掌握翻译技巧～您的翻译好帮手</div>
      </div>
    </div>
    <div v-if="pageType === 'tran' && finalIng" class="title_wait">
      <span>正在为您翻译,请稍等</span>
      <span v-if="!transData">{{ dots }}</span>
    </div>
    <div class="title_tran_tip">
      <div v-if="pageType === 'tran'" :style="{ padding: transQuest ? '13px 15px' : '0px' }">
        {{ transQuest }}
      </div>
    </div>

    <div class="title_tran_data" v-if="pageType === 'tran'" :style="{ padding: transData ? '0px 15px' : '0px' }">
      <p>{{ transData }}</p>
    </div>

    <div class="query_common" v-if="pageType === 'tran' && transData">
      <div>
        <img
          src="../../../assets/refresh.png"
          style="margin-left: 10px"
          class="query_common_img"
          @click="refreshData"
        />
      </div>
      <div>
        <img src="../../../assets/up.png" @click="upCommon" class="query_common_img" style="margin-left: 15px" />
      </div>
      <div>
        <img src="../../../assets/down.png" style="margin-left: 15px" @click="downCommon" class="query_common_img" />
      </div>
    </div>

    <div class="title" v-if="pageType === 'final'">
      <img src="../../../assets/chat.deepseek.com_.png" class="title_src" />
      <div>
        <div class="title_top" style="line-height: 33px">立讯技术AI智能总结</div>
        <div class="title_top">精准概括，助您快速理解长文本</div>
      </div>
    </div>
    <div v-if="pageType === 'final' && finalIng" class="title_wait">
      <span>正在为您总结,请稍等</span>
      <span v-if="!finalData.title">{{ dots }}</span>
    </div>
    <div class="title_final_tip">
      <div class="title_final_query" v-if="pageType === 'final'" :style="{ padding: finalQuest ? '13px 15px' : '0px' }">
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
    <div class="query_common" v-if="pageType === 'final' && finalData.title">
      <div>
        <img
          src="../../../assets/refresh.png"
          style="margin-left: 10px"
          class="query_common_img"
          @click="refreshData"
        />
      </div>
      <div>
        <img src="../../../assets/up.png" @click="upCommon" class="query_common_img" style="margin-left: 15px" />
      </div>
      <div>
        <img src="../../../assets/down.png" style="margin-left: 15px" @click="downCommon" class="query_common_img" />
      </div>
    </div>
  </div>
  <div class="select_content">
    <div class="tran_select" v-if="pageType === 'query' || pageType === 'sample' || pageType === 'it'">
      <el-radio-group v-model="selectedMode" @change="changeMode" :disabled="isSampleLoad">
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
        style="width: 100%"
        class="custom-input"
        clearable
        @keydown="summitPost"
        @keyup.shift.enter="handleShiftEnter"
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
        @keydown="samplePost"
        @keyup.shift.enter="handleShiftEnter"
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
        <img :src="isSampleLoad ? imageC : newQuestion ? imageB : imageA" class="arrow" @click="submitSampleSend" />
      </div>
    </div>
    <div class="tran_select" v-if="pageType === 'tran'">
      <el-radio-group v-model="selectedLan">
        <el-radio v-for="item in lanList" :label="item">{{ item }}</el-radio>
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
        :maxlength="4096"
        :rows="dynamicRows"
        @input="adjustTextareaHeight('textareaInputTran')"
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
        @keydown="finalPost"
        @keyup.shift.enter="handleShiftEnter"
        ref="textareaInputFinal"
        type="textarea"
        :maxlength="4096"
        :rows="dynamicRows"
        @input="adjustTextareaHeight('textareaInputFinal')"
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
        <img :src="finalIng ? imageC : newQuestion ? imageB : imageA" class="arrow" @click="submitFinalSend" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useShared } from '../../../utils/useShared'
import imageB from '../../../assets/arrow_blue.png'
import imageA from '../../../assets/arrow_gray.png'
import imageC from '../../../assets/stop.png'
import request from '../../../utils/request' // 导入封装的 axios 方法
const emit = defineEmits([
  'submit-tran',
  'submit-final',
  'cancel-currentRequest',
  'submit-question',
  'submit-sample-title',
  'sample-post',
  'summit-post',
  'submit-tranSend',
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
  handleShiftEnter,
  adjustTextareaHeight,
  textareaInputQuery,
  textareaInputSample,
  textareaInputTran,
  textareaInputFinal,
  finalIng,
  isSampleLoad,
  updateFinalQuest,
  selectedLan,
  changeMode,
  transData,
  activeIndex,
  finalQuest,
  transQuest,
  dots
} = useShared()

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
const tranPost = event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认的换行行为
    emit('submit-tran')
  }
}

const finalPost = event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认的换行行为
    emit('submit-final')
  }
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

const submitFinalSend = () => {
  if (finalIng.value) {
    emit('cancel-currentRequest', 'final')
    return
  }
  emit('submit-final')
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
</script>

<style lang="less" scoped></style>
