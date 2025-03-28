<template>
  <el-aside :width="isCollapsed ? '60px' : '280px'" class="aside">
    <div class="aside_left">
      <img src="../../../assets/fold.png" @click="toggleCollapse" class="aside_left_img" />
      <div class="user-avatar-container" v-if="isLogin">
        <!-- 头像 -->
        <el-avatar
          :size="40"
          :src="avatarUrl"
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
      <div class="noLogin" v-if="!isLogin" @click="dialogVisible = true">未登录</div>
    </div>

    <div
      class="aside_right"
      :style="{
        width: isCollapsed ? '0px' : '220px',
        borderRight: isCollapsed ? 'none' : '2px solid #EAEAEA',
        display: isCollapsed ? 'none' : 'block'
      }"
    >
      <div class="aside_right_content">
        <img src="../../../assets/lux.png" />
      </div>
      <div class="aside_right_btn">
        <el-button type="primary" @click="startNewConversation" class="back_set">
          {{ isCollapsed ? '' : '开启新对话' }}
        </el-button>
      </div>
      <el-menu :default-active="activeIndex" @select="handleSelect" class="el_menu">
        <el-tooltip
          v-for="(question, index) in processedQuerys"
          :key="index"
          :content="question"
          placement="right"
          popper-class="custom-tooltip"
        >
          <el-menu-item :index="index.toString()" @click="queryAn(question, index)" style="position: relative">
            <span>{{ isCollapsed ? 'Q' : question }}</span>
            <el-popconfirm
              title="确定要删除吗？"
              confirm-button-text="确定"
              cancel-button-text="取消"
              icon="el-icon-warning"
              icon-color="red"
              @confirm="handleConfirmDelete(question)"
              @cancel="handleCancel"
            >
              <!-- 触发元素：图标 -->
              <template #reference>
                <img src="../../../assets/delete.png" class="aside_right_img" />
              </template>
            </el-popconfirm>
          </el-menu-item>
        </el-tooltip>
      </el-menu>
    </div>
  </el-aside>
  <el-dialog v-model="dialogVisible" title="登录" width="30%" :before-close="handleClose">
    <el-form :model="loginForm" :rules="rules" ref="loginForms" class="login-form">
      <el-form-item label="工号" prop="username" class="form-item">
        <el-input v-model="loginForm.username" placeholder="请输入工号(用户名)" clearable></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password" class="form-item">
        <el-input
          v-model="loginForm.password"
          placeholder="请输入密码"
          clearable
          :type="passwordVisible ? 'text' : 'password'"
        >
          <template #suffix>
            <el-icon @click="togglePasswordVisibility" style="cursor: pointer">
              <component :is="passwordVisible ? Lock : View" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item class="button-item">
        <el-button type="primary" @click="submitForm" style="width: 100%; height: 40px">登录</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useShared } from '../../../utils/useShared'
