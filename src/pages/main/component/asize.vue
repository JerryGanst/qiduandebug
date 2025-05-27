<template>
  <el-aside :width="isCollapsed ? '60px' : '280px'" class="aside">
    <div class="aside_left">
      <img class="aside_left_img" src="@/assets/logo.png" />
      <img class="aside_left_file" src="@/assets/upload_file.png" @click="toFile" v-if="isPowerFile" />
      <div class="user-avatar-container" v-if="isLogin">
        <!-- 头像 -->
        <el-avatar
          :size="40"
          :src="userInfo.url"
          class="user-avatar"
          @mouseenter="showPopup = true"
          @mouseleave="showPopup = false"
        />

        <!-- 弹窗 -->
        <el-popover v-model:visible="showPopup" placement="top-end" :width="100" trigger="hover">
          <template #reference>
            <div class="popover-reference"></div>
          </template>

          <div class="user-info-popup">
            <div class="user-info">
              <el-avatar :size="40" :src="avatarUrl" class="el_avatar" />
              <div class="user-details">
                <div class="username">{{ userInfo.id }}</div>
                <div class="username">{{ userInfo.name }}</div>
              </div>
            </div>
            <el-divider />
            <el-button type="text" @click="handleLogout">退出登录</el-button>
          </div>
        </el-popover>
      </div>
      <div class="noLogin" v-if="!isLogin" @click="dialogVisible = true">登录</div>
    </div>

    <div
      class="aside_right"
      :style="{
        width: isCollapsed ? '0px' : '220px',
        borderRight: isCollapsed ? 'none' : '2px solid #EAEAEA'
      }"
    >
      <!-- <div class="aside_right_content">
        <img src="@/assets/lux.png" />
      </div> -->
      <div class="aside_right_btn">
        <div @click="startNewConversation" class="back_set">
          {{ isCollapsed ? '' : '开启新对话' }}
        </div>
      </div>
      <el-menu :default-active="activeIndex" class="el_menu">
        <el-menu-item
          v-for="(question, index) in processedQuerys"
          :key="index"
          style="position: relative"
          @mouseenter="() => handleHover(index, true)"
          @mouseleave="() => handleHover(index, false)"
        >
          <!-- 文本区域：el-tooltip 仅作用于此处 -->
          <el-tooltip
            :content="question"
            placement="right"
            popper-class="custom-tooltip"
            :disabled="popoverVisible[index]"
          >
            <span
              @click="querySelect(question, index)"
              :class="{ 'active-span': activeIndex == index.toString() }"
              :style="{ width: hoverStates[index] ? '165px' : '180px' }"
            >
              {{ isCollapsed ? 'Q' : question }}
            </span>
          </el-tooltip>

          <!-- 独立弹窗触发器 -->
          <el-popover
            v-model:visible="popoverVisible[index]"
            popper-class="right-aligned-popover"
            placement="right"
            :popper-options="{
              modifiers: [
                {
                  name: 'offset',
                  options: { offset: [0, 15] } // 向右偏移 20px，向下偏移 10px
                },
                {
                  name: 'flip',
                  enabled: false // 禁用自动翻转
                }
              ],
              strategy: 'fixed'
            }"
            trigger="manual"
          >
            <template #reference>
              <div class="more" @click.stop="togglePopover(index)" v-if="hoverStates[index]">
                <img src="@/assets/more.png" class="aside_right_img" style="right: 15px" />
              </div>
            </template>
            <div class="popover-content">
              <el-popconfirm
                title="确定要删除吗？"
                confirm-button-text="确定"
                cancel-button-text="取消"
                icon="el-icon-warning"
                icon-color="red"
                @confirm="handleConfirmDelete(question, index)"
              >
                <template #reference>
                  <div class="edit_img delete_img">
                    <img src="@/assets/delete.png" class="aside_right_img" />
                    <div style="color: #d81e06; width: 60px; text-align: left; margin-left: 6px">删除</div>
                  </div>
                </template>
              </el-popconfirm>
              <div class="edit_img rename_img" @click="handleEdit(question, index)">
                <img src="@/assets/edit.png" class="aside_right_img" />
                <div style="width: 60px; text-align: left; margin-left: 6px">重命名</div>
              </div>
            </div>
          </el-popover>
        </el-menu-item>
      </el-menu>
    </div>
  </el-aside>
  <div class="foldable" :style="{ left: isCollapsed ? '70px' : '290px' }">
    <img :src="isCollapsed ? right : left" @click="toggleCollapse" />
  </div>
  <el-dialog v-model="dialogVisible" title="" width="400px" :before-close="handleClose" style="border-radius: 10px">
    <div class="login_title">
      <span><img src="@/assets/logo2.png" /></span>
      <span>立讯技术百事通</span>
    </div>
    <el-form :model="loginForm" :rules="rules" ref="loginForms" class="login-form">
      <el-form-item prop="username" class="form-item">
        <el-input v-model="loginForm.username" placeholder="请输入工号(用户名)" clearable>
          <template #prefix>
            <img src="@/assets/user.png" style="width: 20px; height: 20px" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password" class="form-item">
        <el-input
          v-model="loginForm.password"
          placeholder="请输入密码"
          clearable
          :type="passwordVisible ? 'text' : 'password'"
        >
          <template #prefix>
            <img src="@/assets/password.png" style="width: 20px; height: 20px" />
          </template>
          <template #suffix>
            <img
              v-if="loginForm.password"
              :src="passwordVisible ? View : Lock"
              alt=""
              @click="togglePasswordVisibility"
              style="cursor: pointer; width: 16px; height: 16px"
            />
            <!-- <el-icon @click="togglePasswordVisibility" style="cursor: pointer">
              <component :is="loginForm.password ? (passwordVisible ? Lock : View) : ''" />
            </el-icon> -->
          </template>
        </el-input>
      </el-form-item>
      <el-form-item class="button-item">
        <el-button type="primary" @click="submitForm" style="width: 100%; height: 40px">登录</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  <el-dialog
    v-model="titleVisible"
    title="编辑名称"
    width="500px"
    :before-close="handleTitleClose"
    style="border-radius: 10px"
  >
    <el-input
      v-model="titleQuestion"
      placeholder="请输入标题名称"
      style="width: 100%"
      clearable
      type="textarea"
      rows="5"
    />
    <div class="button-item_common">
      <el-button @click="titleVisible = false" style="width: 100px; height: 40px; margin-left: 15px">取消</el-button>
      <el-button type="primary" @click="submitTitle" style="width: 100px; height: 40px">确定</el-button>
    </div>
  </el-dialog>
  <commonModal ref="commonLedge"></commonModal>
