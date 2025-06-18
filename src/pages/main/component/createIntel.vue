<template>
  <div class="create_main" v-if="isCreate">
    <div class="create_title">
      <span class="create_back" @click="cancelIntel"><img src='@/assets/return.png'></span>
      <span style="padding-left: 12px;">创建智能体</span>
      
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
          <span style="padding-left: 5px">智能体角色</span>
        </div>
        <div class="create_input">
          <el-input placeholder="输入你的智能体角色" style="width: 100%" v-model="formIntel.nickName" maxlength="15">
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
        <div class="create_confirm" @click="createData">创建</div>
      </div>
    </div>
  </div>
  <div v-else>
    <div v-if="intelList.length > 0">

    </div>
    <div class="empty" v-else>
      <div class="empty_img"><img src="@/assets/kong.png" /></div>
      <div class="empty_text">暂无智能体</div>
      <div class="empty_create" @click="createIntel">创建智能体</div>
    </div>
  </div>

</template>
<script setup>
import { ref } from 'vue'
import { useShared } from '@/utils/useShared'
import { ElMessage } from 'element-plus' // 引入 ElMessage
import request from '@/utils/request' // 导入封装的 axios 方法
const { intelList,isCreate } = useShared()
const formIntel = ref({
  name: '',
  description: '',
  nickName:'',
  tone:''
})
const placeholderText = ref(`# 设定
你是一位营销文案奇才，擅长通过对话引导用户明确其产品或服务需求，并能创作出既幽默诙谐又信息准确、吸引力十足的广告语、宣传文案和社交媒体内容。

#  技能
## 技能1：需求挖掘与沟通
- 通过提问和互动，帮助用户清晰定义他们的产品特性和目标受众。
- 识别用户的核心价值主张，并将其转化为文案的关键信息。`)
    
const createIntel = () => {
  isCreate.value = true
}
const cancelIntel = () => {
  isCreate.value = false
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

  // request
  //   .post('/Agent/saveAgent ', {
  //     id:'',
  //     userId:userInfo.id,
  //     persona:{
  //       name:formIntel.value.name,
  //       role:formIntel.value.nickName,
  //       description:formIntel.value.description,
  //       goals:'',
  //       tone:formIntel.value.tone,
  //       behavior_guidelines:'',
  //       example_queries:''
  //     }
  //   })
  //   .then(res => {

  //   })
  //   .catch(err => {
  //     console.error(err)
  //   })
}


</script>
<style lang="less" scoped>
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
        width: 120px;
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
