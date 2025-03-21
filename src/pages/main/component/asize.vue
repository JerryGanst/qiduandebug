<template>
    <el-aside :width="isCollapsed ? '60px' : '280px'" class="aside">
      <div class="aside_left">
        <img
          src="../../../assets/fold.png"
          @click="toggleCollapse"
          class="aside_left_img"
        />
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
          <el-popover
            v-model:visible="showPopup"
            placement="top-end"
            :width="100"
            trigger="hover"
          >
            <template #reference>
              <div class="popover-reference"></div>
            </template>

            <div class="user-info-popup">
              <div class="user-info">
                <el-avatar :size="40" :src="avatarUrl" class="el_avatar" />
                <div class="user-details">
                  <div class="username">{{ userInfo.userid }}</div>
                </div>
              </div>
              <el-divider />
              <el-button type="text" @click="handleLogout">退出登录</el-button>
            </div>
          </el-popover>
        </div>
        <div class="noLogin" v-if="!isLogin" @click="dialogVisible = true">
          未登录
        </div>
      </div>

      <div
        class="aside_right"
        :style="{
          width: isCollapsed ? '0px' : '220px',
          borderRight: isCollapsed ? 'none' : '2px solid #EAEAEA',
          display: isCollapsed ? 'none' : 'block',
        }"
      >
        <div class="aside_right_content">
          <img src="../../../assets/lux.png" />
        </div>
        <div class="aside_right_btn">
          <el-button
            type="primary"
            @click="startNewConversation"
            class="back_set"
          >
            {{ isCollapsed ? '' : '开启新对话' }}
          </el-button>
        </div>
        <el-menu
          :default-active="activeIndex"
          @select="handleSelect"
          class="el_menu"
        >
          <el-tooltip
            v-for="(question, index) in processedQuerys"
            :key="index"
            :content="question"
            placement="right"
            popper-class="custom-tooltip"
          >
            <el-menu-item
              :index="index.toString()"
              @click="queryAn(question, index)"
              style="position: relative"
            >
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
    <el-dialog
    v-model="dialogVisible"
    title="登录"
    width="30%"
    :before-close="handleClose"
  >
    <el-form
      :model="loginForm"
      :rules="rules"
      ref="loginForms"
      class="login-form"
    >
      <el-form-item label="工号" prop="username" class="form-item">
        <el-input
          v-model="loginForm.username"
          placeholder="请输入工号(用户名)"
          clearable
        ></el-input>
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
      <el-form-item
        class="button-item">
        <el-button
          type="primary"
          @click="submitForm"
          style="width: 100%; height: 40px"
        >
          登录
        </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

</template>
<script setup>
import {
  ref,
  onMounted,
  computed,
  nextTick
} from 'vue'