</template>
<script setup>
import { ref, onMounted, computed, nextTick, reactive } from 'vue'
import { useShared } from '@/utils/useShared'
import { ElButton, ElDivider, ElMessage, ElPopover } from 'element-plus' // 引入 ElMessage
import { useRoute } from 'vue-router'
import Lock from '@/assets/lock.png' // 引入需要的图标
import View from '@/assets/view.png' // 引入需要的图标
import photo from '@/assets/chat.deepseek.com_.png'
import foldLeft from '@/assets/fold.svg'
import foldRight from '@/assets/fold_right.svg'
import left from '@/assets/159@2x.png'
import right from '@/assets/162@2x.png'
import request from '@/utils/request' // 导入封装的 axios 方法
import commonModal from './commonUploadModal.vue'
const isCollapsed = ref(false) // 左上角折叠控制
const showPopup = ref(false) // 是否展示左下角用户信息弹窗
const dialogVisible = ref(false) // 是否展示登录弹窗
const route = useRoute() // 路由信息对象
const loginForm = ref({
  // 登录弹窗信息对象
  username: '',
  password: ''
})
const avatarUrl = ref(photo) // 左下角用户头像
const titleQuestion = ref('')
const titleIndex = ref('')
const isPowerFile = ref(true)
const hoverStates = ref({}) // 悬停状态
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
  limitId,
  finalIng,
  docIng,
  dynamicRows,
  isSampleLoad,
  limitSample,
  transData,
  transQuest,
  selectedLan,
  finalData,
  finalQuest,
  messageContainer,
  deepType,
  fileObj,
  limitAry,
  fileAry,
  fileInputAry
} = useShared()
// 校验用户登录信息
const rules = {
  username: [{ required: true, message: '请输入工号(用户名)', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
const passwordVisible = ref(false)
const titleVisible = ref(false)
// 当前url的路由信息(由luxshare传来的参数)
const queryParams = route.query
const emit = defineEmits(['change-history', 'set-isLaw'])
// 左上角折叠控制函数
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
const handleTitleClose = done => {
  // 这里可以添加一些关闭前的逻辑
  done()
}
const popoverVisible = reactive({})
// 鼠标悬停处理
const handleHover = (index, isHovering) => {
  hoverStates.value = {
    ...hoverStates.value,

    [index]: isHovering
  }
}

const togglePopover = index => {
  popoverVisible[index] = !popoverVisible[index]
}
//获取用户信息接口
const getUserInfo = async id => {
  request
    .post('/UserInfo/getUserInfoById?id=' + id)
    .then(res => {
      if (res.status) {
        localStorage.setItem('userInfo', JSON.stringify(res.data))
        userInfo.value = res.data
        userInfo.value.url = 'https://dcs.luxshare-ict.com/Upload/emp_photo/' + userInfo.value.id + '.jpg?cp=zhaopian'
        if (powerList.value.includes(userInfo.value.id)) {
          localStorage.setItem('isLaw', true)
        } else {
          localStorage.setItem('isLaw', false)
        }
        nextTick(() => {
          emit('set-isLaw')
          emit('change-history')
        })
      }
    })
    .catch(err => {
      console.error(err)
    })
}
const extractLastBracket = str => {
  const lastOpenIndex = str.lastIndexOf('(')
  const lastCloseIndex = str.lastIndexOf(')')
  if (lastOpenIndex !== -1 && lastCloseIndex > lastOpenIndex) {
    return str.slice(lastOpenIndex + 1, lastCloseIndex)
  }
  return null
}
const handleClick = (param, e) => {
  // e.stopPropagation() // 正确获取事件对象
}
const handleEdit = (val, index) => {
  if (isSampleLoad.value || finalIng.value) {
    ElMessage.warning('有问题正在回答中，请稍后再修改')
    return
  }
  titleVisible.value = true
  titleQuestion.value = val
  titleIndex.value = index
}
const submitTitle = val => {
  const result = extractLastBracket(questions.value[titleIndex.value]) // 输出：状态:正常
  let params = titleQuestion.value + '(' + result + ')'
  params = params.replace(/\r\n|\n|\r/gm, '')
  questions.value[titleIndex.value] = params
  answerList.value[titleIndex.value].title = params
  titleVisible.value = false
  changeTitle(answerList.value[titleIndex.value].id, params)
}
const changeTitle = async (id, val) => {
  request
    .post('/Message/changeTitle?id=' + id + '&title=' + val.replace(/\([^)]*\)/g, ''))
    .then(res => {
      if (res.status) {
        titleQuestion.value = ''
        titleIndex.value = ''
        // for (var i = 0; i < answerList.value.length; i++) {
        //   if (id === answerList.value[i].id) {
        //     answerList.value[i].title = val.replace(/\([^)]*\)/g, '')
        //   }
        // }
        ElMessage.success('修改标题成功')
        emit('change-history')
      } else {
        titleQuestion.value = ''
        titleIndex.value = ''
      }
    })
    .catch(err => {
      titleQuestion.value = ''
      titleIndex.value = ''
      console.error(err)
    })
}

// 登录密码框 眼睛和锁的切换
const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}
//登录接口
const submitForm = async () => {
  const data = {
    userid: loginForm.value.username,
    password: loginForm.value.password
  }
  request
    .post('/UserInfo/login', {
      userid: loginForm.value.username,
      password: loginForm.value.password
      // showLoading: true
    })
    .then(res => {
      if (res.data && res.data.clientStatus === 'PASS') {
        ElMessage.success('登录成功')
        showPopup.value = false
        activeIndex.value = ''
        isLogin.value = true
        getUserInfo(data.userid)
        dialogVisible.value = false
      } else if (res.data && res.data.clientStatus !== 'PASS') {
        ElMessage.error(res.data.message)
      } else {
        ElMessage.error('登录失败,请稍后再试')
      }
    })
    .catch(err => {
      console.error(err)
    })
}
// 点击切换左侧历史记录（选中高亮控制）
const handleSelect = index => {
  activeIndex.value = index
}
// 点击开启新对话
const startNewConversation = () => {
  currentQuestion.value = ''
  newQuestion.value = ''
  tipQuery.value = ''
  dynamicRows.value = 1
  activeIndex.value = ''
  chatQuery.messages = []
  chatQuery.isLoading = false
  fileObj.value = ''
  fileAry.value = ''
  currentId.value = ''
  pageType.value = 'sample'
  selectedMode.value = '通用模式'
}
// 点击退出登录
const handleLogout = () => {
  // 处理退出登录逻辑
  ElMessage.success('退出成功')
  localStorage.setItem('userInfo', '')
  localStorage.setItem('isLaw', false)
  localStorage.setItem('powerList', [])
  questions.value = []
  queryTypes.value = []
  answerList.value = []
  chatQuery.messages = []
  chatQuery.isLoading = false
  isPowerFile.value = true
  currentId.value = ''
  currentQuestion.value = false
  isLogin.value = false
}
// 由luxshare带token进来,校验luxshare的合法性
const checkToken = async token => {
  request
    .post('/UserInfo/luxlinkLogin', {
      access_key: '76eb4367-a19d-4485-aadb-cea65fa8fbbe',
      tokenId: token
    })
    .then(res => {
      if (res.status) {
        ElMessage.success('登录成功')
        showPopup.value = false
        activeIndex.value = ''
        isLogin.value = true
        getUserInfo(res.data.uid)
      } else {
        dialogVisible.value = true
      }
    })
    .catch(err => {
      dialogVisible.value = true
    })
}
const handleClose = done => {
  // 这里可以添加一些关闭前的逻辑
  done()
}

// 点击确定删除历史记录
const handleConfirmDelete = (val, index) => {
  const queryData =
    selectedMode.value === '人资行政专题'
      ? '(query)'
      : selectedMode.value === 'IT专题'
        ? '(it)'
        : selectedMode.value === '法务专题'
          ? '(law)'
          : selectedMode.value === '通用模式'
            ? '(sample)'
            : selectedMode.value === '翻译'
              ? '(tran)'
              : '(final)'
  val = val + queryData

  if (isSampleLoad.value || finalIng.value) {
    ElMessage.warning('有问题正在回答中，请稍后再删除')
    return
  }

  let id = ''
  const queryLimit = []
  const anList = JSON.parse(JSON.stringify(answerList.value))
  for (var i = 0; i < anList.length; i++) {
    id = anList[index].id
    // if (anList[i].type === '人资行政专题' || anList[i].type === 'IT专题') {
    //   queryLimit.push(anList[i].title)
    //   if (anList[i].title === val) {
    //     id = anList[i].id
    //   }
    // } else if (anList[i].type === '通用模式') {
    //   if (anList[i].title === val) {
    //     id = anList[i].id
    //   }
    // } else if (anList[i].type === '翻译' || anList[i].type === '总结') {
    //   if (anList[i].title === val) {
    //     id = anList[i].id
    //   }
    // }
  }
  deleteData(id)
}

// 删除数据
const deleteData = async (id, isRefresh) => {
  // GET 请求
  request
    .post('/Message/deleteMessageById?id=' + id, {})
    .then(res => {
      if (res.status) {
        if (!isRefresh) {
          ElMessage.success('删除成功！')
          chatQuery.messages = []
          chatQuery.isLoading = false
          transQuest.value = ''
          transData.value = ''
          pageType.value = 'sample'
          selectedMode.value = '通用模式'
          activeIndex.value = ''
          currentQuestion.value = false
          emit('change-history')
        }
      }
    })
    .catch(err => {
      console.error(err)
    })
}

const querySelect = (val, index) => {
  activeIndex.value = index
  queryAn(val, index)
}
const getMatchingIndexes = (arr1, val) => {
  for (var i = 0; i < arr1.length; i++) {
    if (val === arr1[i].title) {
      return arr1[i].data.files ? arr1[i].data.files.originalFileName : arr1[i].data.question
    }
  }
}
// 点击切换左侧栏，控制左侧栏和右侧面板的数据
const queryAn = (val, index, data) => {
  currentQuestion.value = val
  newQuestion.value = ''
  isSampleStop.value = false
  isQueryStop.value = false
  limitLoading.value = false
  val = index || index === 0 ? questions.value[index] : val
  const queryList = questions.value
  const anList = JSON.parse(JSON.stringify(answerList.value))
  const queryLimit = []
  const queryLimitQs = []
  const queryIt = []
  const queryItQs = []
  const queryLaw = []
  const queryLawQs = []
  const querySample = []
  const queryTran = []
  const queryTranQs = []
  const queryFinal = []
  const queryFinalQs = []
  fileInputAry.value = []
  for (var j = 0; j < anList.length; j++) {
    if (anList[j].type === '人资行政专题') {
      queryLimit.push(anList[j].title)
      queryLimitQs.push(anList[j].data.question + '(query)')
      if (val == anList[j].title || val == anList[j].data.question + '(query)') {
        currentId.value = anList[j].id
        pageType.value = 'query'
        selectedMode.value = '人资行政专题'
        currentObj.value.messages = anList[j].data.answer
        currentObj.value.list = anList[j].data?.think
        deepType.value = anList[j].isThink
      }
    } else if (anList[j].type === 'IT专题') {
      queryIt.push(anList[j].title)
      queryItQs.push(anList[j].data.question + '(it)')
      if (val == anList[j].title || val == anList[j].data.question + '(it)') {
        currentId.value = anList[j].id
        pageType.value = 'it'
        selectedMode.value = 'IT专题'
        tipQuery.value = anList[j].data.question
        currentObj.value.messages = anList[j].data.answer
        currentObj.value.list = anList[j].data?.think
        deepType.value = anList[j].isThink
      }
    } else if (anList[j].type === '法务专题') {
      queryLaw.push(anList[j].title)
      queryLawQs.push(anList[j].data.question + '(law)')
      if (val == anList[j].title || val == anList[j].data.question + '(law)') {
        currentId.value = anList[j].id
        pageType.value = 'law'
        selectedMode.value = '法务专题'
        tipQuery.value = anList[j].data.question
        currentObj.value.messages = anList[j].data.answer
        currentObj.value.list = anList[j].data?.think
        deepType.value = anList[j].isThink
      }
    } else if (anList[j].type === '通用模式') {
      querySample.push(anList[j].title)
      if (
        val == anList[j].title ||
        val ==
          anList[j].data[0].content +
            (answerList.value[j].data[0].files
              ? answerList.value[j].data[0].files.map(item => item.originalFileName).join(',')
              : '') +
            '(sample)'
      ) {
        pageType.value = 'sample'
        selectedMode.value = '通用模式'
        const idx = anList.length === questions.value.length ? index : index - 1
        chatQuery.messages = anList[idx].data
        chatQuery.isLoading = false
        currentId.value = anList[idx].id
        deepType.value = anList[idx].isThink
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
    } else if (anList[j].type === '翻译') {
      queryTran.push(anList[j].title)
      queryTranQs.push(anList[j].data.question + '(tran)')
      if (val == anList[j].title) {
        currentQuestion.value = false
        pageType.value = 'tran'
        selectedMode.value = '翻译'
        transData.value = anList[j].data.answer
        transQuest.value = anList[j].data.files ? anList[j].data.files.originalFileName : anList[j].data.question
        selectedLan.value = anList[j].data.target
        currentId.value = anList[j].id
      }
    } else if (anList[j].type === '总结') {
      queryFinal.push(anList[j].title)
      queryFinalQs.push(anList[j].data.question + '(final)')
      if (val == anList[j].title) {
        currentQuestion.value = false
        pageType.value = 'final'
        selectedMode.value = '总结'
        finalData.value.data = anList[j].data.answer.key_points
        finalData.value.title = anList[j].data.answer.summary
        finalQuest.value = anList[j].data.files ? anList[j].data.files.originalFileName : anList[j].data.question
        currentId.value = anList[j].id
      }
    }
  }
  for (var i = 0; i < queryList.length; i++) {
    if (queryList[i] === val) {
      const match = val.match(/\(([^)]+)\)$/)
      if (match) {
        const result = match[1]
        pageType.value = result
      }
      if (pageType.value === 'query' || pageType.value === 'it' || pageType.value === 'law') {
        if (anList.length === queryList.length) {
          tipQuery.value = anList[i].data.question
        } else {
          const data = getMatchingIndexes(limitAry.value, queryList[i])
          tipQuery.value = data ? data : queryList[0].replace(/\([^)]*\)/g, '')
        }
      } else if (pageType.value === 'sample') {
        const hasName = anList.some(item => item.title === val)
        if (hasName) {
          if (currentId.value === limitId.value) {
            selectedMode.value = '通用模式'
            limitLoading.value = true
          } else {
            selectedMode.value = '通用模式'
            limitLoading.value = false
          }
        } else {
          nextTick(() => {
            selectedMode.value = '通用模式'
            limitLoading.value = true
            // chatQuery.messages = limitSample.value.messages
          })
        }
      } else if (pageType.value === 'tran') {
        currentQuestion.value = false
        if (anList.length === queryList.length) {
          transQuest.value = anList[i].data.question
        } else {
          const data = getMatchingIndexes(limitAry.value, queryList[i])
          transQuest.value = data ? data : queryList[0].replace(/\([^)]*\)/g, '')
        }
      } else if (pageType.value === 'final') {
        currentQuestion.value = false
        if (anList.length === queryList.length) {
          finalQuest.value = anList[i].data.question
        } else {
          const data = getMatchingIndexes(limitAry.value, queryList[i])
          finalQuest.value = data ? data : queryList[0].replace(/\([^)]*\)/g, '')
        }
      }
    }
  }
  const limitData = JSON.parse(JSON.stringify(queryTypes.value))
  for (var k = 0; k < limitData.length; k++) {
    if (val === limitData[k].name) {
      pageType.value = limitData[k].type
    }
  }
  if (pageType.value === 'query' && !queryLimit.includes(val) && !queryLimitQs.includes(val)) {
    currentObj.value.messages = {}
  }
  if (pageType.value === 'it' && !queryIt.includes(val) && !queryItQs.includes(val)) {
    currentObj.value.messages = {}
  }
  if (pageType.value === 'law' && !queryLaw.includes(val) && !queryLawQs.includes(val)) {
    currentObj.value.messages = {}
  }
  // if (pageType.value === 'sample' && !querySample.includes(val)) {
  //   console.log('abcd')
  //   chatQuery.messages = []
  //   chatQuery.isLoading = false
  // }
  if (pageType.value === 'tran' && !queryTran.includes(val) && !queryTranQs.includes(val)) {
    docIng.value = true
    transData.value = ''
  }
  if (pageType.value === 'tran' && (queryTran.includes(val) || queryTranQs.includes(val))) {
    docIng.value = false
  }
  if (pageType.value === 'final' && !queryFinal.includes(val) && !queryFinalQs.includes(val)) {
    docIng.value = true
    finalData.value.data = ''
  }
  if (pageType.value === 'final' && (queryFinal.includes(val) || queryFinalQs.includes(val))) {
    docIng.value = false
  }
}

