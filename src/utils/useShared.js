import { ref, reactive, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus' // 引入 ElMessage
const currentQuestion = ref('') // 控制页面展示问答页还是介绍页
const newQuestion = ref('') // 文本域输入值
const intelQuestion = ref('') // 文本域输入值

const isSampleStop = ref(false) // 控制通用模式 终止之后的状态
const limitFile = ref({})
const limitFinalFile = ref({})
const isQueryStop = ref(false) // 控制人资模式 终止之后的状态
const limitLoading = ref(false) // 切换左侧历史记录，判断当前选中的记录是否处于问答状态中
const limitTranLoading = ref(false)
const limitQueryLoading = ref(false)
const questions = ref([]) // 左侧历史记录标题数组
const intelList = ref([])
const agentChatList = ref([])
const answerList = ref([]) //历史记录数组
const selectType = ref(1)
const isTranStop = ref(false)
const recordId = ref('')
const answerListIntel = ref([])
const currentIntelId = ref('')
const tempChatId = ref('')
const currentIntel = ref({
  name: '',
  role: '',
  tone: '',
  description: '',
  agentId: ''
})
const isCreate = ref(false)
const contentType = ref(1)
// 判断是否是智能体对话详情页
const isAgentDetail = ref(false)
const currentId = ref('') // 左侧历史记录当前选中的id
const pageType = ref('sample') // 当前页面类型
const selectedMode = ref('通用模式') // 模式
const currentObj = ref({
  // 人资模式数据对象
  list: {},
  messages: {},
  messageList: []
})
const limitSample = ref({
  messages: []
})
const tipQuery = ref('') // 翻译、总结、人资模式 问答框标题（问题）
const activeIndex = ref('') // 左侧栏当前选中的索引
const activeIndexIntel = ref('')
const queryTypes = ref([]) //左侧栏 问题+类型 比如如何打卡（'query'） 拼接成的数组对象
const userInfo = ref({
  department: '',
  id: '',
  name: '',
  url: ''
})
const messageContainer = ref(null)
const messageContainerIntel = ref(null)
const messageContainerTran = ref(null)
const chatQuery = reactive({
  //通用模式数据对象
  messages: []
})
const loadingId = ref('')
const currentIndex = ref('')
const intelQuery = reactive({
  //智能体数据对象
  messages: []
})
const limitIntelLoading = ref(false)
const chatCurrent = reactive({
  //通用模式数据对象
  messages: []
})
const intelCurrent = reactive({
  //通用模式数据对象
  messages: []
})
const isLogin = ref(false) // 判断是否登录
const dynamicRows = ref(1) // 问答文本域的动态行数（高度）
const isSampleLoad = ref(false) // 判断是否正在问答状态
const isNet = ref(true)
const dragUploads = ref(null)
const finalData = ref({
  title: '',
  data: []
})
const handleShiftEnter = val => {
  const textareaRef =
    val === 'textareaInputQuery'
      ? textareaInputQuery
      : val === 'textareaInputIntel'
        ? textareaInputIntel
        : val === 'textareaInputSample'
          ? textareaInputSample
          : val === 'textareaInputSampleCurrent'
            ? textareaInputSampleCurrent
            : val === 'textareaInputTran'
              ? textareaInputTran
              : textareaInputFinal
  const textarea = textareaRef.value?.textarea
  if (textarea) {
    const startPos = textarea.selectionStart
    const endPos = textarea.selectionEnd

    // 直接操作 DOM 插入单个换行
    textarea.value = textarea.value.substring(0, startPos) + '\n' + textarea.value.substring(endPos)

    // 同步到 v-model
    newQuestion.value = textarea.value

    // 调整光标位置
    const newPos = startPos + 1
    nextTick(() => {
      textarea.setSelectionRange(newPos, newPos)
      adjustTextareaHeight(val) // 手动触发高度调整
    })
  }
}
const textareaInputQuery = ref(null) // 获取 textarea 元素的引用
const textareaInputSample = ref(null) // 获取 textarea 元素的引用
const textareaInputSampleCurrent = ref(null) // 获取 textarea 元素的引用
const textareaInputTran = ref(null) // 获取 textarea 元素的引用
const textareaInputFinal = ref(null) // 获取 textarea 元素的引用
const textareaInputIntel = ref(null) // 获取 textarea 元素的引用

const finalIng = ref(false)
const finalQuest = ref('')
const selectedLan = ref('中文')
const transData = ref('')
const currentTransData = ref('')
const transQuest = ref('')
const dots = ref('.') // 初始点号
const limitId = ref('')
const limitTranId = ref('')
const limitQueryId = ref('')
const fileObj = ref('')
const fileAry = ref([])
const drayAry = ref([])
const deepType = ref(false)
const docIng = ref(false)
const tranIng = ref(false)
const currentTip = ref(false)
const limitAry = ref([])
const showFileTip = ref(false)
const showModelTip = ref(false)
const isLaw = ref(false)
const enableBoardOffice = ref(false)
const knowSelect = ref(1)
const fileInputAry = ref([])
const isDragOver = ref(false)
const isIntelStop = ref(false)
const conversationId = ref('') // 保存填入对话ID
const loadingIntelId = ref('') // 当前正在发生对话的智能体
const adjustTextareaHeight = val => {
  const textareaRef =
    val === 'textareaInputQuery'
      ? textareaInputQuery
      : val === 'textareaInputSample'
        ? textareaInputSample
        : val === 'textareaInputSampleCurrent'
          ? textareaInputSampleCurrent
          : val === 'textareaInputIntel'
            ? textareaInputIntel
            : val === 'textareaInputTran'
              ? textareaInputTran
              : textareaInputFinal
  const textarea = textareaRef.value?.textarea

  if (textarea) {
    // 强制重置高度（核心修改点）
    textarea.style.height = '0px' // 先压缩到最小高度
    const computedStyle = window.getComputedStyle(textarea)
    // 计算行高（兼容 Element Plus 默认 line-height: 1.5）
    const lineHeight = parseFloat(computedStyle.lineHeight) || 24 // 默认24px备用
    const padding = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom)

    // 计算实际内容高度（含滚动高度）
    const scrollHeight = textarea.scrollHeight

    // 计算行数（四舍五入代替 Math.floor）
    const rows = Math.round((scrollHeight - padding) / lineHeight)
    const clampedRows = Math.min(Math.max(rows, 1), 5) // 限制1-5行

    // 直接设置高度（无论行数是否变化）
    textarea.style.height = `${lineHeight * clampedRows + padding}px`

    // 滚动条逻辑（保留原有逻辑）
    textarea.style.overflowY = rows > 5 ? 'auto' : 'hidden'
  }
}
const isObject = variable => {
  const type = Object.prototype.toString.call(variable)
  return type === '[object PointerEvent]' || type === '[object KeyboardEvent]'
}
const checkData = val => {
  if (!isLogin.value) {
    ElMessage({
      message: '请先登录再使用',
      type: 'warning'
    })

    return false
  }
  if (isObject(val) && !newQuestion.value) {
    val = ''
    ElMessage.warning('请输入您的问题再发送')
    return false
  }
  if (val && !isObject(val)) {
    newQuestion.value = val
  }
  if (!newQuestion.value) {
    ElMessage.warning('请输入您的问题再发送')
    return false
  }
  return true
}

