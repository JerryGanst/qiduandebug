import { ref,reactive } from 'vue'
const currentQuestion = ref('')
const newQuestion = ref('')
const isSampleStop = ref(false)
const isQueryStop = ref(false)
const limitLoading = ref(false)
const questions = ref([])
const answerList = ref([])
const currentId = ref('')
const pageType = ref('sample')
const selectedMode = ref('通用模式')
const currentObj = ref({
  messages: {},
  messageList: [],
})

const imitLoading = ref(false)
const tipQuery = ref('')
const activeIndex = ref('')
const queryTypes = ref([])
const userInfo = ref({
  userid: '',
})
const chatQuery = reactive({
    messages: [],
  })
const currentAnswer = ref('')
const isLogin  = ref(false)
const dynamicRows = ref(1)
const isSampleLoad = ref(false)
export function useShared() {
    const updateCurrentQuestion = (newName) => {
        currentQuestion.value = newName
    }

    const updateNewQuestion = (newName) => {
        newQuestion.value = newName
    }
    const updateIsSampleStop = (newName) => {
        isSampleStop.value = newName
    }
    const updateIsQueryStop = (newName) => {
        isQueryStop.value = newName
    }
    const updateLimitLoading = (newName) => {
        limitLoading.value = newName
    }
    const updateQuestions= (newName) => {
        questions.value = newName
    }
    const updateAnswerList = (newName) => {
        answerList.value = newName
    }
    const updateCurrentId = (newName) => {
        currentId.value = newName
    }
    const updatePageType = (newName) => {
        pageType.value = newName
    }
    const updateSelectedMode = (newName) => {
        selectedMode.value = newName
    }
    const updateCurrentObj = (newName) => {
        currentObj.value = newName
    }
    const updateTipQuery = (newName) => {
        tipQuery.value = newName
    }
    const updateImitLoading = (newName) => {
        imitLoading.value = newName
    }
    const updateActiveIndex = (newName) => {
        activeIndex.value = newName
    }
    const updateQueryTypes = (newName) => {
        queryTypes.value = newName
    }
    const updateChatQuery = (newName) => {
        chatQuery.messages = newName
    }
    const updateCurrentAnswer = (newName) => {
        currentAnswer.value = newName
    }
    const updateIsLogin = (newName) => {
        isLogin.value = newName
    }
    const updateDynamicRows = (newName) => {
        dynamicRows.value = newName
    }   
    const updateIsSampleLoad = (newName) => {
        isSampleLoad.value = newName
    }     
  return { currentQuestion,newQuestion,isSampleStop,isQueryStop,limitLoading,questions,answerList,currentId,pageType,selectedMode,currentObj,tipQuery,imitLoading,userInfo,
    activeIndex,queryTypes,chatQuery,currentAnswer,isLogin,dynamicRows,isSampleLoad,updateCurrentQuestion,updateNewQuestion,updateIsSampleStop,updateIsQueryStop,updateLimitLoading,updateQuestions,updateAnswerList,updateCurrentId,updatePageType,updateSelectedMode,updateCurrentObj,
    updateTipQuery,updateImitLoading,updateActiveIndex,updateQueryTypes,updateChatQuery,updateCurrentAnswer,updateIsLogin,updateDynamicRows,updateIsSampleLoad
    }
}