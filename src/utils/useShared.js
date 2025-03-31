import { ref, reactive } from 'vue'
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
  name: ''
})
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
const handleShiftEnter = () => {
  // Shift + Enter 时允许换行
  newQuestion.value += '\n'
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
    const clampedRows = Math.min(Math.max(rows, 1), 4) // 限制1-4行

    // 直接设置高度（无论行数是否变化）
    textarea.style.height = `${lineHeight * clampedRows + padding}px`

    // 滚动条逻辑（保留原有逻辑）
    textarea.style.overflowY = rows > 4 ? 'auto' : 'hidden'
  }
}

const changeMode = () => {
  // console.log(val)
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
          : selectedMode.value === '翻译'
            ? 'tran'
            : 'final'
  chatQuery.messages = []
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
    updateLimitId
  }
}