// 1. 创建模式映射表（建议放在文件顶部作为常量）
const MODE_MAPPING = new Map([
  ['通用模式', 'sample'],
  ['人资行政专题', 'query'],
  ['IT专题', 'it'],
  ['法务专题', 'law'],
  ['董办专题', 'board'],
  ['翻译', 'tran']
]);

const changeMode = () => {
  currentQuestion.value = false
  activeIndex.value = ''
  newQuestion.value = ''
  dynamicRows.value = 1
  currentId.value = ''
  drayAry.value = []

// 2. 通过Map获取值（带默认值）
  pageType.value = MODE_MAPPING.get(selectedMode.value) ?? 'final';
  chatQuery.messages = []
}
const checkDeepType = () => {
  if (isSampleLoad.value || finalIng.value) {
    ElMessage.warning('有问题正在回答中，请稍后再切换')
    return
  }
  deepType.value = !deepType.value
}

export function useShared() {
  const updateCurrentQuestion = newName => {
    currentQuestion.value = newName
  }

  const updateNewQuestion = newName => {
    newQuestion.value = newName
  }
  const updateIsSampleStop = newName => {
    isSampleStop.value = newName
  }
  const updateIsIntelStop = newName => {
    isIntelStop.value = newName
  }
  const updateConversationId = newName => {
    conversationId.value = newName
  }

  const updateLoadingIntelId = newName => {
    loadingIntelId.value = newName
  }

  const updateIsQueryStop = newName => {
    isQueryStop.value = newName
  }
  const updateLimitLoading = newName => {
    limitLoading.value = newName
  }
  const updateLimitTranLoading = newName => {
    limitTranLoading.value = newName
  }
  const updateLimitQueryLoading = newName => {
    limitQueryLoading.value = newName
  }

  const updateQuestions = newName => {
    questions.value = newName
  }
  const updateIntelList = newName => {
    intelList.value = newName
  }
  const updateAgentChatList = newName => {
    agentChatList.value = newName
  }
  const updateAnswerList = newName => {
    answerList.value = newName
  }
  const updateIsTranStop = newName => {
    isTranStop.value = newName
  }

  const updateAnswerListIntel = newName => {
    answerListIntel.value = newName
  }
  const updateCurrentId = newName => {
    currentId.value = newName
  }
  const updatePageType = newName => {
    pageType.value = newName
  }
  const updateSelectedMode = newName => {
    selectedMode.value = newName
  }
  const updateCurrentObj = newName => {
    currentObj.value = newName
  }
  const updateCurrentIntel = newName => {
    currentIntel.value = newName
  }
  const updateloadingId = newName => {
    loadingId.value = newName
  }

  const updateTipQuery = newName => {
    tipQuery.value = newName
  }
  const updateCurrentTip = newName => {
    currentTip.value = newName
  }

  const updateActiveIndex = newName => {
    activeIndex.value = newName
  }
  const updateActiveIndexIntel = newName => {
    activeIndexIntel.value = newName
  }
  const updateLimitFile = newName => {
    limitFile.value = newName
  }
  const updateLimitFinalFile = newName => {
    limitFinalFile.value = newName
  }
  const updateQueryTypes = newName => {
    queryTypes.value = newName
  }
  const updateChatQuery = newName => {
    chatQuery.messages = newName
  }
  const updateIntelQuery = newName => {
    intelQuery.messages = newName
  }

  const updateChatCurrent = newName => {
    chatCurrent.messages = newName
  }
  const updateIntelCurrent = newName => {
    intelCurrent.messages = newName
  }

  const updateIsLogin = newName => {
    isLogin.value = newName
  }
  const updateDynamicRows = newName => {
    dynamicRows.value = newName
  }
  const updateIsSampleLoad = newName => {
    isSampleLoad.value = newName
  }
  const updateLimitSample = newName => {
    limitSample.value = newName
  }

  const updateFinalTitle = newName => {
    finalData.value.title = newName
  }
  const updateFinalData = newName => {
    finalData.value.data = newName
  }
  const updateFinalIng = newName => {
    finalIng.value = newName
  }
  const updateFinalQuest = newName => {
    finalQuest.value = newName
  }
  const updateSelectedLan = newName => {
    selectedLan.value = newName
  }
  const updateTransData = newName => {
    transData.value = newName
  }
  const updateCurrentTransData = newName => {
    currentTransData.value = newName
  }

  const updateTransQuest = newName => {
    transQuest.value = newName
  }
  const updateDots = newName => {
    dots.value = newName
  }
  const updateLimitId = newName => {
    limitId.value = newName
  }
  const updateLimitTranId = newName => {
    limitTranId.value = newName
  }
  const updateLimitQueryId = newName => {
    limitQueryId.value = newName
  }

  const updateMessageContainer = newName => {
    messageContainer.value = newName
  }
  const updateMessageContainerTran = newName => {
    messageContainerTran.value = newName
  }

  const updateMessageContainerIntel = newName => {
    messageContainerIntel.value = newName
  }

  const updateFileObj = newName => {
    fileObj.value = newName
  }
  const updateFileAry = newName => {
    fileAry.value = newName
  }

  const updateDeepType = newName => {
    deepType.value = newName
  }
  const updateDocIng = newName => {
    docIng.value = newName
  }
  const updateTranIng = newName => {
    tranIng.value = newName
  }

  const updateLimitAry = newName => {
    limitAry.value = newName
  }
  const updateShowFileTip = newName => {
    showFileTip.value = newName
  }
  const updateShowModelTip = newName => {
    showModelTip.value = newName
  }
  const updateFileInputAry = newName => {
    fileInputAry.value = newName
  }
  const updateIsLaw = newName => {
    isLaw.value = newName
  }
  const updateEnableBoardOffice = newName => {
    enableBoardOffice.value = newName
  }
  const updateContentType = newName => {
    contentType.value = newName
  }
  const updateIsAgentDetail= newName => {
    isAgentDetail.value = newName
  }
  const updateKnowSelect = newName => {
    knowSelect.value = newName
  }
  const updateDragUploads = newName => {
    dragUploads.value = newName
  }
  const updateIsDragOver = newName => {
    isDragOver.value = newName
  }
  const updateIsCreate = newName => {
    isCreate.value = newName
  }
  const updateIsNet = newName => {
    isNet.value = newName
  }
  const updateIntelQuestion = newName => {
    intelQuestion.value = newName
  }
  const updateSelectType = newName => {
    selectType.value = newName
  }
  const updateLimitIntelLoading = newName => {
    limitIntelLoading.value = newName
  }
  const updateCurrentIntelId = newName => {
    currentIntelId.value = newName
  }
  const updateTempChatId = newName => {
    tempChatId.value = newName
  }
  const updateRecordId = newName => {
    recordId.value = newName
  }
  const updateCurrentIndex = newName => {
    currentIndex.value = newName
  }
  const updateDrayAry = newName => {
    drayAry.value = newName
  }
  watch(
    newQuestion,
    newVal => {
      if (!newVal.trim()) {
        newQuestion.value = ''
      }
    },
    { deep: true }
  )
  watch(
    intelQuestion,
    newVal => {
      if (!newVal.trim()) {
        intelQuestion.value = ''
      }
    },
    { deep: true }
  )
  return {
    currentQuestion,
    currentIndex,
    messageContainerTran,
    newQuestion,
    selectType,
    recordId,
    isNet,
    isTranStop,
    isCreate,
    currentIntelId,
    tempChatId,
    isSampleStop,
    isIntelStop,
    conversationId,
    loadingIntelId,
    isQueryStop,
    drayAry,
    isDragOver,
    limitLoading,
    limitFile,
    limitIntelLoading,
    intelQuestion,
    knowSelect,
    dragUploads,
    limitId,
    limitTranId,
    limitQueryId,
    questions,
    loadingId,
    intelList,
    agentChatList,
    answerList,
    answerListIntel,
    intelCurrent,
    currentId,
    pageType,
    selectedMode,
    currentObj,
    currentIntel,
    tipQuery,
    currentTip,
    userInfo,
    activeIndex,
    activeIndexIntel,
    limitFinalFile,
    queryTypes,
    chatQuery,
    intelQuery,
    limitTranLoading,
    limitQueryLoading,
    isLogin,
    fileObj,
    fileAry,
    dynamicRows,
    isSampleLoad,
    limitSample,
    finalData,
    finalIng,
    finalQuest,
    selectedLan,
    transData,
    currentTransData,
    textareaInputQuery,
    textareaInputSample,
    textareaInputSampleCurrent,
    textareaInputTran,
    textareaInputFinal,
    textareaInputIntel,
    transQuest,
    dots,
    chatCurrent,
    messageContainer,
    messageContainerIntel,
    deepType,
    docIng,
    tranIng,
    limitAry,
    showFileTip,
    showModelTip,
    fileInputAry,
    isLaw,
    enableBoardOffice,
    contentType,
    isAgentDetail,
    changeMode,
    updateCurrentIntel,
    updateIsIntelStop,
    updateConversationId,
    updateLoadingIntelId,
    updateCurrentQuestion,
    updateLimitFinalFile,
    updateLimitTranId,
    updateDrayAry,
    updateNewQuestion,
    updateIsSampleStop,
    updateIsQueryStop,
    updateLimitLoading,
    updateQuestions,
    updateAnswerList,
    updateLimitFile,
    updateAnswerListIntel,
    updateCurrentId,
    updatePageType,
    updateSelectedMode,
    updateCurrentIndex,
    updateCurrentObj,
    updateTipQuery,
    updateCurrentTransData,
    updateActiveIndex,
    updateloadingId,
    updateIsTranStop,
    updateQueryTypes,
    updateChatQuery,
    updateIsLogin,
    updateDynamicRows,
    updateIsSampleLoad,
    updateFinalData,
    updateFinalTitle,
    updateLimitSample,
    handleShiftEnter,
    adjustTextareaHeight,
    updateFinalIng,
    updateFinalQuest,
    updateSelectedLan,
    updateTransData,
    updateTransQuest,
    updateDots,
    updateChatCurrent,
    updateLimitId,
    checkData,
    updateMessageContainer,
    updateMessageContainerTran,
    updateMessageContainerIntel,
    updateFileObj,
    updateDeepType,
    checkDeepType,
    updateDocIng,
    updateTranIng,
    updateLimitAry,
    updateShowFileTip,
    updateShowModelTip,
    updateFileAry,
    updateFileInputAry,
    updateIsLaw,
    updateEnableBoardOffice,
    updateKnowSelect,
    updateDragUploads,
    updateIsDragOver,
    updateIntelList,
    updateAgentChatList,
    updateActiveIndexIntel,
    updateIsCreate,
    updateContentType,
    updateIsAgentDetail,
    updateIsNet,
    updateIntelQuestion,
    updateCurrentTip,
    updateIntelQuery,
    updateIntelCurrent,
    updateSelectType,
    updateLimitIntelLoading,
    updateCurrentIntelId,
    updateTempChatId,
    updateRecordId,
    updateLimitTranLoading,
    updateLimitQueryLoading,
    updateLimitQueryId
  }
}