import { ElButton, ElDivider, ElMessage, ElPopover } from 'element-plus' // 引入 ElMessage
import { useRoute } from 'vue-router'
import { Lock, View } from '@element-plus/icons-vue' // 引入需要的图标
import photo from '../../../assets/chat.deepseek.com_.png'
import request from '../../../utils/request' // 导入封装的 axios 方法
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
  dynamicRows,
  isSampleLoad,
  limitSample,
  transData,
  transQuest,
  selectedLan,
  finalData,
  finalQuest
} = useShared()
// 校验用户登录信息
const rules = {
  username: [{ required: true, message: '请输入工号(用户名)', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
const passwordVisible = ref(false)
// 当前url的路由信息(由luxshare传来的参数)
const queryParams = route.query
const emit = defineEmits(['change-history'])
// 左上角折叠控制函数
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
//获取用户信息接口
const getUserInfo = async id => {
  request
    .post('/UserInfo/getUserInfoById?id=' + id)
    .then(res => {
      if (res.status) {
        localStorage.setItem('userInfo', JSON.stringify(res.data))
        userInfo.value = res.data
        nextTick(() => {
          emit('change-history')
        })
      }
    })
    .catch(err => {
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
  currentId.value = ''
  pageType.value = 'sample'
  selectedMode.value = '通用模式'
}
// 点击退出登录
const handleLogout = () => {
  // 处理退出登录逻辑
  ElMessage.success('退出成功')
  localStorage.setItem('userInfo', '')
  questions.value = []
  queryTypes.value = []
  answerList.value = []
  chatQuery.messages = []
  chatQuery.isLoading = false
  currentId.value = ''
  currentQuestion.value = false
  isLogin.value = false
}
// 由luxshare带token进来,校验luxshare的合法性
const checkToken = async token => {
  request
    .post('/Message/save', {
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
const handleConfirmDelete = val => {
  const queryData =
    selectedMode.value === '人资行政专题'
      ? '(query)'
      : selectedMode.value === 'IT专题'
        ? '(it)'
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
    if (anList[i].type === '人资行政专题' || anList[i].type === 'IT专题') {
      queryLimit.push(anList[i].title)
      if (anList[i].title === val) {
        id = anList[i].id
      }
    } else if (anList[i].type === '通用模式') {
      if (anList[i].title === val) {
        id = anList[i].id
      }
    } else if (anList[i].type === '翻译' || anList[i].type === '总结') {
      if (anList[i].title === val) {
        id = anList[i].id
      }
    }
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
  const queryIt = []
  const querySample = []
  const queryTran = []
  const queryFinal = []
  for (var j = 0; j < anList.length; j++) {
    if (anList[j].type === '人资行政专题') {
      queryLimit.push(anList[j].title)
      if (val == anList[j].title) {
        currentId.value = anList[j].id
        pageType.value = 'query'
        selectedMode.value = '人资行政专题'
        currentObj.value.messages = anList[j].data.answer
      }
    } else if (anList[j].type === 'IT专题') {
      queryIt.push(anList[j].title)
      if (val == anList[j].title) {
        currentId.value = anList[j].id
        pageType.value = 'it'
        selectedMode.value = 'IT专题'
        currentObj.value.messages = anList[j].data.answer
      }
    } else if (anList[j].type === '通用模式') {
      querySample.push(anList[j].title)
      if (val == anList[j].title) {
        pageType.value = 'sample'
        selectedMode.value = '通用模式'
        chatQuery.messages = anList[j].data
        chatQuery.isLoading = false
        currentId.value = anList[j].id
      }
    } else if (anList[j].type === '翻译') {
      queryTran.push(anList[j].title)
      if (val == anList[j].title) {
        currentQuestion.value = false
        pageType.value = 'tran'
        selectedMode.value = '翻译'
        transData.value = anList[j].data.answer
        transQuest.value = anList[j].data.question
        selectedLan.value = anList[j].data.target
        currentId.value = anList[j].id
      }
    } else if (anList[j].type === '总结') {
      queryFinal.push(anList[j].title)
      if (val == anList[j].title) {
        currentQuestion.value = false
        pageType.value = 'final'
        selectedMode.value = '总结'
        finalData.value.data = anList[j].data.answer.key_points
        finalData.value.title = anList[j].data.answer.summary
        finalQuest.value = anList[j].data.question
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
      if (pageType.value === 'query' || pageType.value === 'it') {
        tipQuery.value = val.replace(/\([^)]*\)/g, '')
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
        transQuest.value = val.replace(/\([^)]*\)/g, '')
      } else if (pageType.value === 'final') {
        currentQuestion.value = false
        finalQuest.value = val.replace(/\([^)]*\)/g, '')
      }
    }
  }
  const limitData = JSON.parse(JSON.stringify(queryTypes.value))
  for (var k = 0; k < limitData.length; k++) {
    if (val === limitData[k].name) {
      pageType.value = limitData[k].type
    }
  }
  if (pageType.value === 'query' && !queryLimit.includes(val)) {
    currentObj.value.messages = {}
  }
  if (pageType.value === 'it' && !queryIt.includes(val)) {
    currentObj.value.messages = {}
  }
  if (pageType.value === 'sample' && !querySample.includes(val)) {
    chatQuery.messages = []
    chatQuery.isLoading = false
  }
  if (pageType.value === 'tran' && !queryTran.includes(val)) {
    transData.value = ''
  }
  if (pageType.value === 'final' && !queryFinal.includes(val)) {
    finalData.value.data = ''
  }
}

onMounted(() => {
  if (localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).id) {
    isLogin.value = true
    const loginData = JSON.parse(localStorage.getItem('userInfo'))
    userInfo.value.id = loginData.id
    userInfo.value.name = loginData.name
    emit('change-history')
  } else {
    if (queryParams && queryParams.tokenId) {
      checkToken(queryParams.tokenId)
    } else {
      dialogVisible.value = true
    }
  }
})

// 计算属性，处理左侧栏历史记录的数据
const processedQuerys = computed(() => {
  return questions.value.map(query => {
    // 使用正则表达式去掉括号及其内容
    return query.replace(/\([^)]*\)/g, '')
  })
})

defineExpose({ queryAn, deleteData })
</script>
<style lang="less" scoped>
.aside {
  background-color: #f5f5f5;
  transition: width 0.3s;
  display: flex;
  .aside_left {
    width: 60px;
    height: 44px;
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    .aside_left_img {
      width: 24px;
      height: 24px;
    }
    .noLogin {
      font-size: 14px;
      cursor: pointer;
      position: fixed;
      color: #409eff;
      bottom: 30px;
      left: 8px;
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
    background-color: #fff;
    border-right: 2px solid #eaeaea;
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
        background-image: url('../../../assets/start.png');
        background-repeat: no-repeat;
        padding-left: 35px;
        background-size: 12px 12px;
        background-position: 15px 9px;
      }
    }
    .el_menu {
      border-right: none;
      .aside_right_img {
        width: 14px;
        height: 14px;
        position: absolute;
        right: 10px;
      }
    }
  }
}
.login-form {
  padding: 20px;
  :deep(.el-form-item__label) {
    text-align: right;
    width: 80px !important; /* 调整 label 的宽度 */
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
    margin-top: 40px;
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
