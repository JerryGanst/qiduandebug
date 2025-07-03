<template>
  <el-aside :width="isCollapsed ? '60px' : '280px'" class="aside">
    <div class="aside_left">
      <img class="aside_left_img" src="@/assets/logo.png" />
      <div class="aside_left_message" @click="changeContent(1)">
        <div class="aside_img" :style="{ backgroundColor: selectType === 1 ? '#E6F4FF' : '#F7F7F7' }">
          <img :src="selectType === 1 ? messageBlue : messageGray" />
        </div>
        <div class="aside_message_text" :style="{ color: selectType === 1 ? '#1B6CFF' : '#9D9D9D' }">对话</div>
      </div>

      <div class="aside_left_file" v-if="isPowerFile" @click="changeContent(2)">
        <div class="aside_img" :style="{ backgroundColor: selectType === 2 ? '#E6F4FF' : '#F7F7F7' }">
          <img
            :src="selectType === 2 ? fileBlue : fileGray"
            :style="{ backgroundColor: selectType === 2 ? '#E6F4FF' : '#F7F7F7' }"
          />
        </div>
        <div class="aside_message_text" :style="{ color: selectType === 2 ? '#1B6CFF' : '#9D9D9D' }">知识库</div>
      </div>
      <div class="aside_left_file" @click="changeContent(3)" style="top: 225px">
        <div class="aside_img" :style="{ backgroundColor: selectType === 3 ? '#E6F4FF' : '#F7F7F7' }">
          <img
            :src="selectType === 3 ? IntelligenceBlue : IntelligenceGray"
            :style="{ backgroundColor: selectType === 3 ? '#E6F4FF' : '#F7F7F7' }"
          />
        </div>
        <div class="aside_message_text" :style="{ color: selectType === 3 ? '#1B6CFF' : '#9D9D9D' }">智能体</div>
      </div>

      <div class="user-avatar-container" v-if="isLogin">
        <!-- 头像 -->
        <el-avatar
          :size="36"
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
              <el-avatar :size="36" :src="avatarUrl" class="el_avatar" />
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
      <div class="asize_message" v-if="selectType === 1">
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
      <div class="asize_file" v-if="selectType === 2">
        <div
          class="asize_know"
          @click="changeFileModel(1)"
          :style="{
            backgroundColor: knowSelect === 1 ? '#1b6cff' : '#f9fbff',
            color: knowSelect === 1 ? '#fff' : '#6A6A6A',
            backgroundImage: knowSelect === 1 ? `url('${imgWhite}')` : `url('${imgGray}')`
          }"
        >
          个人知识库
        </div>
        <div
          class="asize_know"
          style="margin-top: 12px"
          @click="changeFileModel(2)"
          :style="{
            backgroundColor: knowSelect === 2 ? '#1b6cff' : '#f9fbff',
            color: knowSelect === 2 ? '#fff' : '#6A6A6A',
            backgroundImage: knowSelect === 2 ? `url('${imgWhite}')` : `url('${imgGray}')`
          }"
        >
          公用知识库
        </div>
        <div class="know_list" v-if="knowSelect === 2">
          <div
            class="know_item"
            v-for="(item, index) in powerArr"
            @click="knowItemSelect(index)"
            :style="{
              color: index === ItemSelect ? '#1B6CFF' : '#333333',
              marginTop: index === 0 ? '0px' : '5px'
            }"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
      <div class="asize_message" v-if="selectType === 3">
        <div class="aside_right_btn" style="display: flex">
          <div class="intel_img"><img src="@/assets/robot.png" /></div>
          <span class="intel_title">我的智能体</span>
        </div>
        <div style="width: 190px; margin-left: 10px; margin-top: 5px">
          <el-input
            v-model="searchTextIntel"
            placeholder="搜索历史对话"
            clearable
            @clear="clearData"
            @keydown.enter.prevent="searchData"
          >
            <template #suffix>
              <el-icon class="search-icon" @click="searchData" style="cursor: pointer"><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-menu :default-active="activeIndexIntel" class="el_menu" style="margin-top: 10px">
          <el-menu-item
            v-for="(question, index) in intelList"
            :key="index"
            style="position: relative"
            @mouseenter="() => handleHoverIntel(index, true)"
            @mouseleave="() => handleHoverIntel(index, false)"
          >
            <el-tooltip
              :content="question"
              placement="right"
              popper-class="custom-tooltip"
              :disabled="popoverVisibleIntel[index]"
            >
              <span
                @click="querySelectIntel(question, index)"
                :class="{ 'active-span': activeIndexIntel == index.toString() }"
                :style="{ width: hoverStatesIntel[index] ? '165px' : '180px' }"
              >
                {{ isCollapsed ? 'Q' : question }}
              </span>
            </el-tooltip>
            <el-popover
              v-model:visible="popoverVisibleIntel[index]"
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
                <div class="more" @click.stop="togglePopoverIntel(index)" v-if="hoverStatesIntel[index]">
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
                  @confirm="handleConfirmDeleteIntel(question, index)"
                >
                  <template #reference>
                    <div class="edit_img delete_img">
                      <img src="@/assets/delete.png" class="aside_right_img" />
                      <div style="color: #d81e06; width: 60px; text-align: left; margin-left: 6px">删除</div>
                    </div>
                  </template>
                </el-popconfirm>
                <div class="edit_img rename_img" @click="handleEditIntel(question, index)">
                  <img src="@/assets/edit.png" class="aside_right_img" />
                  <div style="width: 60px; text-align: left; margin-left: 6px">编辑</div>
                </div>
              </div>
            </el-popover>
          </el-menu-item>
        </el-menu>
        <div class="create_intel" @click="createIntel" v-if="!isCreate">创建智能体</div>
      </div>
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
    title="编辑对话名称"
    width="500px"
    :before-close="handleTitleClose"
    style="border-radius: 10px"
  >
    <el-input
      v-model="titleQuestion"
      placeholder="请输入对话名称"
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
  <el-dialog
    v-model="titleVisibleIntel"
    title="编辑智能体名称"
    width="500px"
    :before-close="handleTitleCloseIntel"
    style="border-radius: 10px"
  >
    <el-input
      v-model="titleQuestionIntel"
      placeholder="请输入智能体名称"
      style="width: 100%"
      clearable
      type="textarea"
      rows="5"
    />
    <div class="button-item_common">
      <el-button @click="titleVisibleIntel = false" style="width: 100px; height: 40px; margin-left: 15px">
        取消
      </el-button>
      <el-button type="primary" @click="submitTitleIntel" style="width: 100px; height: 40px">确定</el-button>
    </div>
  </el-dialog>
  <!-- <commonModal ref="commonLedge"></commonModal> -->
