<template>
  <el-container style="height: 100vh;">
    <!-- 左侧栏 -->
    <el-aside :width="isCollapsed ? '60px' : '250px'" style="background-color: #f5f5f5; transition: width 0.3s;display: flex;">
      <div class="aside_left"  style="width: 60px;height: 44px;margin-top: 10px;">
        <img src="../../assets/fold.png" @click="toggleCollapse"/>
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
                  <el-avatar :size="40" :src="avatarUrl" />
                  <div class="user-details">
                    <div class="username">{{ userInfo.userid }}</div>
                  </div>
                </div>
                <el-divider />
                <el-button type="text" @click="handleLogout">退出登录</el-button>
              </div>
            </el-popover>
        </div>
        <div class="noLogin" v-if="!isLogin" @click="dialogVisible = true">未登录</div>
      </div>

      <div class="aside_right" :style="{width:isCollapsed?'0px':'190px',borderRight:isCollapsed?'none':'2px solid #EAEAEA',display:isCollapsed?'none':'block'}">
        <div style="width: 176px;height: 57px;margin-top: 15px;"><img src="../../assets/lux.png" style="width: 100%;height: 100%;"></div>
        <div style="padding: 22px 10px 10px 10px;">
        <el-button type="primary" @click="startNewConversation" class="back_set">
          {{ isCollapsed ? '' : '开启新对话' }}
        </el-button>

        </div>
        <el-menu :collapse="isCollapsed" style="border-right: none;">
        <el-tooltip v-for="(question, index) in questions" :key="index" :content="question" placement="right">
          <el-menu-item :index="index.toString()" @click="queryAn(question)">
            <span>{{ isCollapsed ? 'Q' : question }}</span>
          </el-menu-item>
        </el-tooltip>
        </el-menu>

      </div>

    </el-aside>

    <!-- 右侧内容 -->
    <el-container>
      <el-main>
        <div v-if="!currentQuestion" class="center-container" style="display: flex;flex-direction: column;">
          <div class="main_content" style="margin-bottom: 20px;height: calc(100% - 180px);width: 60%;overflow-y: auto;">
            <div class="title">
              <img src="../../assets/chat.deepseek.com_.png" class="title_src">
              <div>
                <div class="title_top" style="line-height: 30px;">Hello!我是立讯技术百事通，有什么问题欢迎咨询</div>
                <div class="title_item" style="line-height: 18px;">
                  <span>我可以帮你做这些事情,</span>
                  <span style="color: #409eff;padding-left: 5px;cursor: pointer;">换一换?</span>
                  <div style="display: inline-block;cursor: pointer;"><img src="../../assets/re.png" style="width: 20px;height: 20px;margin-left: 5px;"></div>
                </div>
              </div>
              
            </div>
            <div class="content_list">
              <div class="list_item">
                  <div class="list_title">今日热搜</div>
                  <div class="list_tip">深度搜索你关心的问题</div>
                  <div class="list_arry">
                    <div v-for="item in arrList" class="arr_item">
                      <span>{{ item.index }}.</span>
                      <span style="padding-left: 3px;" class="item_hover" @click="submitQuestion(item.name)">{{ item.name }}</span>
                    </div>
  
                  </div>
              </div>
              <!-- <div class="list_item" style="margin-left: 20px;">
                <div class="list_title">历史热搜</div>
                  <div class="list_tip">看看哪些问题被问得最多</div>
                  <div class="list_arry">
                    <div v-for="item in historyList" class="arr_item">
                      <span>{{ item.index }}.</span>
                      <span style="padding-left: 3px;" class="item_hover" @click="submitQuestion(item.name)">{{ item.name }}</span>
                    </div>
  
                  </div>
              </div> -->
              <div class="list_item" style="margin-left: 20px;">
                <div class="list_title">效率工具</div>
                  <div class="list_tip">办公学习必备</div>
                  <div class="img_list">
                    <div class="img_item">
                      <div class="image"><img src="../../assets/1.png"></div>
                      <div class="img_text">
                        <div class="text_title">翻译</div>
                        <div class="text_content">准确翻译成各国语言</div>
                      </div>
                    </div>
                    <div class="img_item" style="margin-top: 10px;">
                      <div class="image"><img src="../../assets/2.png"></div>
                      <div class="img_text">
                        <div class="text_title">总结</div>
                        <div class="text_content">AI速读论文、图书等超长文档</div>
                      </div>
                    </div>
                    <div class="img_item" style="margin-top: 10px;">
                      <div class="image"><img src="../../assets/3.png"></div>
                      <div class="img_text">
                        <div class="text_title">PPT创作</div>
                        <div class="text_content">言之有物、设计精美的智能PPT</div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
          <div style="width: 100%;display: flex;justify-content: flex-end;align-items: center;border-radius: 10px;flex-direction: column;height: 140px;">

            <div class="textarea">
              <el-input
              v-model="newQuestion"
              placeholder="请输入您的问题,换行请按下Shift+Enter"
              style="width:100%;"
              class="custom-input"
              clearable
              @keydown="summitPost"
              @keyup.shift.enter="handleShiftEnter"
              ref="textareaInputs"
              type="textarea"
              :rows="dynamicRows"
              @input="adjustTextareaHeights"
            />
                <!-- 发送图标 -->
            <div
              class="send-icon"
              :class="{ 'hovered': isHovered }"
              @click="submitQuestion"

            >
            <img :src="newQuestion?imageB:imageA" class="arrow"/>
            </div>
            </div>

        </div>
        </div>
        <div v-else style="height: 100%;">
            <div class="main_content" style="margin-bottom: 20px;height: calc(100% - 222px);width: 70%;margin-left: 15%;overflow-y: auto;">
            <div style="width: 100%;text-align: center;padding-top: 30px;">{{ currentObj.messages.type?'已为您匹配到最佳答案':'正在为您查询...' }} </div>
            <div style="display: flex;flex-direction: row-reverse;width: 100%;" :style="{marginTop:index===0?'50px':'30px'}">
              <div style="background-color: #eff6ff;border-radius: 10px;padding: 10px;float: right;">{{ tipQuery }}</div>
            </div>

            <div class="text_item" style="margin-top: 25px;display: flex;line-height: 30px;" >
              <img src="../../assets/chat.deepseek.com_.png" class="title_src" style="margin-right: 4px;width: 30px;height: 30px;">
              <div style="width: 100%;padding-left: 3px;"> {{ currentObj.messages.type?'最佳答案已生成':'开始总结答案...' }} </div>
            
            </div>
            <div style="margin-top: 20px;width: 100%;font-size: 12px;display: flex;flex-direction: column;">
              <!-- <p style="font-size: 14px;" v-for="(msg,index) in displayedMessages">
                {{ msg}}
              </p> -->
              <div>{{ currentMessage }}</div>
            </div>
            <MarkdownRenderer v-if="currentObj.messages.type==='final_answer'" :markdown="currentObj.messages.content" />
            <div style="margin-top: 30px;padding: 0 10px;" v-if="currentObj.messages.type==='final_answer'&&currentObj.messages.sources">附件</div>
            <a style="margin-top: 10px;color:#409eff;cursor: pointer;padding: 0 10px;font-size: 14px;" v-for="(it,index) in processedData" v-if="currentObj.messages.type==='final_answer'&&currentObj.messages.sources">
              <!-- {{ it.document_title }}  ( 第 {{ it.page }} 页 ) -->
              {{ it.document_title }}(第{{ it.page.join('/') }}页)
            </a>
          </div>
          <div style="width: 100%;display: flex;justify-content: flex-end;align-items: center;border-radius: 10px;flex-direction: column;height: 182px;">
            <el-button type="primary" @click="startNewConversation" class="back_set">
              开启新对话
            </el-button>
            <div class="textarea" style="margin-top: 10px;">
              <el-input
              v-model="newQuestion"
              placeholder="请输入您的问题,换行请按下Shift+Enter"
              class="custom-input"
              style="width:100%;"
              @keydown="summitPost"
              @keyup.shift.enter="handleShiftEnter"
              type="textarea"
              ref="textareaInput"
              :rows="dynamicRows"
              @input="adjustTextareaHeight"
            />
                <!-- 发送图标 -->
            <div
              class="send-icon"
              :class="{ 'hovered': isHovered }"
              @click="submitQuestion"
            >
            <img :src="newQuestion?imageB:imageA" class="arrow"/>
            </div>
            </div>
          </div>

        </div>
      </el-main>
    </el-container>

  </el-container>
      <!-- 弹窗 -->
    <el-dialog
    v-model="dialogVisible"
    title="登录"
    width="30%"
    :before-close="handleClose"
  >
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
            <el-icon @click="togglePasswordVisibility" style="cursor: pointer;">
              <component :is="passwordVisible ? View : Lock" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item class="button-item" style="display: flex;justify-content: center;width: 100%;margin-top: 40px;">
        <el-button type="primary" @click="submitForm" style="width: 100%;height: 40px;">登录</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { ref,computed,onMounted,onUnmounted,reactive } from 'vue';
