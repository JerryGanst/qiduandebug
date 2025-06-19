<template>
  <div class="create_main" v-if="isCreate">
    <div class="create_title">
      <span class="create_back" @click="cancelIntel"><img src='@/assets/return.png'></span>
      <span style="padding-left: 12px;"> {{ type==='edit'?'编辑智能体':'创建智能体' }}</span>
      
    </div>
    <div class="create_content">
      <div class="create_name">
        <div class="create_text">
          <span style="color: #ff4d4f">*</span>
          <span style="padding-left: 5px">智能体名称</span>
        </div>
        <div class="create_input">
          <el-input placeholder="给您的智能体取个名字吧" style="width: 100%" v-model="formIntel.name" maxlength="15">
            <template #suffix>
              <span class="char-counter">{{ formIntel.name.length }}/15</span>
            </template>
          </el-input>
        </div>
      </div>
      <div class="create_name" style="margin-top: 20px;">
        <div class="create_text">
          <span style="padding-left: 5px">智能体应该如何称呼您</span>
        </div>
        <div class="create_input">
          <el-input placeholder="输入你的称呼" style="width: 100%" v-model="formIntel.nickName" maxlength="15">
            <template #suffix>
              <span class="char-counter">{{ formIntel.nickName.length }}/15</span>
            </template>
          </el-input>
        </div>
      </div>
      <div class="create_name"  style="margin-top: 20px;">
        <div class="create_text">
          <span style="padding-left: 5px">智能体和您对话时的语气</span>
        </div>
        <div class="create_input">
          <el-input placeholder="给你的智能体设定一个语气吧" style="width: 100%" v-model="formIntel.tone" maxlength="15">
            <template #suffix>
              <span class="char-counter">{{ formIntel.tone.length }}/15</span>
            </template>
          </el-input>
        </div>
      </div>
      <div class="create_set">
        <div class="create_ai">智能补充</div>
        <div class="create_text">
          <span style="color: #ff4d4f">*</span>
          <span style="padding-left: 5px">设定</span>
        </div>
        <div class="create_input">
          <el-input
           :placeholder=placeholderText
            style="width: 100%"
            v-model="formIntel.description"
            type="textarea"
          ></el-input>
        </div>
      </div>
      <div class="create_btn">
        <div class="create_cancel" @click="cancelIntel">取消</div>
        <div class="create_confirm" @click="createData" v-if="type==='create'">创建</div>
        <div class="create_confirm" @click="saveData" v-if="type==='edit'">保存</div>
    
      </div>
    </div>
  </div>
  <div v-else class="create_main">
    <div v-if="intelList.length > 0" class="create_ask">
        <div class="main_content">
          <div class="content_title">{{ currentIntel.name }}</div>
          <div class="content_tip">
            <div class="content_robot"><img src="@/assets/robot.png"></div>
            <div class="tip_text">Hi,我是你创建的智能体{{ currentIntel.name }},在这段对话中，我将扮演{{ currentIntel.role }}的角色</div>
          </div>
        </div>
        <div class="select_content">
          <div
                class="textarea"
                :class="[fileInputAry && fileInputAry.length > 0 ? 'sampleAreaAry' : 'sampleArea']"
              >
                <el-input
                  v-model="intelQuestion"
                  placeholder="请输入您的问题,换行请按下Shift+Enter"
                  style="width: 100%"
                  class="custom-input"
                  clearable
                  @keydown.enter.prevent="samplePost"
                  @keyup.shift.enter.prevent="handleShiftEnter('textareaInputIntel')"
                  ref="textareaInputIntel"
                  :maxlength="4096"
                  type="textarea"
                  :rows="dynamicRows"
                  @input="adjustTextareaHeight('textareaInputIntel')"
                />
                <div class="filesList" v-if="fileInputAry && fileInputAry.length > 0">
                  <div
                    v-for="(item, index) in fileInputAry"
                    style="cursor: pointer"
                    :style="{ marginLeft: index === 0 ? '5px' : '10px' }"
                    @click="showListFile(item)"
                  >
                    <span style="display: flex; align-items: center">
                      <img
                        :src="
                          item.originalFileName.endsWith('txt')
                            ? text
                            : item.originalFileName.endsWith('pdf')
                              ? pdf
                              : item.originalFileName.endsWith('ppt') || item.originalFileName.endsWith('pptx')
                                ? ppt
                                : item.originalFileName.endsWith('xls') || item.originalFileName.endsWith('xlsx')
                                  ? excel
                                  : word
                        "
                        style="width: 22px; height: 28px"
                      />
                    </span>
                    <span style="padding-left: 10px; width: 50px; overflow: hidden; padding-top: 8px" class="file_name">
                      {{ item.originalFileName }}
                    </span>
                    <span
                      style="
                        position: absolute;
                        width: 16px;
                        height: 16px;
                        right: 0px;
                        top: 0px;
                        cursor: pointer;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                      "
                      @click="deleteImg(index)"
                    >
                      <img src="@/assets/close.png" style="width: 10px; height: 10px" />
                    </span>
                  </div>
                </div>
                <!-- 发送图标 -->
                <div class="send-icon">
                  <div class="tooltip-wrapper" ref="wrapperRef">
                    <img
                      src="@/assets/file.png"
                      class="arrow"
                      @click="showFileSample('sample')"
                      style="margin-right: 10px"
                    />
                    <transition name="fade">
                      <div v-if="showFileMenu" class="file-menu" @click.stop>
                        <div class="triangle"></div>
                        <div class="menu-item" @click="handleFileSelect('local', 'sample')">从本地读取</div>
                        <div class="menu-item" @click="handleFileSelect('knowledge', 'sample')">从知识库读取</div>
                      </div>
                    </transition>
                  </div>
                  <img
                    :src="isSampleLoad ? imageC : intelQuestion || fileInputAry.length > 0 ? imageB : imageA"
                    class="arrow"
                    @click="submitSampleSend"
                  />
                </div>
              </div>
        </div>
    </div>
    <div class="empty" v-else>
      <div class="empty_img"><img src="@/assets/kong.png" /></div>
      <div class="empty_text">暂无智能体</div>
      <div class="empty_create" @click="createIntel('create')">创建智能体</div>
    </div>
  </div>