</template>
<script setup>
import { ref, onMounted, computed, nextTick, reactive, watch } from 'vue'
import { useShared } from '@/utils/useShared'
import { ElButton, ElDivider, ElMessage, ElPopover } from 'element-plus' // 引入 ElMessage
import { networkState } from '@/utils/net'
import { encryptData } from '@/utils/rsa'
import { Search } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import eventBus from '@/utils/eventBus'
import Lock from '@/assets/lock.png' // 引入需要的图标
import View from '@/assets/view.png' // 引入需要的图标
import photo from '@/assets/chat.deepseek.com_.png'
import foldLeft from '@/assets/fold.svg'
import foldRight from '@/assets/fold_right.svg'
import left from '@/assets/159@2x.png'
import right from '@/assets/162@2x.png'
import messageBlue from '@/assets/message_blue.png'
import messageGray from '@/assets/message_gray.png'
import fileBlue from '@/assets/file_blue.png'
import fileGray from '@/assets/file_gray.png'
import imgWhite from '@/assets/file_icon_white.png'
import imgGray from '@/assets/file_icon_gray.png'
import hrGray from '@/assets/hr_gray.png'
import hrBlue from '@/assets/hr_blue.png'
import itGray from '@/assets/it_gray.png'
import itBlue from '@/assets/it_blue.png'
import lawGray from '@/assets/law_gray.png'
import lawBlue from '@/assets/law_blue.png'
import IntelligenceGray from '@/assets/​​Intel_gray.png'
import IntelligenceBlue from '@/assets/​​Intel_blue.png'
import request from '@/utils/request' // 导入封装的 axios 方法
// import commonModal from './commonUploadModal.vue'
const isCollapsed = ref(false) // 左上角折叠控制
const showPopup = ref(false) // 是否展示左下角用户信息弹窗
const dialogVisible = ref(false) // 是否展示登录弹窗
const ItemSelect = ref(0)
const route = useRoute() // 路由信息对象
const loginForm = ref({
  // 登录弹窗信息对象
  username: '',
  password: ''
})
const avatarUrl = ref(photo) // 左下角用户头像
const titleQuestion = ref('')
const titleQuestionIntel = ref('')
const titleIndex = ref('')
const titleIndexIntel = ref('')
const isPowerFile = ref(true)
const searchTextIntel = ref('')
const hoverStates = ref({}) // 悬停状态
const hoverStatesIntel = ref({})
const {
  currentQuestion,
  newQuestion,
  isSampleStop,
  isQueryStop,
  currentIndex,
  limitLoading,
  limitIntelLoading,
  questions,
  answerList,
  answerListIntel,
  currentId,
  pageType,
  selectedMode,
  currentObj,
  tipQuery,
  userInfo,
  activeIndex,
  activeIndexIntel,
  queryTypes,
  chatQuery,
  isLogin,
  limitId,
  finalIng,
  docIng,
  tranIng,
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
  fileInputAry,
  contentType,
  knowSelect,
  intelList,
  isNet,
  isCreate,
  currentIntel,
  selectType,
  intelQuery,
  intelQuestion,
  isIntelStop,
  drayAry,
  currentIntelId
} = useShared()
// 校验用户登录信息
const rules = {
  username: [{ required: true, message: '请输入工号(用户名)', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
const passwordVisible = ref(false)
const knowOptions = ref([])
const titleVisible = ref(false)
const titleVisibleIntel = ref(false)
// 当前url的路由信息(由luxshare传来的参数)
const queryParams = route.query
const emit = defineEmits(['change-history', 'set-isLaw', 'set-message', 'set-FileModel', 'setNet'])

// 过滤后的数据（使用计算属性）
const filterIntelData = computed(() => {
  if (!searchTextIntel.value) {
    return intelList.value
  }

  const searchText = searchTextIntel.value.toLowerCase()
  return intelList.value.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(searchText)))
})

// 左上角折叠控制函数
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  eventBus.emit('setCollapsed', isCollapsed.value)
  // emit('set-message', isCollapsed.value)
}
const handleTitleClose = done => {
  // 这里可以添加一些关闭前的逻辑
  done()
}
const handleTitleCloseIntel = done => {
  // 这里可以添加一些关闭前的逻辑
  done()
}