import { postRequest } from '../../utils/request'; // 导入封装的 axios 方法
import { ElMessage,ElLoading,ElPopover, ElButton, ElDivider } from 'element-plus'; // 引入 ElMessage
import { useRouter } from 'vue-router';
import imageA from '../../../src/assets/arrow_gray.png';
import imageB from '../../../src/assets/arrow_blue.png';
import photo from '../../../src/assets/chat.deepseek.com_.png';
import { createSSEConnection } from '../../../src/utils/sse';
import MarkdownRenderer from './component/markdown.vue'; // 引入 Markdown 渲染组件
import { View, Lock } from '@element-plus/icons-vue'; // 引入需要的图标
// 静态导入图片
export default {
  name:'main',
  components: {
    ElPopover,
    ElButton,
    ElDivider,
    MarkdownRenderer
  },
  setup() {
    const router = useRouter();
    const isCollapsed = ref(false);
    const questions = ref([]);
    const newQuestion = ref('');
    const currentQuestion = ref('');
    const currentAnswer = ref('');
    // const imageA = '../../../src/assets/arrow_gray.png'; // 图片 A 的路径
    // const imageB = '../../../src/assets/arrow_blue.png'; // 图片 B 的路径
    // const photo = '../../../src/assets/006joT8tgy1husr7becqfj30dm0dmmyn.jpg'; // 图片 B 的路径
    const currentData = ref({})
    const currentImage = ref(imageA); // 默认显示图片 B
    const dynamicRows = ref(1)
    const textareaInputs = ref(null); 
    const textareaInput = ref(null); // 获取 textarea 元素的引用
    const queryIng = ref(false);
    const passwordVisible = ref(false);
    const userInfo = ref({
      userid:'',
    })
        // 当前显示的消息内容
    const currentMessage = ref('');
    const changeImage = (newImage) => {
      currentImage.value = newImage;
    };
    const loginForm = ref({
      username: '',
      password: '',
    });
    const rules = {
      username: [
        { required: true, message: '请输入工号(用户名)', trigger: 'blur' },
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
      ],
    };
    const togglePasswordVisibility = () => {
      passwordVisible.value = !passwordVisible.value;
    };
    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value;
    };
    const showPopup = ref(false);
    const dialogVisible = ref(false)
    const avatarUrl = ref(photo); // 替换为你的头像URL
    const handleClose = (done) => {
      // 这里可以添加一些关闭前的逻辑
      done();
    };
    const isLogin = ref(false)
    // 方法定义
    const getCurrentTime = () => {
      const now = new Date()
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    }
    // 消息数据
    const mesObj = ref(
      {
        messages:[],
        messageList:[]
      }
    )

    const processedData = computed(() => {
      const result = [];
      const map = new Map();
      
      currentObj.value.messages.sources.forEach(item => {
        const key = `${item.document_id}-${item.document_title}`;
        if (!map.has(key)) {
          map.set(key, { document_id: item.document_id, document_title: item.document_title, page: new Set() });
        }
        map.get(key).page.add(item.page);
      });

      map.forEach(value => {
        result.push({
          document_title: value.document_title,
          page: Array.from(value.page).sort((a, b) => a - b)
        });
      });

      return result;
    });

    const submitForm = async () => {
      const data = {
          userid:loginForm.value.username,
          password:loginForm.value.password
      }
      try {
        // 替换为实际的后端接口地址
        const response = await fetch('http://10.180.248.140:8080/UserInfo/login', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)

        })
        const res = await response.json();
        if(res.data && res.data.clientStatus==='PASS'){
          ElMessage.success('登录成功');
          isLogin.value = true
          localStorage.setItem('userInfo',JSON.stringify(data))
          userInfo.userid = data.userid
          dialogVisible.value = false
        } else if(res.data && res.data.clientStatus!=='PASS'){
          ElMessage.error(res.data.message);
        } else{
          ElMessage.error('登录失败,请稍后再试');
        }
      } catch (error) {
          // loadingInstance.close();
          console.error('获取回复失败:', error);
          // botMessage.text = '抱歉，暂时无法获取回复';
        }
    };

    const handleLogout = () => {
      // 处理退出登录逻辑
      ElMessage.success('退出成功');
      localStorage.setItem('userInfo','')
      isLogin.value = false
    };
  // 动态调整 textarea 高度的方法
  const adjustTextareaHeight = () => {
    const textarea = textareaInput.value?.textarea; // 获取 textarea 元素
    if (textarea) {
      // 重置行高，以便重新计算
      textarea.style.height = 'auto';
      // 获取计算后的样式
      const computedStyle = window.getComputedStyle(textarea);
      // 计算 lineHeight（考虑 Element Plus 的默认 line-height: 1.5）
      const lineHeight = parseFloat(computedStyle.lineHeight);
      // 计算 paddingTop 和 paddingBottom
      const paddingTop = parseFloat(computedStyle.paddingTop);
      const paddingBottom = parseFloat(computedStyle.paddingBottom);
      // 计算内容高度（减去 padding）
      const scrollHeight = textarea.scrollHeight - paddingTop - paddingBottom;
      // 计算行数
      const rows = Math.floor(scrollHeight / lineHeight);

      // 只有当行数变化时，才更新 dynamicRows
      if (rows !== dynamicRows.value) {
        dynamicRows.value = Math.min(Math.max(rows, 1), 5); // 限制行数在 1 到 5 之间
      }

      // 根据行数动态设置 overflow-y
      if (rows > 5) {
        textarea.style.overflowY = 'auto'; // 超过 5 行时显示滚动条
      } else {
        textarea.style.overflowY = 'hidden'; // 小于等于 5 行时隐藏滚动条
      }
    }
  };
  const arrList = ref(
    [
      {
        index:1,
        name:'我进入立讯技术后如何选择导师？'
      },
      {
        index:2,
        name:'员工延假与销假如何进行'
      },
      {
        index:3,
        name:'公司实习生的待遇怎么样'
      },
      {
        index:4,
        name:'亲属回避包括哪些等级'
      },
      {
        index:5,
        name:'工人是否有宗教信仰的自由'
      },
    ]
  ) 

  const historyList = ref(
    [
    {
        index:1,
        name:'内部讲师的选拔条件是什么'
      },
      {
        index:2,
        name:'实习协议应包含哪些内容'
      },
      {
        index:3,
        name:'员工培训包括哪些种类'
      },
      {
        index:4,
        name:'亲属回避包括哪些等级'
      },
      {
        index:5,
        name:'工人是否有自由结社的权利'
      },
    ]
  )
     // 动态调整 textarea 高度的方法
  const adjustTextareaHeights = () => {
    const textarea = textareaInputs.value?.textarea; // 获取 textarea 元素
    if (textarea) {
      // 重置行高，以便重新计算
      textarea.style.height = 'auto';
      // 获取计算后的样式
      const computedStyle = window.getComputedStyle(textarea);
      // 计算 lineHeight（考虑 Element Plus 的默认 line-height: 1.5）
      const lineHeight = parseFloat(computedStyle.lineHeight);
      // 计算 paddingTop 和 paddingBottom
      const paddingTop = parseFloat(computedStyle.paddingTop);
      const paddingBottom = parseFloat(computedStyle.paddingBottom);
      // 计算内容高度（减去 padding）
      const scrollHeight = textarea.scrollHeight - paddingTop - paddingBottom;
      // 计算行数
      const rows = Math.floor(scrollHeight / lineHeight);

      // 只有当行数变化时，才更新 dynamicRows
      if (rows !== dynamicRows.value) {
        dynamicRows.value = Math.min(Math.max(rows, 1), 4); // 限制行数在 1 到 5 之间
      }

      // 根据行数动态设置 overflow-y
      if (rows > 5) {
        textarea.style.overflowY = 'auto'; // 超过 5 行时显示滚动条
      } else {
        textarea.style.overflowY = 'hidden'; // 小于等于 5 行时隐藏滚动条
      }
    }
  }; 
    const startNewConversation = () => {
      currentQuestion.value = '';
      currentAnswer.value = '';
      newQuestion.value = '';
      tipQuery.value = ''
      dynamicRows.value = 1
      // adjustTextareaHeights()
      // adjustTextareaHeight()
    };

    const queryAn = (val) => {
      
      currentQuestion.value = true
      submitQuestion(val)
      // currentData.value = dataList.value[index]
    
    };
  
    const dataList = ref(
      [
        {
          id:1,
          main:'导师相关话题',
          title:'我进入立讯技术后如何选择导师？',
          data:[
            '开始处理请求...',
            '开始对问题进行分类......',
            '问题的类别为：1: 具体且可回答的HR相关问题（调用 RAG 系统生成回答）\n分类原因：该问题涉及具体的 HR 相关政策或流程，可以通过知识库检索找到明确答案。',
            '已完成总结答案',
          ],
          final:{
            text:'在立讯技术，新员工的导师选择是由上级主管在面试评估表中填写的。对于新干和5 8级新员工，导师指派是必选项。其他职级的直属主管可以根据实际情况选择性指派导师。指派的导师需满足以下条件：司龄2年及以上，上一年度绩效为A及以上，对公司文化有强烈认同感和深刻的理解，责任心强，有意愿和能力对新员工进行专业方面的指导，导师的岗位职级高于其所辅导的新员工，且每位导师同时辅导的新员工不超过3人。',
            source:'_立讯精密导师管理办法_'
          } 
        },
        {
          id:2,
          main:'导师相关话题',
          title:'立讯技术成立时间',
          data:[
            '开始处理请求...',
            '开始对问题进行分类......',
            '问题的类别为：1: 具体且可回答的HR相关问题（调用 RAG 系统生成回答）\n分类原因：该问题涉及具体的 HR 相关政策或流程，可以通过知识库检索找到明确答案。',
            '已完成总结答案',
          ],
          final:{
            text:'立讯技术（Luxshare Precision Industry Co., Ltd.）成立于2004年5月24日，总部位于中国广东省东莞市。公司专注于连接器、线缆、天线等电子元器件的研发、生产和销售，是全球领先的电子制造服务提供商之一。',
            source:'_立讯技术对外资料'
          } 
        }
      ]

    )


  // 排序函数

    // const sortData = (data) => {
    //     return data.sort((a, b) => {
    //       // 先按 name 排序
    //       const nameCompare = a.document_title.localeCompare(b.document_title);
    //       if (nameCompare !== 0) return nameCompare;

    //       // 如果 name 相同，则按 page 排序
    //       return a.page - b.page;
    //     });
    // }

    const isObject = (variable) => {
      const type = Object.prototype.toString.call(variable);
      return type === '[object PointerEvent]' || type === '[object KeyboardEvent]';
    }
    const tipQuery = ref('')

   // 用于存储每条消息的当前显示内容
  const displayedMessages = ref([]);

  // 当前正在显示的消息索引
  const currentMessageIndex = ref(0);

  // 逐个字显示消息内容的函数
  // const displayMessage = async (message, index) => {
  //   return new Promise((resolve) => {
  //     let i = 0;
  //     const interval = setInterval(() => {
  //       if (i < message.content.length) {
  //         // 逐个字添加到 displayedMessages 中
  //         displayedMessages.value[index] += message.content[i];
  //         i++;
  //       } else {
  //         // 停止定时器
  //         clearInterval(interval);
  //         resolve(); // 当前消息显示完成
  //       }
  //     }, 30); // 每个字的显示间隔为 100 毫秒
  //   });
  // };

      // 逐个字显示消息内容的函数
    const displayMessage = async (message) => {
      return new Promise((resolve) => {
        let i = 0;
        const interval = setInterval(() => {
          if (i < message.content.length) {
            // 逐个字添加到 currentMessage 中
            currentMessage.value += message.content[i];
            i++;
          } else {
            // 停止定时器
            clearInterval(interval);
            resolve(); // 当前消息显示完成
          }
        }, 30); // 每个字的显示间隔为 30 毫秒
      });
    };

      // 逐条显示消息
  // const displayMessagesSequentially = async () => {
  //   while (currentMessageIndex.value < currentObj.value.messageList.length) {
  //     const message = currentObj.value.messageList[currentMessageIndex.value];
  //     displayedMessages.value.push(''); // 初始化当前消息的显示内容
  //     await displayMessage(message, currentMessageIndex.value); // 显示当前消息
  //     currentMessageIndex.value++; // 移动到下一条消息
  //   }
  // };

      // 逐条显示消息
    const displayMessagesSequentially = async () => {
      while (currentMessageIndex.value < currentObj.value.messageList.length) {
        const message = currentObj.value.messageList[currentMessageIndex.value];
        currentMessage.value = ''; // 清空当前消息
        await displayMessage(message); // 显示当前消息
        currentMessageIndex.value++; // 移动到下一条消息
      }
    };

    const currentObj = ref({
      messages:{},
      messageList:[]
    })
    const handleShiftEnter = () => {
      // Shift + Enter 时允许换行
      newQuestion.value += '\n';
    };

    const summitPost = (event) => {

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // 阻止默认的换行行为
        submitQuestion();
      }
    }

    const submitQuestion = async (val) => {
      if(queryIng.value){
        return
      }
      if(isObject(val)&&!newQuestion.value){
        val=''
        ElMessage.warning('请输入您的问题再发送');
        return
      }
      if(val&&!isObject(val)){
        
        newQuestion.value = val
      }
      if(!newQuestion.value){
        ElMessage.warning('请输入您的问题再发送');
        return
      }
      
      currentQuestion.value = true
      changeImage(imageA)
      
      currentMessageIndex.value = 0
      currentObj.value.messages = {}
      currentObj.value.messageList = []
      // const messages = {}
      // const messageList = []
      // mesObj.value.push(obj)
      // messages.value = {}
      // messageList.value = []
      displayedMessages.value = []
      const queryValue = newQuestion.value
      tipQuery.value = queryValue
      newQuestion.value = ''
      queryIng.value = true
      // const loadingInstance = ElLoading.service({
      //   lock: true, // 是否锁定屏幕
      //   text: '', // 加载文本
      //   background: 'rgba(0, 0, 0, 0)', // 背景颜色
      // });
      if(!questions.value.includes(queryValue)){
        questions.value.push(queryValue)
      }
      if(localStorage.getItem('questionList')){
        const questionList = JSON.parse(localStorage.getItem('questionList'))
        if(!questionList.includes(queryValue)&&queryValue.trim()){
          questionList.push(queryValue)
          localStorage.setItem('questionList',JSON.stringify(questionList))
        }

      }
      if(!localStorage.getItem('questionList')){
        const questionList = []
        if(!questionList.includes(queryValue)&&queryValue.trim()){
          questionList.push(queryValue)
          localStorage.setItem('questionList',JSON.stringify(questionList))
        }

      }
      // displayMessagesSequentially();
      try {

        // 替换为实际的后端接口地址
        const res = await fetch('http://10.180.248.140:8080/AI/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: queryValue,
            user_id: "2"
          }),
        })

          // 处理流式数据
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = ''; // 缓冲区用于存储不完整的数据
          const set = new Set();

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            // 将二进制数据解码并添加到缓冲区
            buffer += decoder.decode(value, { stream: true });
            //处理buffer数据
            const jsonStr = buffer.replace(/data:\s*/g, '');
            // const jsonStr = buffer.replace(/data:\s*/g, '');
            // if(jsonStr.includes(',{"p')){
            //   jsonStr.replace(',{"p', '');
            // }
            // console.log(jsonStr)
            const jsonStrArr =jsonStr.split("\n\n").filter(item => item.length!=0)
            console.log(jsonStrArr)
            jsonStrArr.forEach(element => {
              const type = JSON.parse(element).type
              if(type==='final_answer'){
                queryIng.value = false
                // loadingInstance.close();
                currentObj.value.messages = JSON.parse(element)
              } else{
                currentObj.value.messageList.push(JSON.parse(element))
              }
              if(currentObj.value.messageList.length>0){
                currentObj.value.messageList = Array.from(new Set(currentObj.value.messageList.map(message => message.content)))
                .map(content => {
                  return currentObj.value.messageList.find(message => message.content === content);
                });
              }
              
              // if(messages.value.sources&&messages.value.sources.length>0){
              //   messages.value.sources = Array.from(new Set(temp.sources.map(item => JSON.stringify({ document_id: item.document_id}))))
              //   .map(str => JSON.parse(str))
              //   .map(uniqueItem => temp.sources.find(item => item.document_id === uniqueItem.document_id));
              //   messages.value.sources = sortData(messages.value.sources);
              // }


              // messages.value.push(temp)
            });
            
            
            // displayedMessages.value = Array(messageList.value.length).fill(''); // 初始化 displayedMessages
            await displayMessagesSequentially();
          }
        } catch (error) {
          queryIng.value = false
          // loadingInstance.close();
          console.error('获取回复失败:', error);
          // botMessage.text = '抱歉，暂时无法获取回复';
        }
    };


    // 组件挂载后初始化
    onMounted(() => {
      adjustTextareaHeight(); // 初始调整高度
      if(localStorage.getItem('userInfo')){
        isLogin.value = true
        const loginData = JSON.parse(localStorage.getItem('userInfo'))
        userInfo.value.userid = loginData.userid
      }
      if(localStorage.getItem('questionList')){
        const questionList = JSON.parse(localStorage.getItem('questionList'))
        questions.value = questionList
      }else{
        questions.value = []
      }
    });
        // 组件卸载时关闭 SSE 连接
    // 组件卸载时关闭 SSE 连接
    onUnmounted(() => {

    });

    return {
      isCollapsed,
      questions,
      newQuestion,
      tipQuery,
      currentQuestion,
      currentImage,
      imageA,
      imageB,
      changeImage,
      queryAn,
      currentAnswer,
      toggleCollapse,
      submitForm,
      startNewConversation,
      handleShiftEnter,
      submitQuestion,
      summitPost,
      currentData,
      dynamicRows,
      textareaInput,
      textareaInputs,
      adjustTextareaHeights,
      adjustTextareaHeight,
      arrList,
      historyList,
      showPopup,
      avatarUrl,
      userInfo,
      rules,
      handleLogout,
      processedData,
      getCurrentTime,
      currentObj,
      displayedMessages,
      currentMessageIndex,
      displayMessagesSequentially,
      currentMessage,
      queryIng,
      isLogin,
      dialogVisible,
      handleClose,
      loginForm,
      togglePasswordVisibility,
      passwordVisible,
      View, // 注册图标组件
      Lock, // 注册图标组件
    };
  },
};
</script>