const powerList = ref([
  'T10802004',
  '10353965',
  '10353964',
  'T10802005',
  '31001225',
  '10801390',
  'T17990001',
  'T93000161',
  '10500985',
  '10800001',
  '10335333',
  '10801127',
  'ZL044364',
  '13829448'
])
const getPower = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  request
    .post('/Files/permissionCheck?userId=' + userInfo.id)
    .then(res => {
      if (res.status) {
        localStorage.setItem('powerList', JSON.stringify(res.data))
        setPower(JSON.stringify(res.data))
      }
    })
    .catch(err => {
      console.error(err)
    })
}
onMounted(() => {
  if (localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).id) {
    isLogin.value = true
    const loginData = JSON.parse(localStorage.getItem('userInfo'))
    userInfo.value.id = loginData.id
    if (powerList.value.includes(loginData.id)) {
      localStorage.setItem('isLaw', true)
    } else {
      localStorage.setItem('isLaw', false)
    }
    getPower()
    userInfo.value.name = loginData.name
    userInfo.value.url = 'https://dcs.luxshare-ict.com/Upload/emp_photo/' + userInfo.value.id + '.jpg?cp=zhaopian'
    emit('change-history')
  } else {
    if (queryParams && queryParams.tokenId) {
      checkToken(queryParams.tokenId)
    } else {
      dialogVisible.value = true
    }
  }
})
const commonLedge = ref(null)
const toFile = () => {
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return false
  }
  commonLedge.value.openFile('')
}
const setPower = data => {
  const isPower = JSON.parse(data)
  // isPowerFile.value = isPower && isPower.length > 0
}