const popoverVisible = reactive({})
const popoverVisibleIntel = reactive({})
// 鼠标悬停处理
const handleHover = (index, isHovering) => {
  hoverStates.value = {
    ...hoverStates.value,

    [index]: isHovering
  }
}
const handleHoverIntel = (index, isHovering) => {
  hoverStatesIntel.value = {
    ...hoverStatesIntel.value,
    [index]: isHovering
  }
}

const togglePopover = index => {
  popoverVisible[index] = !popoverVisible[index]
}
const togglePopoverIntel = index => {
  popoverVisibleIntel[index] = !popoverVisibleIntel[index]
}
const createIntel = () => {
  eventBus.emit('setInfo', 'create')
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
          getPower()
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
const changeContent = val => {
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return false
  }
  drayAry.value = []
  if (val === 3) {
    for (var i = 0; i < 50; i++) {
      popoverVisible[i] = false
      popoverVisibleIntel[i] = false
    }
  }
  // if (val === 2 || val === 3) {
  //   if (!isNet.value) {
  //     ElMessage.warning('该模式仅支持通过office网络访问')
  //     return
  //   }
  // }
  selectType.value = val
  contentType.value = val
  ItemSelect.value = 0
  fileInputAry.value = []
  emit('set-message', contentType.value)
}
const changeFileModel = val => {
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return false
  }
  knowSelect.value = val
  ItemSelect.value = 0
  emit('set-FileModel', knowSelect.value)
}
const knowItemSelect = val => {
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return false
  }
  ItemSelect.value = val

  const data = powerArr.value[val].target
  if (data !== 'HR' && data !== 'IT') {
    if (!isNet.value) {
      return
      ElMessage.warning('该模式仅支持通过office网络访问')
    }
  }
  eventBus.emit('changeKnow', powerArr.value[val])
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
const handleEditIntel = (val, index) => {
  eventBus.emit('setInfo', {
    param1: 'edit',
    param2: val
  })
}

