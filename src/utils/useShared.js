import { ref, reactive, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus' // 引入 ElMessage
const currentQuestion = ref('') // 控制页面展示问答页还是介绍页
const newQuestion = ref('') // 文本域输入值
const isSampleStop = ref(false) // 控制通用模式 终止之后的状态
const isQueryStop = ref(false) // 控制人资模式 终止之后的状态
const limitLoading = ref(false) // 切换左侧历史记录，判断当前选中的记录是否处于问答状态中
const questions = ref([]) // 左侧历史记录标题数组
const answerList = ref([]) //历史记录数组
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
const queryTypes = ref([]) //左侧栏 问题+类型 比如如何打卡（'query'） 拼接成的数组对象
const userInfo = ref({
  department: '',
  id: '',
  name: '',
  url: ''
})
const messageContainer = ref(null)
const chatQuery = reactive({
  //通用模式数据对象
  messages: []
})
const chatCurrent = reactive({
  //通用模式数据对象
  messages: []
})
const isLogin = ref(false) // 判断是否登录
const dynamicRows = ref(1) // 问答文本域的动态行数（高度）
const isSampleLoad = ref(false) // 判断是否正在问答状态
const finalData = ref({
  title: '',
  data: []
})
const handleShiftEnter = val => {
  const textareaRef =
    val === 'textareaInputQuery'
      ? textareaInputQuery
      : val === 'textareaInputSample'
        ? textareaInputSample
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
const textareaInputTran = ref(null) // 获取 textarea 元素的引用
const textareaInputFinal = ref(null) // 获取 textarea 元素的引用
const finalIng = ref(false)
const finalQuest = ref('')
const selectedLan = ref('中文')
const transData = ref('')
const transQuest = ref('')
const dots = ref('.') // 初始点号
const limitId = ref('')
const fileObj = ref('')
const fileAry = ref([])
const deepType = ref(false)
const docIng = ref(false)
const limitAry = ref([])
const showFileTip = ref(false)
const showModelTip = ref(false)
const fileInputAry = ref([])
const adjustTextareaHeight = val => {
  const textareaRef =
    val === 'textareaInputQuery'
      ? textareaInputQuery
      : val === 'textareaInputSample'
        ? textareaInputSample
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
    ElMessage.warning('请先登录再使用')
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
const changeMode = () => {
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
        : selectedMode.value === 'IT专题'
          ? 'it'
          : selectedMode.value === '法务专题'
            ? 'law'
            : selectedMode.value === '翻译'
              ? 'tran'
              : 'final'
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
  const updateIsQueryStop = newName => {
    isQueryStop.value = newName
  }
  const updateLimitLoading = newName => {
    limitLoading.value = newName
  }
  const updateQuestions = newName => {
    questions.value = newName
  }
  const updateAnswerList = newName => {
    answerList.value = newName
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
  const updateTipQuery = newName => {
    tipQuery.value = newName
  }
  const updateActiveIndex = newName => {
    activeIndex.value = newName
  }
  const updateQueryTypes = newName => {
    queryTypes.value = newName
  }
  const updateChatQuery = newName => {
    chatQuery.messages = newName
  }
  const updateChatCurrent = newName => {
    chatCurrent.messages = newName
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
  const updateTransQuest = newName => {
    transQuest.value = newName
  }
  const updateDots = newName => {
    dots.value = newName
  }
  const updateLimitId = newName => {
    limitId.value = newName
  }
  const updateMessageContainer = newName => {
    messageContainer.value = newName
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

  watch(
    newQuestion,
    newVal => {
      if (!newVal.trim()) {
        newQuestion.value = ''
      }
    },
    { deep: true }
  )
  return {
    currentQuestion,
    newQuestion,
    isSampleStop,
    isQueryStop,
    limitLoading,
    limitId,
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
    textareaInputQuery,
    textareaInputSample,
    textareaInputTran,
    textareaInputFinal,
    transQuest,
    dots,
    chatCurrent,
    messageContainer,
    deepType,
    docIng,
    limitAry,
    showFileTip,
    showModelTip,
    fileInputAry,
    changeMode,
    updateCurrentQuestion,
    updateNewQuestion,
    updateIsSampleStop,
    updateIsQueryStop,
    updateLimitLoading,
    updateQuestions,
    updateAnswerList,
    updateCurrentId,
    updatePageType,
    updateSelectedMode,
    updateCurrentObj,
    updateTipQuery,
    updateActiveIndex,
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
    updateFileObj,
    updateDeepType,
    checkDeepType,
    updateDocIng,
    updateLimitAry,
    updateShowFileTip,
    updateShowModelTip,
    updateFileAry,
    updateFileInputAry
  }
}