<style lang="less">
.user-avatar-container {
  position: fixed;
  bottom: 20px;
  left: 8px;
}
.noLogin{
  font-size: 14px;
  cursor: pointer;
  position: fixed;
  color: #409eff;
  bottom: 30px;
  left: 8px;
}
.user-avatar {
  cursor: pointer;
}

.popover-reference {
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
}

.user-info-popup {
  text-align: center;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details {
  margin-left: 10px;
  text-align: left;
}

.username {
  font-weight: bold;
}

.department {
  font-size: 12px;
  color: #888;
}
.el-main{
  padding: 0px !important;
  background: linear-gradient(
                to bottom,
                rgba(135, 206, 235, 0.2), /* 淡蓝色，透明度 60% */
                rgba(224, 247, 250, 0.1)  /* 更淡的蓝色，透明度 60% */
            );
}
/* 去掉 textarea 右下角的小图标 */
.custom-input textarea {
  overflow-y: auto;
  resize: none; /* 禁用调整大小功能 */
}
.el-textarea__inner{
  padding: 18px 60px 18px 15px !important;
  letter-spacing: 1px; /* 设置字间距 */
}
.el-menu--vertical:not(.el-menu--collapse):not(.el-menu--popup-container) .el-menu-item{
  height: 40px;
  padding: 0 15px !important;
}
.el-menu-item span{
  height: 40px;
  line-height: 40px;
}
.main_content{
  width: 60%;
  display: flex;
  flex-direction: column;
  align-items:flex-start;
}
.el-textarea__inner{
  background-color: #fff !important;
}
.el-textarea__inner{
  border-radius: 16px !important;
}
.textarea{
  width: 60%;
  position: relative;
}
.title_src{
  width: 60px;
  height: 60px;
  margin-right: 10px;
}
.title{
  margin-bottom: 10px;
  display: flex;
  .title_top{
    font-size: 20px;
    font-weight: bold;
  }
  .title_item{
    height: 20px;
    line-height: 20px;
    margin-top: 7px;
    display: flex;
  }
}
.content_list{
  display: flex;
  margin-top: 20px;
  height: 300px;
  width: 100%;
  .list_item{
    flex: 1;
    height: 300px;
    border-radius: 12px;
    background: linear-gradient(
                to bottom,
                rgba(135, 206, 235, 0.3), /* 淡蓝色，透明度 60% */
                rgba(224, 247, 250, 0.3)  /* 更淡的蓝色，透明度 60% */
            );
    .list_title{
      padding-left: 20px;
      font-size: 16px;
      color:#000;
      font-weight: bold;
      margin-top: 25px;
    }
    .list_tip{
      padding-left:20px;
      font-size: 12px;
      color:#333;
      margin-top: 10px; 
      letter-spacing: 1px;
    }
    .list_arry{
      padding-left: 20px;
      margin-top: 20px;
      color:#333;
      font-size: 14px;
      line-height: 20px;
      .arr_item{
        line-height: 36px;
        cursor: pointer;
        .item_hover:hover{
          color: #409eff;
        }
      }
    }
    .img_list{
      display: flex;
      flex-direction: column;
      padding: 25px 20px;
      width: 100%;
      box-sizing: border-box;
      .img_item:hover{
        border: 1px solid #409eff;
      }
      .img_item{
        display: flex;
        background-color: #fff;
        border-radius: 10px;
        height: 56px;
        cursor: pointer;
        flex-direction: row;
        border: 1px solid #fff;
        .image{
          width: 36px;
          height: 36px;
          margin-top: 10px;
          margin-left: 15px;
          img{
            width: 100%;
            height: 100%;
          }
        }
        .img_text{
          height: 30px;
          padding-left: 10px;
          padding-top: 10px;
          .text_title{
            font-size: 14px;
            font-weight: bold;
            line-height: 20px;
          }
          .text_content{
            font-size: 12px;
            line-height: 15px;
            max-width: 140px;
            color: #333;
            white-space: nowrap;      /* 强制文本不换行 */
            overflow: hidden;        /* 隐藏超出容器的内容 */
            text-overflow: ellipsis; /* 超出部分显示省略号 */
          }
        }
      }
    }
  }
}
.typewriter {
  font-family: monospace; /* 使用等宽字体，效果更好 */
  white-space: nowrap; /* 防止文字换行 */
  overflow: hidden; /* 隐藏超出部分 */
  border-right: 2px solid #000; /* 光标效果 */
  width: fit-content; /* 宽度根据内容自适应 */
}

/* 光标闪烁动画 */
@keyframes blink {
  50% {
    border-color: transparent;
  }
}

.typewriter {
  animation: blink 0.75s step-end infinite;
}
.send{
  width: 80px;
  height: 32px;
  background-color: #409eff;
  border-radius: 6px;
  text-align: center;
  margin-left: 10px;
  line-height: 32px;
  color: #fff;
  font-size: 12px;
}
.input-container {
  position: relative;
  width: 100%;
}

.send-button {
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 1;
}
body {
  margin: 0px;
  background-color: #EAEAEA;
}
.aside_left{
  width: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.aside_left > img{
  width: 24px;
  height: 24px;
}
.aside_right{
  width: 190px;
  background-color: #fff;
  border-right: 2px solid #EAEAEA;
}
*{
  box-sizing: content-box;
}
.el-container{
  background-color: #fff;
}
.center-container {
  display: flex;
  align-items: center;
  height: 100%;
  box-sizing: border-box;
  padding-top: 80px;
}

.el-menu-item span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.send-icon {
  position: absolute;
  right: 18px;
  bottom: 3px;
  cursor: pointer;
  transition: color 0.3s;
}

.send-icon img{
  width: 44px;
  height: 44px;
}
.back_set{
  background-image: url('../../assets/start.png');
  background-repeat: no-repeat;
  padding-left: 35px;
  background-size: 18px 18px;
  background-position: 10px 7px;
}

.login-form {
  padding: 20px;
  /* position: absolute;
  right: 100px;
  bottom: 250px; */
  :deep(.el-form-item__label) {
  text-align: right;
  width: 80px !important; /* 调整 label 的宽度 */
  padding-right: 8px; /* 调整 label 和输入框的间距 */
  }

  /* 设置输入框长度一致 */
  // :deep(.el-input) {
  //   width: 247px; /* 输入框宽度占满剩余空间 */
  // }
  :deep(.el-form-item__content) {
    justify-content: flex-start;
  }
  :deep(.el-form-item__content) {
    justify-content: center;
  }
}




/* 登录按钮水平居中对齐 */
.button-item {
  display: flex;
  justify-content: center;
}
</style>