</template>
<script setup>
import { ref,onMounted,onUnmounted } from 'vue'
import { useShared } from '@/utils/useShared'
import { ElMessage } from 'element-plus' // 引入 ElMessage
import request from '@/utils/request' // 导入封装的 axios 方法
import eventBus from '@/utils/eventBus'
import imageB from '@/assets/arrow_blue.png'
import imageA from '@/assets/arrow_gray.png'
import imageC from '@/assets/stop.png'
const { intelList,isCreate,answerListIntel,activeIndexIntel,currentIntel,isSampleLoad,fileInputAry,isLogin,adjustTextareaHeight,textareaInputIntel,intelQuestion } = useShared()
const formIntel = ref({
  name: '',
  description: '',
  nickName:'',
  tone:''
})
const type = ref('create')
const placeholderText = ref(`# 设定
你是一位营销文案奇才，擅长通过对话引导用户明确其产品或服务需求，并能创作出既幽默诙谐又信息准确、吸引力十足的广告语、宣传文案和社交媒体内容。

#  技能
## 技能1：需求挖掘与沟通
- 通过提问和互动，帮助用户清晰定义他们的产品特性和目标受众。
- 识别用户的核心价值主张，并将其转化为文案的关键信息。`)
    
const createIntel = (val) => {
  if(isPureObject(val)){
    type.value = val.param1
    for(var i=0;i<answerListIntel.value.length;i++){
      if(val.param2 === answerListIntel.value[i].persona.name){
        const data = JSON.parse(JSON.stringify(answerListIntel.value[i].persona))
        formIntel.value.name = data.name
        formIntel.value.nickName = data.role
        formIntel.value.description = data.description
        formIntel.value.tone = data.tone
      }
    }
  }else{
    type.value = val
    formIntel.value.name = ''
    formIntel.value.nickName = ''
    formIntel.value.description = ''
    formIntel.value.tone = ''
  }
  isCreate.value = true
}
const cancelIntel = () => {
  isCreate.value = false
}

