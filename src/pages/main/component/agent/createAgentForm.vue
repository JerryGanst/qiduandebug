<template>
  <div class="create_main">
    <div class="create_title">
      <span class="create_back" @click="$emit('cancel')">
         <img src="../../../../assets/return.png" />
      </span>
      <span style="padding-left: 12px">{{ type === PageType.EDIT_PAGE ? '编辑智能体' : '创建智能体' }}</span>
    </div>
    <div class="create_content">
      <div class="agentImg">
        <el-upload
          :action="uploadUrl"
          list-type="picture-card"
          :limit="1"
          :on-exceed="exceedHandler"
          :on-success="successHandler"
          :on-preview="previewHandler"
          :before-upload="beforeAvatarUpload"
          :on-remove="removeHandler"
        >
          <img :src="headImgUrl" alt="" style="width: 100%;height: 100%;">
        </el-upload>

        <el-dialog v-model="dialogVisible">
          <img :src="dialogImageUrl" alt="Preview Image" style="width: 100%;height: 100%;"/>
        </el-dialog>
      </div>
      <div class="create_name">
        <div class="create_text">
          <span style="color: #ff4d4f">*</span>
          <span style="padding-left: 5px">智能体名称</span>
        </div>
        <div class="create_input">
          <el-input
            placeholder="给您的智能体取个名字吧"
            style="width: 100%"
            v-model="formIntel.name"
            maxlength="15"
          >
            <template #suffix>
              <span class="char-counter">{{ formIntel.name.length }}/15</span>
            </template>
          </el-input>
        </div>
      </div>
      <div class="create_set">
        <div @click="$emit('add-intel')" :class="isComputed ? 'create_loading' : 'create_ai'">
          {{ isComputed ? '停止' : '智能补充' }}
        </div>
        <div class="create_text">
          <span style="color: #ff4d4f">*</span>
          <span style="padding-left: 5px">智能体设定</span>
        </div>
        <div class="create_input">
          <el-input
            :placeholder="placeholderText"
            style="width: 100%; white-space: pre; font-family: monospace"
            v-model="formIntel.description"
            type="textarea"
          ></el-input>
        </div>
      </div>
      <div class="create_name">
        <div class="create_text">
          <span style="padding-left: 5px">智能体简介</span>
        </div>
        <div class="create_input">
          <el-input
              placeholder="(选填) 简单地介绍你的智能体吧"
              style="width: 100%"
              v-model="formIntel.introduction"
              maxlength="50"
          >
            <template #suffix>
              <span class="char-counter">{{ formIntel.introduction.length }}/50</span>
            </template>
          </el-input>
        </div>
      </div>
      <div class="create_btn">
        <div class="create_cancel" @click="$emit('cancel')">取消</div>
        <div class="create_confirm" @click="$emit('create', 'create')" v-if="type === PageType.CREATE_PAGE">创建</div>
        <div class="create_confirm" @click="$emit('create', 'edit')" v-if="type === PageType.EDIT_PAGE">保存</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getAgentImgByObj } from '@/api/agent/actions.js'
import { PageType } from '../../../../utils/common.js'
import {watchEffect} from "vue-demi";
import headImg from '@/assets/agent/head.png'

let props = defineProps({
  formIntel: Object,
  type: Number,
  isComputed: Boolean
})

defineEmits(['cancel', 'create', 'add-intel'])

const placeholderText = ref(`# 设定
你是一位营销文案奇才，擅长通过对话引导用户明确其产品或服务需求，并能创作出既幽默诙谐又信息准确、吸引力十足的广告语、宣传文案和社交媒体内容。

#  技能
## 技能1：需求挖掘与沟通
- 通过提问和互动，帮助用户清晰定义他们的产品特性和目标受众。
- 识别用户的核心价值主张，并将其转化为文案的关键信息。

## 技能2：创意文案制作
- 根据用户需求，运用独特的幽默感和诙谐风格撰写广告语和宣传文案。
- 创作适合不同社交媒体平台的内容，确保文案在吸引注意力的同时，传递有效信息。

### 技能3：内容适应性
- 能够根据不同平台的特性（如Instagram的视觉焦点，Twitter的短文魅力，Facebook的互动性等）定制文案。
- 保证文案在保持幽默风格的同时，符合各平台的社区准则和用户偏好。

## 限制与注意事项
- 文案内容需保持正面、合法且尊重用户的品牌形象。
- 在幽默表达中避免冒犯或不适当的言辞，确保文案的广泛接受度。
- 确保文案的原创性，不侵犯任何知识产权。
- 在必要时，可以调用搜索引擎或知识库以获取行业趋势和流行话题，增强文案的相关性和时效性。`)

const dialogImageUrl = ref('')
const dialogVisible = ref(false)
// 做个标识是否是图片上传完成的状态
const finishedUploadHead = ref(false)

const exceedHandler = () => {
  ElMessage( {
    type : 'warning',
    message: '只能上传一张智能体头像'
  })
}

const successHandler = async(response) => {
  let objectName = response.data
  let imgUrlResult = await getAgentImgByObj(objectName)
  if (imgUrlResult.status) {
    dialogImageUrl.value = imgUrlResult.data
    props.formIntel.agentPic = objectName
    finishedUploadHead.value = true
  }
}

const removeHandler = () => {
  props.formIntel.agentPic = ''
}

const previewHandler = () => {
  dialogVisible.value = true
}

const beforeAvatarUpload = (rawFile) => {
  if (!rawFile.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件！')
    return false
  } else if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error('图片大小不能超过 10MB!')
    return false
  }
  return true
}

const uploadUrl = ref(import.meta.env.VITE_API_BASE_URL + '/Agent/uploadPic')
let headImgUrl = ref(headImg)


watchEffect(() => {
  if (PageType.EDIT_PAGE !== props.type) {
    return;
  }
  // 如果是编辑页面且传入url且用户尚未上传图片，则显示用户上传的图片
  if (props.formIntel.agentPicUrl && !finishedUploadHead.value) {
    headImgUrl.value = props.formIntel.agentPicUrl
  }
  // 如果用户上传了图片，则显示默认头像
  if (finishedUploadHead.value) {
    headImgUrl.value = headImg
  }
})
</script>

<style lang="less" scoped>
.create_main {
  width: 100%;
  margin-left: calc(45vw - 363px);
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

    .create_back {
      width: 26px;
      height: 26px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      border: 1px solid #d0e4ff;
      border-radius: 26px;
      cursor: pointer;

      img {
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

    .agentImg {
      margin-left: 289px;
    }

    .create_name {
      display: flex;
      flex-direction: column;

      .create_input {
        margin-top: 5px;

        :deep(.el-input__wrapper) {
          height: 36px;
          border-radius: 4px;
          line-height: 36px;
          box-sizing: border-box;
          padding-left: 15px;
        }
      }
      .create_text {
        margin-top: 25px;
      }
    }

    .create_set {
      display: flex;
      flex-direction: column;
      margin-top: 30px;
      position: relative;

      .create_ai {
        width: 116px;
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

      .create_loading {
        width: 86px;
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
        background-image: url('@/assets/loading.gif');
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