import { useShared } from '../../../utils/useShared'
import { ElButton, ElDivider, ElMessage, ElPopover } from 'element-plus' // 引入 ElMessage
import { useRoute } from 'vue-router'
import { Lock, View } from '@element-plus/icons-vue' // 引入需要的图标
import photo from '../../../assets/chat.deepseek.com_.png'
import request from '../../../utils/request' // 导入封装的 axios 方法
const isCollapsed = ref(false)
const showPopup = ref(false)
const dialogVisible = ref(false)
const route = useRoute()
const loginForm = ref({
  username: '',
  password: '',
})
const avatarUrl = ref(photo) // 替换为你的头像URL
const { currentQuestion,newQuestion,isSampleStop,isQueryStop,limitLoading,questions,answerList,currentId,pageType,selectedMode,currentObj,tipQuery,imitLoading,userInfo,activeIndex,queryTypes,chatQuery,currentAnswer,isLogin,dynamicRows,isSampleLoad  } = useShared()
const rules = {
  username: [
    { required: true, message: '请输入工号(用户名)', trigger: 'blur' },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}
const queryParams = route.query
const emit = defineEmits(['change-history'])
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
const submitForm = async () => {
  const data = {
    userid: loginForm.value.username,
    password: loginForm.value.password,
  }
  request
    .post('/UserInfo/login', {
      userid: loginForm.value.username,
      password: loginForm.value.password,
      // showLoading: true
    })
    .then((res) => {
      if (res.data && res.data.clientStatus === 'PASS') {
        ElMessage.success('登录成功')
        showPopup.value = false
        activeIndex.value = ''
        isLogin.value = true
        localStorage.setItem('userInfo', JSON.stringify(data))
        userInfo.value.userid = data.userid
        emit('change-history')
        dialogVisible.value = false
      } else if (res.data && res.data.clientStatus !== 'PASS') {
        ElMessage.error(res.data.message)
      } else {
        ElMessage.error('登录失败,请稍后再试')
      }
    })
    .catch((err) => {
      console.error(err)
    })
}

const handleSelect = (index) => {
  activeIndex.value = index
}

const startNewConversation = () => {
  currentQuestion.value = ''
  currentAnswer.value = ''
  newQuestion.value = ''
  tipQuery.value = ''
  dynamicRows.value = 1
  activeIndex.value = ''
  chatQuery.messages = []
  currentId.value = ''
  pageType.value = 'sample'
  selectedMode.value = '通用模式'
}

const handleLogout = () => {
  // 处理退出登录逻辑
  ElMessage.success('退出成功')
  localStorage.setItem('userInfo', '')
  questions.value = []
  queryTypes.value = []
  answerList.value = []
  chatQuery.messages = []
  currentId.value = ''
  currentAnswer.value = false
  currentQuestion.value = false
  isLogin.value = false
}

const checkToken = async (token) => {
  request
    .post('/Message/save', {
      access_key: '76eb4367-a19d-4485-aadb-cea65fa8fbbe',
      tokenId: token,
    })
    .then((res) => {
      if (res.status) {
        ElMessage.success('登录成功')
        showPopup.value = false
        activeIndex.value = ''
        isLogin.value = true
        const data = {
          userid: res.data.uid,
          password: '',
        }
        localStorage.setItem('userInfo', JSON.stringify(data))
        userInfo.value.userid = data.userid
        nextTick(() => {
            emit('change-history')
        })
        
      } else {
        dialogVisible.value = true
      }
    })
    .catch((err) => {
      dialogVisible.value = true
    })
}
const handleClose = (done) => {
  // 这里可以添加一些关闭前的逻辑
  done()
}

// 点击确定删除
const handleConfirmDelete = (val) => {
  const queryData =
    selectedMode.value === '人资行政专题'
      ? '(query)'
      : selectedMode.value === 'IT专题'
        ? '(it)'
        : '(sample)'
  val = val + queryData

  if (isSampleLoad.value) {
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
    } else {
      if (anList[i].title === val) {
        id = anList[i].id
      }
    }
  }
  deleteData(id)
}

// 删除数据
const deleteData = async (id) => {
  // GET 请求
  request
    .post('/Message/deleteMessageById?id=' + id, {})
    .then((res) => {
      if (res.status) {
        ElMessage.success('删除成功！')
        chatQuery.messages = []
        activeIndex.value = ''
        currentQuestion.value = false
        emit('change-history')
      }
    })
    .catch((err) => {
      console.error(err)
    })
}

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
  const querySample = []
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
      queryLimit.push(anList[j].title)
      if (val == anList[j].title) {
        currentId.value = anList[j].id
        pageType.value = 'it'
        selectedMode.value = 'IT专题'
        currentObj.value.messages = anList[j].data.answer
      }
    } else {
      querySample.push(anList[j].title)
      if (val == anList[j].title) {
        pageType.value = 'sample'
        selectedMode.value = '通用模式'
        chatQuery.messages = anList[j].data
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
      } else {
        const hasName = anList.some((item) => item.title === val)
        if (hasName) {
          limitLoading.value = false
        } else {
          nextTick(() => {
            limitLoading.value = true
            chatQuery.messages = limitSample.value.messages
          })
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
  if (pageType.value === 'query' && !queryLimit.includes(val)) {
    currentObj.value.messages = {}
  }
  if (pageType.value === 'it' && !queryLimit.includes(val)) {
    currentObj.value.messages = {}
  }
  if (pageType.value === 'sample' && !querySample.includes(val)) {
    chatQuery.messages = []
  }
}


onMounted(() => {
  if (localStorage.getItem('userInfo')) {
    isLogin.value = true
    const loginData = JSON.parse(localStorage.getItem('userInfo'))
    userInfo.value.userid = loginData.userid
    console.log(userInfo.value.userid)
    emit('change-history')
  } else {
    if (queryParams && queryParams.tokenId) {
      checkToken(queryParams.tokenId)
    } else {
      dialogVisible.value = true
    }
  }
})



// 计算属性，处理 querys
const processedQuerys = computed(() => {
  return questions.value.map((query) => {
    // 使用正则表达式去掉括号及其内容
    return query.replace(/\([^)]*\)/g, '')
  })
})
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
</style>