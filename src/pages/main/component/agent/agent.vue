<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AgentCard from './agentCard.vue'
import {getAgentListByUserId} from '../../../../api/agent/actions'
import {saveAgent} from '../../../../api/agent/actions'
import {getAgentContent} from '../../../../api/agent/actions'
import {removeAgentById} from '../../../../api/agent/actions'
import {getAgentDetailById} from '../../../../api/agent/actions'
import {getAgentChatByAgentId} from '../../../../api/agent/actions'
import {getImageRecognitionsByUserId} from '../../../../api/agent/actions'
import {saveImgRecognition} from '../../../../api/agent/actions'
import {getImgRecognitionById} from '../../../../api/agent/actions'
import {deleteImgRecognitionById} from '../../../../api/agent/actions'
import {PageType} from '../../../../utils/common'
import {FromPage} from '../../../../utils/common'
import CreateAgentForm from "../agent/createAgentForm.vue";
import {ElMessage} from "element-plus";
import request from '../../../../utils/request'
import eventBus from '../../../../utils/eventBus'
import { useShared } from '../../../../utils/useShared'

// 定义30种好看的背景色
const gradients = [
  '#EDF3FF', '#E6E6FF', '#D9F8FB', '#BCF3DD', '#FEE7D7',
  '#FFE6E6', '#E6FFE6', '#FFF8E1', '#F5F0FF', '#E0F7FA',
  '#FFF0F0', '#F0FFF0', '#F0F0FF', '#FFFFF0', '#F0F8FF',
  '#F8F0FF', '#FFF8F0', '#F5FFFA', '#F5F5FF', '#FAFFF5',
  '#E8F5E9', '#E3F2FD', '#FFF3E0', '#E0F2F1', '#FCE4EC',
  '#F3E5F5', '#E1F5FE', '#F9FBE7', '#FFEBEE', '#E8EAF6'
];

// 模拟数据
const agents = ref([])
let userId = ref(JSON.parse(localStorage.getItem('userInfo')).id)
let agentType = ref('default')
let defaultAgentName = ref('镭雕图片对比')
let defaultAgentContent = ref('镭雕图片对比是一名精确、细致的图片对比专家，擅长对多张图片进行逐项、逐行的差异分析。\n' +
  '它会在用户提供至少两张图片后，执行对比任务，输出一张包含所有对比项的表格。\n' +
  '分析原则是**“无遗漏”**：\n' +
  '\n' +
  '不仅指出不同点，也会列出相同点，并在差异分析中标明“无差异”\n' +
  '\n' +
  '差异分类会细化到具体细节层面（如字符内容、符号形状、颜色值、位置偏差、线条粗细、阴影效果等），避免笼统描述\n' +
  '\n' +
  '无论差异大小（即使只有一个像素、符号或颜色值的变化）都会被明确记录\n' +
  '\n' +
  '表格格式固定为：\n' +
  '\n' +
  '| 对比项 | 图1 | 图2 | ... | 图n | 差异分析 |\n' +
  '\n' +
  '通过这种方式，智能体可为视觉检查、质量检测、图像版本比对等场景提供高精度分析报告。')

onMounted(() => {
  fetchAgentList()
  eventBus.on("backToAgentList", () => {
    pageType.value = PageType.LIST_PAGE
    fetchAgentList()
  })
})

const fetchAgentList = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  let result = await getAgentListByUserId(userInfo.id)
  if (result.status) {
    if (!result.data) return;
    if (result.data.length === 0) {
      // pageType.value = PageType.EMPTY_PAGE
    }
    agents.value = result.data.map(item => {
      return {
        id: item.agentId, // 直接使用数据中的id
        title: item.agentName, // persona.name映射到title
        content: item.agentIntroduction, // persona.introduction映射到content
        color: gradients[Math.floor(Math.random() * gradients.length)], // 随机选择渐变色
        agentPic: item.agentPic, // 固定图片路径
        agentPicUrl: item.agentPicUrl
      };
    });
  } else {
    ElMessage.error(result.message)
  }
}