const saveData = () => {

}
const submitSampleSend = () => {
  if (isSampleLoad.value) {
    stopQuery('sample')
    // cancelCurrentRequest('sample')
    return
  }
  submitSample()
}
const stopQuery = async type => {
  request
    .post('/AI/stop?userId=' + userInfo.value.id, {
      // showLoading: true
    })
    .then(res => {
      if (res.status) {
        // cancelCurrentRequest(type)
      }
    })
    .catch(err => {})
}
const handleFileSelect = (val1, val2) => {
  showFileMenu.value = false
  if (!isLogin.value) {
    ElMessage.warning('请先登录再使用')
    return false
  }
  nextTick(() => {
    if (val1 === 'local') {
      fileRefs.value.openFile(val2, fileInputAry.value)
    } else {
      commonUploadModals.value.openFile(val2)
    }
  })
}

const samplePost = event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认的换行行为
    if (isSampleLoad.value) {
      ElMessage.warning('有问答正在进行中,请稍后再试')
      return
    }
    submitSample()
  }
}
const submitSample = event => {

}
const showListFile = val => {
  fileAry.value = []
  fileAry.value.push(val)
  filePreRef.value.openFile('sample')
}
const createData = () => {
  if(!formIntel.value.name){
    ElMessage.warning('请输入智能体名称')
    return
  }
  if(!formIntel.value.description){
    ElMessage.warning('请输入智能体设定')
    return
  }
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  intelList.value.push(formIntel.value.name)
  const params = JSON.parse(JSON.stringify(formIntel.value))
  request
    .post('/Agent/saveAgent ', {
      id:'',
      userId:userInfo.id,
      persona:{
        name:params.name,
        role:params.nickName,
        description:params.description,
        tone:params.tone,
      }
    })
    .then(res => {
      currentIntel.value.name = params.name
      currentIntel.value.role = params.role
      currentIntel.value.tone = params.tone
      currentIntel.value.description = params.description
      console.log(currentIntel.value)
      isCreate.value = false
      getHistory()
    })
    .catch(err => {
      ElMessage.warning('创建智能体失败,请稍后再试')
      console.error(err)
    })
}
const isPureObject = value => {
  // 排除 null 和基础类型
  if (typeof value !== 'object' || value === null) return false;
  
  // 排除数组、日期、正则等
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
const getHistory = async (val) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  request
    .post('/Agent/findAgentByUserId?userId=' + userInfo.id+'&keyword='+(val?val:''))
    .then(res => {
      if (res.status) {
        answerListIntel.value =res.data
        intelList.value = []
        for(var i=0;i<res.data.length;i++){
          intelList.value.push(res.data[i].persona.name)
        }
        activeIndexIntel.value = 0
        currentIntel.value = answerListIntel.value[0].persona
   
      }
    })
    .catch(err => {
      console.error('获取回复失败:', err)
    })

}
// 组件挂载时订阅事件
onMounted(() => {
  eventBus.on('getHistoryData',getHistory)
  eventBus.on('setInfo', createIntel)
  activeIndexIntel.value = 0
  adjustTextareaHeight('textareaInputIntel')
  getHistory()
})
// 组件卸载时关闭 SSE 连接
onUnmounted(() => {
  eventBus.off('getHistoryData',getHistory)
  eventBus.off('setInfo', createIntel)
})
</script>
<style lang="less" scoped>
.select_content{
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-radius: 10px;
  flex-direction: column;
  height: 140px;
  margin-bottom: 10px;
}
.tooltip-wrapper {
  position: relative;
  display: flex;
  .triangle {
    position: absolute;
    bottom: -9px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #fff;
  }
  .file-menu {
    position: absolute;
    bottom: 140%;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 8px 0;
    margin-bottom: 12px;
    z-index: 2000;
    min-width: 140px;
  }

  .menu-item {
    padding: 8px 16px;
    cursor: pointer;
    color: #333;
  }

  .menu-item:hover {
    background-color: #e6f4ff;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
}
.sampleArea {
  .el-textarea__inner {
    padding: 18px 100px 18px 15px !important;
  }
}
.sampleAreaAry {
  .el-textarea__inner {
    padding: 56px 100px 18px 15px !important;
  }
}
.textarea {
  width: 726px;
  position: relative;
  /* 去掉 textarea 右下角的小图标 */
  .custom-input textarea {
    resize: none; /* 禁用调整大小功能 */
  }

  .send-icon {
    position: absolute;
    right: 20px;
    bottom: 13px;
    cursor: pointer;
    transition: color 0.3s;
    display: flex;
  }
  .send-icon img {
    width: 30px;
    height: 30px;
  }
}

.empty {
  width: 80%;
  margin-left: 10%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .empty_create {
    width: 140px;
    height: 40px;
    border-radius: 10px;
    cursor: pointer;
    background-color: #1b6cff;
    color: #fff;
    text-align: center;
    line-height: 40px;
    font-size: 14px;
    margin-top: 40px;
  }
  .empty_text {
    color: #6a6a6a;
    font-size: 16px;
    margin-top: 40px;
  }
  .empty_img {
    width: 100px;
    height: 100px;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
.create_main {
  width: 80%;
  margin-left: 10%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: #fff;
  .create_ask{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .main_content{
      max-width: 860px;
      height: 100%;
      box-sizing: border-box;
      flex: 1;
      .content_title{
        color: #333333;
        padding-top: 30px;
        font-size: 16px;
      }
      .content_tip{
        display: flex;
        flex-direction: row;
        margin-top: 30px;
        margin-left: 30px;
        .content_robot{
          width: 36px;
          height: 36px;
          img{
            width: 100%;
            height: 100%;
          }
        }
        .tip_text{
          width: 100%;
          background-color: #fafafa;
          padding: 0px 20px;
          font-size: 14px;
          height: 36px;
          line-height: 36px;
          border-radius: 10px;
          letter-spacing: 1px;
          box-sizing: border-box;
          margin-left: 15px;
        }
      }
    }
  }
  .create_title {
    font-size: 18px;
    width: 100%;
    color: #262626;
    padding-top: 25px;
    display: flex;
    height: 26px;
    line-height: 26px;
    align-items: center;
    .create_back{
      width: 26px;
      height: 26px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      border: 1px solid #d0e4ff;
      border-radius: 26px;
      cursor: pointer;
      img{
        width: 14px;
        height: 14px;
        float: left;
      }
    }
  }
  .create_content {
    width: 726px;
    display: flex;
    flex-direction: column;
    margin-top: 100px;
    color: #333333;
    font-size: 14px;
    line-height: 18px;
    margin-left: 50px;
    .create_name {
      display: flex;
      flex-direction: column;
      .create_input {
        margin-top: 5px;
        :deep(.el-input__wrapper) {
          border: 1px solid #b7b8b9;
          height: 36px;
          border-radius: 4px;
          line-height: 36px;
          box-sizing: border-box;
          padding-left: 15px;
        }
      }
    }

    .create_set {
      display: flex;
      flex-direction: column;
      margin-top: 30px;
      position: relative;
      .create_ai {
        width: 90px;
        border-radius: 4px;
        height: 32px;
        font-size: 14px;
        text-align: center;
        box-sizing: border-box;
        background-color: #e6f4ff;
        color: #1b6cff;
        line-height: 32px;
        position: absolute;
        text-indent: 20px;
        right: 0;
        top: -15px;
        background-image: url('@/assets/ai.png');
        background-repeat: no-repeat;
        background-size: 19px 16px;
        background-position: 16px 8px;
        cursor: pointer;
      }
      .create_input {
        margin-top: 5px;
        :deep(.el-textarea__inner) {
          border-radius: 4px !important;
          padding: 10px 15px !important;
          height: 200px;
          resize: none;
          border-radius: 4px;
        }
      }
    }
    .create_btn {
      display: flex;
      margin-top: 25px;
      justify-content: center;
      font-size: 14px;
      .create_cancel {
        width: 120px;
        height: 32px;
        text-align: center;
        line-height: 32px;
        border: 1px solid #dedede;
        border-radius: 4px;
        color: #333333;
        cursor: pointer;
      }
      .create_confirm {
        width: 120px;
        height: 32px;
        text-align: center;
        line-height: 32px;
        border: 1px solid #1b6cff;
        border-radius: 4px;
        background-color: #1b6cff;
        color: #fff;
        margin-left: 10px;
        cursor: pointer;
      }
    }
  }
}
</style>