// 计算属性，处理左侧栏历史记录的数据
const processedQuerys = computed(() => {
  return questions.value.map(query => {
    // 使用正则表达式去掉括号及其内容
    return query.replace(/\([^)]*\)/g, '')
  })
})

defineExpose({ queryAn, deleteData, setPower })
</script>
<style lang="less" scoped>
.foldable {
  position: absolute;
  top: calc(50% - 15px);
  left: 290px;
  cursor: pointer;
  img {
    width: 10px;
    height: 31px;
    z-index: 10000;
  }
}
.popover-content {
  display: flex;
  flex-direction: column;
  .edit_img {
    display: flex;
    flex-direction: row;
    font-size: 14px;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 5px;
    img {
      width: 16px;
      height: 16px;
    }
  }
  .delete_img:hover {
    background: #fff2f0;
  }
  .rename_img:hover {
    background: #ededed;
  }
  :deep(.right-aligned-popover .el-popper) {
    padding-top: 10px !important;
    padding-bottom: 10px !important;
  }
}
.active-span {
  color: #1b6cff !important;
}
.aside {
  background: #f7f7f7;
  transition: width 0.3s ease-in-out; /* 添加缓动函数 */
  display: flex;
  position: relative; /* 为子元素绝对定位提供参考 */
  overflow: hidden; /* 隐藏溢出的内容 */
  .aside_left_file {
    position: absolute;
    width: 35px;
    height: 28px;
    top: 75px;
    cursor: pointer;
  }
  .aside_left {
    width: 60px;
    height: 44px;
    margin-top: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0; /* 防止折叠时被压缩 */
    .aside_left_img {
      width: 36px;
      height: 36px;
    }

    .noLogin {
      font-size: 14px;
      cursor: pointer;
      position: fixed;
      color: #1b6cff;
      bottom: 30px;
      left: 15px;
    }
    .user-avatar-container {
      position: fixed;
      bottom: 20px;
      left: 8px;
      .popover-reference {
        position: absolute;
        top: 0;
        right: 0;
        width: 40px;
        height: 40px;
      }
      .user-avatar {
        cursor: pointer;
      }
    }
  }

  .aside_right {
    width: 220px;
    background: #f9fbff;
    border-right: 2px solid #eaeaea;
    flex-shrink: 0;
    overflow: hidden;
    white-space: nowrap; /* 防止文字换行 */
    transform: translateX(0);
    transition: transform 0.3s ease-in-out;
    .aside_right_content {
      width: 200px;
      height: 62px;
      margin-top: 20px;
      margin-left: 10px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .aside_right_btn {
      padding: 22px 10px 10px 10px;
      .back_set {
        background-image: url('@/assets/start.png');
        background-repeat: no-repeat;
        padding-left: 42px;
        width: 100px;
        height: 36px;
        line-height: 36px;
        background-size: 16px 16px;
        background-position: 16px 11px;
        letter-spacing: 1px;
        background-color: #1b6cff;
        color: #fff;
        font-size: 16px;
        cursor: pointer;
        // background-color: #e6f2ff;
        border-radius: 10px;
        // font-size: 16px;
        // letter-spacing: 1px;
        // color: #1b6cff;
        // border-color: #e6f2ff;
        // opacity: 1;
      }
    }
    .el_menu {
      border-right: none;
      width: 220px; /* 保持固定宽度 */
      background: #f9fbff;
      .more {
        width: 55px;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        .aside_right_img {
          width: 4px;
          height: 13px;
          position: absolute;
          top: 13px;
        }
      }
    }
  }
  .aside_right.collapsed {
    transform: translateX(-100%);
  }
}
.login_title {
  width: 100%;
  display: flex;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  line-height: 40px;
  span {
    height: 40px;
    img {
      width: 40px;
      height: 40px;
      margin-right: 10px;
    }
  }
}
.login-form {
  padding: 20px 20px 0 20px;
  :deep(.el-form-item__label) {
    padding-right: 8px; /* 调整 label 和输入框的间距 */
  }

  :deep(.el-form-item__content) {
    justify-content: flex-start;
  }
  :deep(.el-form-item__content) {
    justify-content: center;
  }
  /* 登录按钮水平居中对齐 */
  .button-item {
    display: flex;
    justify-content: center;
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: 30px;
  }
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
        text-align: left;
      }
    }
  }
}
</style>