const fromPage = ref(FromPage.FROM_LIST_PAGE)
const pageType = ref(PageType.LIST_PAGE)
const formIntel = ref({
  name: '',
  description: '',
  nickName: '',
  tone: '',
  id: '',
  agentPic: '',
  agentPicUrl: '',
  introduction: '',
})
// 标识是否还在请求生成设定
const isComputed = ref(false)
const cancelIntel = () => {
  if (fromPage.value === FromPage.FROM_EMPTY_PAGE) {
    pageType.value = PageType.EMPTY_PAGE
  } else {
    pageType.value = PageType.LIST_PAGE
  }
}
const createData = async() => {
  if (!formIntel.value.name) {
    ElMessage.warning('请输入智能体名称')
    return
  }

  if (!formIntel.value.description) {
    ElMessage.warning('请输入智能体设定')
    return
  }
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  const params = JSON.parse(JSON.stringify(formIntel.value))
  let saveResult = await saveAgent({
    id: params.id,
    userId: userInfo.id,
    agentPic: params.agentPic,
    persona: {
      name: params.name,
      role: params.nickName,
      description: params.description,
      tone: params.tone,
      introduction: params.introduction,
    }
  })
  if (saveResult.status) {
    // 如果是编辑页 则先把被编辑卡片删除
    if (pageType.value === PageType.EDIT_PAGE) {
      const index = agents.value.findIndex(item => item.id === saveResult.data.id);
      if (index !== -1) {
        agents.value.splice(index, 1);
      }
    }
    agents.value.unshift({
      id: saveResult.data.id,
      title: saveResult.data.persona?.name,
      content: saveResult.data.persona?.introduction,
      agentPic: saveResult.data.agentPic,
      agentPicUrl: saveResult.data.agentPicUrl,
    })
    pageType.value = PageType.LIST_PAGE
  } else {
    ElMessage.error(saveResult.message)
  }
}

const addIntel = async () => {
  if (!isComputed.value) {
    isComputed.value = true
    if (!formIntel.value.name && !formIntel.value.description && !formIntel.value.introduction) {
      resetForm()
    }
    let agentDescResult = await getAgentContent({
      agentName: formIntel.value.name,
      agentDescription: formIntel.value.description,
      agentIntroduction: formIntel.value.introduction,
    })
    isComputed.value = false
    if (agentDescResult.status) {
      formIntel.value.description = formatServerContent(agentDescResult.data.agentDescription)
      formIntel.value.name = agentDescResult.data.agentName
      formIntel.value.introduction = agentDescResult.data.agentIntroduction
    } else {
      ElMessage.error(agentDescResult.message)
    }
  } else {
    isComputed.value = false
    request.cancelRequest('/Agent/generateAgentDescription')
    ElMessage.success('请求已中止')
  }
}

// 格式化服务器返回的内容
const formatServerContent = content => {
  return content.replace(/\\n/g, '\n').replace(/\\t/g, '    ').replace(/\\r/g, '\r')
}

const goToCreateAgentPage = (page) => {
  resetForm()
  pageType.value = PageType.CREATE_PAGE
  fromPage.value = page
}

const resetForm = () => {
  // 重置对象的所有字段为空字符串
  Object.assign(formIntel.value, {
    name: '',
    description: '',
    nickName: '',
    tone: '',
    id: '',
    agentPic: '',
    introduction: ''
  });
}

const deleteAgent = async(id: string) => {
  const deleteResult = await removeAgentById(id)
  if (deleteResult.status) {
    ElMessage.success('删除成功！');
    await fetchAgentList()
  } else {
    ElMessage.error(deleteResult.message)
  }
}

const editAgent = async(agentId: string) => {
  pageType.value = PageType.EDIT_PAGE
  // 编辑前先清空数据
  resetForm()
  let agentDetail = await getAgentDetailById(agentId)
  if (agentDetail.status) {
    formIntel.value.id = agentId
    formIntel.value.name = agentDetail.data.agentName
    formIntel.value.introduction = agentDetail.data.agentIntroduction
    formIntel.value.agentPic = agentDetail.data.agentPic
    formIntel.value.description = agentDetail.data.agentDescription
    formIntel.value.agentPicUrl = agentDetail.data.agentPicUrl
  } else {
    ElMessage.error(agentDetail.message)
  }
}