const submitTitleIntel = val => {
  let params = titleQuestionIntel.value
  intelList.value[titleIndexIntel.value] = params
  answerListIntel.value[titleIndexIntel.value].title = params
  titleVisibleIntel.value = false
  changeTitleIntel(answerListIntel.value[titleIndexIntel.value].id, params)
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

const changeTitleIntel = async (id, val) => {
  request
    .post('/Message/changeTitle?id=' + id + '&title=' + val)
    .then(res => {
      if (res.status) {
        ElMessage.success('修改智能体标题成功')
      } else {
      }
    })
    .catch(err => {
      console.error(err)
    })
}
const changeTitle = async (id, val) => {
  request
    .post('/Message/changeTitle?id=' + id + '&title=' + val.replace(/\([^)]*\)/g, ''))
    .then(res => {
      if (res.status) {
        titleQuestion.value = ''
        titleIndex.value = ''
        ElMessage.success('修改对话标题成功')
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
const submitForm = () => {
  request
    .get('/UserInfo/getPublicKey')
    .then(res => {
      if (res.status) {
        const password = encryptData(res.data.publicKey, loginForm.value.password)

        submitLoginForm(res.data.requestId, password)
      }
    })
    .catch(err => {
      console.error(err)
    })
}
const submitLoginForm = async (id, password) => {
  request
    .post('/UserInfo/login', {
      userid: loginForm.value.username,
      password: password,
      requestId: id
    })
    .then(res => {
      if (res.data && res.data.clientStatus === 'PASS') {
        ElMessage.success('登录成功')
        showPopup.value = false
        activeIndex.value = ''
        activeIndexIntel.value = ''
        isLogin.value = true

        getUserInfo(loginForm.value.username)
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
const handleSelectIntel = index => {
  activeIndexIntel.value = index
}

// 点击开启新对话
const startNewConversation = () => {
  currentQuestion.value = ''
  newQuestion.value = ''
  tipQuery.value = ''
  dynamicRows.value = 1
  activeIndex.value = ''
  currentIndex.value = ''
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
  selectType.value = 1
  contentType.value = 1
  // isPowerFile.value = false
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
        activeIndexIntel.value = ''
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

const handleConfirmDeleteIntel = (val, index) => {
  let id = ''
  const anList = JSON.parse(JSON.stringify(answerListIntel.value))
  for (var i = 0; i < anList.length; i++) {
    id = anList[index].id
  }
  deleteDataIntel(id)
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
  }
  deleteData(id)
}
const deleteDataIntel = async (id, isRefresh) => {
  request
    .post('/Agent/deleteAgentById?agentId=' + id, {})
    .then(res => {
      if (res.status) {
        if (!isRefresh) {
          eventBus.emit('getHistoryData', '')
        }
      }
    })
    .catch(err => {
      console.error(err)
    })
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
const querySelectIntel = (val, index) => {
  activeIndexIntel.value = index
  queryAnIntel(val, index)
}
// 搜索方法
const searchData = () => {
  eventBus.emit('getHistoryData', searchTextIntel.value)
  // 调用后端接口或其他搜索逻辑
}
const clearData = () => {
  eventBus.emit('getHistoryData', '')
  // 调用后端接口或其他搜索逻辑
}

const getMatchingIndexes = (arr1, val) => {
  for (var i = 0; i < arr1.length; i++) {
    if (val === arr1[i].title) {
      return arr1[i].data.files ? arr1[i].data.files.originalFileName : arr1[i].data.question
    }
  }
}

const queryAnIntel = (val, index) => {
  intelQuestion.value = ''
  isIntelStop.value = false
  limitIntelLoading.value = false
  val = index || index === 0 ? intelList.value[index] : val
  const queryList = intelList.value
  const anList = JSON.parse(JSON.stringify(answerListIntel.value))
  const querySample = []

  fileInputAry.value = []
  const id = anList[index].id
  currentIntelId.value = id
  eventBus.emit('changeInfo', id)
  eventBus.emit('getRecord', id)

  eventBus.emit('closeIntel')
}
// 点击切换左侧栏，控制左侧栏和右侧面板的数据
const queryAn = (val, index, data) => {
  currentQuestion.value = val
  newQuestion.value = ''
  isSampleStop.value = false
  isQueryStop.value = false
  limitLoading.value = false
  if (!currentIndex.value && currentIndex.value !== 0) {
    currentIndex.value = activeIndex.value
  }
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
  drayAry.value = []
  fileInputAry.value = []
  console.log(index)
  console.log(anList)
  for (var j = 0; j < anList.length; j++) {
    if (anList[j].type === '人资行政专题') {
      queryLimit.push(anList[j].title)
      queryLimitQs.push(anList[j].data.question + '(query)')
      if (val == anList[j].title || val == anList[j].data.question + '(query)') {
        currentId.value = anList[j].id
        pageType.value = 'query'
        selectedMode.value = '人资行政专题'
        const idx = anList.length === questions.value.length ? index : index - 1
        tipQuery.value = anList[idx].data.question
        currentObj.value.messages = anList[idx].data.answer
        currentObj.value.list = anList[idx].data?.think
        deepType.value = anList[idx].isThink
      }
    } else if (anList[j].type === 'IT专题') {
      queryIt.push(anList[j].title)
      queryItQs.push(anList[j].data.question + '(it)')
      if (val == anList[j].title || val == anList[j].data.question + '(it)') {
        currentId.value = anList[j].id
        pageType.value = 'it'
        selectedMode.value = 'IT专题'
        const idx = anList.length === questions.value.length ? index : index - 1
        tipQuery.value = anList[idx].data.question
        currentObj.value.messages = anList[idx].data.answer
        currentObj.value.list = anList[idx].data?.think
        deepType.value = anList[idx].isThink
      }
    } else if (anList[j].type === '法务专题') {
      queryLaw.push(anList[j].title)
      queryLawQs.push(anList[j].data.question + '(law)')
      if (val == anList[j].title || val == anList[j].data.question + '(law)') {
        currentId.value = anList[j].id
        pageType.value = 'law'
        selectedMode.value = '法务专题'
        const idx = anList.length === questions.value.length ? index : index - 1
        tipQuery.value = anList[idx].data.question
        currentObj.value.messages = anList[idx].data.answer
        currentObj.value.list = anList[idx].data?.think
        deepType.value = anList[idx].isThink
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
        const idx = anList.length === questions.value.length ? index : index - 1
        transData.value = anList[idx].data.answer
        transQuest.value = anList[idx].data.files ? anList[idx].data.files.originalFileName : anList[idx].data.question
        selectedLan.value = anList[idx].data.target
        currentId.value = anList[idx].id
      }
    } else if (anList[j].type === '总结') {
      queryFinal.push(anList[j].title)
      queryFinalQs.push(anList[j].data.question + '(final)')
      if (val == anList[j].title) {
        currentQuestion.value = false
        pageType.value = 'final'
        selectedMode.value = '总结'
        const idx = anList.length === questions.value.length ? index : index - 1
        finalData.value.data = anList[idx].data.answer.key_points
        finalData.value.title = anList[idx].data.answer.summary
        finalQuest.value = anList[idx].data.files ? anList[idx].data.files.originalFileName : anList[idx].data.question
        currentId.value = anList[idx].id
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
        }
      } else if (pageType.value === 'final') {
        currentQuestion.value = false
        if (anList.length === queryList.length) {
          finalQuest.value = anList[i].data.question
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
  if (pageType.value === 'tran' && !queryTran.includes(val) && !queryTranQs.includes(val)) {
    tranIng.value = true
    transData.value = ''
  }
  if (pageType.value === 'tran' && (queryTran.includes(val) || queryTranQs.includes(val))) {
    tranIng.value = false
  }
  if (pageType.value === 'final' && !queryFinal.includes(val) && !queryFinalQs.includes(val)) {
    docIng.value = true
    finalData.value.data = ''
  }
  if (pageType.value === 'final' && (queryFinal.includes(val) || queryFinalQs.includes(val))) {
    docIng.value = false
  }
  console.log(currentObj.value)
}

const powerList = ref([
  'T10802004',
  '31005892',
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
const powerArr = ref([])

const getUserPower = () => {
  request
    .get('/UserInfo/getUserIP')
    .then(res => {
      if (res.status) {
        localStorage.setItem('isNet', res.data)
        isNet.value = res.data
        emit('setNet')
      }
    })
    .catch(err => {
      console.error(err)
    })
}
const getPower = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  request
    .post('/Files/permissionCheck?userId=' + userInfo.id)
    .then(res => {
      if (res.status) {
        localStorage.setItem('powerList', JSON.stringify(res.data))
        powerArr.value = res.data

        if (powerArr.value.length > 0) {
          for (var i = 0; i < powerArr.value.length; i++) {
            powerArr.value[i].name =
              powerArr.value[i].target === 'IT'
                ? 'IT知识库'
                : powerArr.value[i].target === 'HR'
                  ? '人资行政知识库'
                  : '法务知识库'
          }
        }
        setPower(JSON.stringify(res.data))
        eventBus.emit('changeKnow', powerArr.value[0])
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
    getUserPower()
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
// const toFile = () => {
//   if (!isLogin.value) {
//     ElMessage.warning('请先登录再使用')
//     return false
//   }
//   commonLedge.value.openFile('')
// }
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
// 监听网络类型变化
watch(
  () => networkState.networkType,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      getUserPower()
      // 在这里触发你的业务逻辑
    }
  }
)
defineExpose({ queryAn, deleteData, setPower })
</script>
<style lang="less" scoped>
.foldable {
  position: absolute;
  top: calc(50% - 15px);
  left: 290px;
  cursor: pointer;
  z-index: 1001;
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

  .aside_left {
    width: 60px;
    height: 44px;
    margin-top: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0; /* 防止折叠时被压缩 */
    .aside_left_file {
      position: absolute;
      width: 100%;
      height: 66px;

      flex-direction: column;
      top: 150px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;

      .aside_img {
        width: 36px;
        height: 36px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f7f7f7;
        border-radius: 12px;
        img {
          width: 28px;
          height: 28px;
        }
      }
    }
    .aside_left_message {
      position: absolute;
      width: 100%;
      height: 70px;
      top: 75px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .aside_img {
        width: 36px;
        height: 36px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 12px;
        background-color: #f7f7f7;
        img {
          width: 28px;
          height: 28px;
        }
      }
    }
    .aside_message_text {
      width: 100%;
      height: 24px;
      line-height: 24px;
      font-size: 12px;

      text-align: center;
    }
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
        width: 36px;
        height: 36px;
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
    .asize_file {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      .asize_know {
        width: 100px;
        height: 36px;
        border-radius: 6px;
        line-height: 36px;
        font-size: 16px;
        color: #fff;
        margin-top: 22px;
        margin-left: 10px;
        background-color: #1b6cff;
        background-size: 20px 20px;
        background-position: 14px 9px;
        background-repeat: no-repeat;
        padding-left: 40px;
        background-image: url('@/assets/file_icon_white.png');
        cursor: pointer;
      }
      .know_list {
        margin-top: 10px;

        .know_item {
          width: 125px;
          height: 32px;
          padding-left: 12px;
          line-height: 32px;
          margin-left: 38px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          background-repeat: no-repeat;
          background-size: 24px 24px;
          background-position: 4px 4px;
        }
        .know_item:hover {
          background-color: #dce6fa;
        }
      }
    }
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
    .create_intel {
      width: 140px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      background-color: #1b6cff;
      border-radius: 10px;
      font-size: 14px;
      position: absolute;
      bottom: 23px;
      left: 10px;
      height: 36px;
      text-indent: 16px;
      cursor: pointer;
      background-image: url('@/assets/create.png');
      background-repeat: no-repeat;
      background-size: 20px 20px;
      background-position: 16px 8px;
    }
    .aside_right_btn {
      padding: 22px 10px 10px 10px;
      .intel_img {
        width: 32px !important;
        height: 32px !important;
        img {
          width: 100%;
          height: 100%;
          float: left;
        }
      }
      .intel_title {
        color: #333333;
        font-size: 16px;
        padding-left: 12px;
        line-height: 32px;
      }
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