const showAgentConversations = async(agentId: string) => {
    if(agentId === userId.value) {
      currentIntel.value.name = defaultAgentName.value
      currentIntel.value.description = defaultAgentContent.value
      // 设置为默认的比较智能体
      currentAgentType.value = 'compare'
    } else {
      let agentDetail = await getAgentDetailById(agentId)
      if (agentDetail.status) {
        currentIntel.value.name = agentDetail.data.agentName
        currentIntel.value.description = agentDetail.data.agentDescription
      }
    }

    currentIntelId.value = agentId
    eventBus.emit('showAgentChatList')
    agentChatList.value = chatResult.data
  } else {
    ElMessage.error(chatResult.message)
  }
}

const {
    currentIntelId,
    currentIntel,
    agentChatList
    currentAgentType
}  = useShared()

</script>

<template>
  <div class="container" v-if="pageType === PageType.LIST_PAGE">
    <div class="createAgent">
      <div class="createButton" @click="goToCreateAgentPage(FromPage.FROM_LIST_PAGE)">
        <span>创建智能体</span>
      </div>
    </div>
    <div class="agentList">
      <AgentCard
        :key="userId"
        :agent-id="userId"
        :agent-title="defaultAgentName"
        :agent-content="defaultAgentContent"
        :background-color="gradients[Math.floor(Math.random() * gradients.length)]"
        :agent-type = "agentType"
        @edit-agent = "editAgent"
        @show-agent-conversations="showAgentConversations"
      />
      <AgentCard
        v-for="agent in agents"
        :key="agent.id"
        :agent-id="agent.id"
        :agent-title="agent.title"
        :agent-content="agent.content"
        :background-color="agent.color"
        :img-url="agent.agentPicUrl"
        @delete-agent = "deleteAgent"
        @edit-agent = "editAgent"
        @show-agent-conversations="showAgentConversations"
      />
    </div>
  </div>
  <CreateAgentForm
      v-if="pageType === PageType.CREATE_PAGE || pageType === PageType.EDIT_PAGE"
      :form-intel="formIntel"
      :type="pageType"
      :is-computed="isComputed"
      @cancel="cancelIntel"
      @create="createData"
      @add-intel="addIntel"
  />
  <div class="emptyPage" v-if="pageType === PageType.EMPTY_PAGE">
    <div class="noAgentImg">
      <img src="@/assets/agent/noAgent.png" alt="" />
    </div>
    <div class="noAgentTip"><span>暂无智能体</span></div>
    <div class="createAgentButton" @click="goToCreateAgentPage(FromPage.FROM_EMPTY_PAGE)">创建智能体</div>
  </div>
</template>

<style scoped lang="less">
.emptyPage {
  width: 260px;
  height: 299.6px;
  margin: 332.4px auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  .noAgentImg {
    img {
      width: 150px;
      height: 147.88px;
    }
    border: 1px dashed #7f7f7f;
  }
  .createAgentButton {
    width: 260px;
    height: 54px;
    border-radius: 27px;
    background-color: #1B6CFF;
    cursor: pointer;
    text-align: center;
    line-height: 54px;
    color: white;
  }
  .noAgentTip {
    margin-top: 30px;
    margin-bottom: 36.73px;
    width: 90px;
    height: 27px;
    color: #6A6A6A;
  }
}
.container {
  margin: 44px auto 0;
  width: 1052px;

  .createAgent {
    margin-left: 872px;
    .createButton {
      border: 1px solid #518FFF;
      border-radius: 27px;
      width: 180px;
      height: 42px;
      cursor: pointer;
      text-align: center;
      line-height: 42px;
      box-sizing: border-box;
      span {
        color: #518FFF;
      }
    }
  }

  .agentList {
    margin-top: 40px;
    display: flex;
    flex-wrap: wrap;
    gap: 16px; /* 添加间距 */

    /* 使用伪元素清除每行最后一个的额外间距 */
    &::after {
      content: "";
      width: calc((100% - 32px) / 3); /* 计算卡片宽度 */
      /* 当卡片数量不是3的倍数时，添加占位元素 */
    }

    > * {
      /* 确保每行正好三个卡片 */
      width: calc((100% - 32px) / 3); /* 100% - 两个间隙宽度 */
    }
  }
}
</style>