
<template>
  <el-container style="height: 100vh;">
    <!-- 左侧栏 -->
    <el-aside :width="isCollapsed ? '60px' : '280px'" style="background-color: #f5f5f5; transition: width 0.3s;display: flex;">
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

      <div class="aside_right" :style="{width:isCollapsed?'0px':'220px',borderRight:isCollapsed?'none':'2px solid #EAEAEA',display:isCollapsed?'none':'block'}">
        <div style="width: 200px;height: 62px;margin-top: 20px;margin-left: 10px;"><img src="../../assets/lux.png" style="width: 100%;height: 100%;"></div>
        <div style="padding: 22px 10px 10px 10px;">
        <el-button type="primary" @click="startNewConversation" class="back_set">
          {{ isCollapsed ? '' : '开启新对话' }}
        </el-button>

        </div>
        <el-menu  style="border-right: none;" :default-active="activeIndex" @select="handleSelect">
        <el-tooltip v-for="(question, index) in questions" :key="index" :content="question" placement="right" popper-class="custom-tooltip">
          <el-menu-item :index="index.toString()" @click="queryAn(question)" style="position: relative;">
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
                <img src="../../assets/delete.png" style="width: 14px;height: 14px;position: absolute;right: 10px">
              </template>
            </el-popconfirm>
            
          </el-menu-item>
        </el-tooltip>
        </el-menu>

      </div>

    </el-aside>

    <!-- 右侧内容 -->
    <el-container>
      <el-main>
        <div v-if="!currentQuestion" class="center-container" style="display: flex;flex-direction: column;">
          <div class="main_content" style="margin-bottom: 20px;height: calc(100% - 180px);width: 60%;overflow-y: auto;overflow-x: hidden;">
            <div class="title" v-if="pageType==='query'||pageType==='sample'">
              <img src="../../assets/chat.deepseek.com_.png" class="title_src">
              <div>
                <div class="title_top" style="line-height: 30px;">Hello!我是立讯技术百事通，有什么问题欢迎咨询</div>
                <div class="title_item" style="line-height: 18px;">
                  <span>我可以帮你做这些事情</span>
                  <!-- <span style="color: #409eff;padding-left: 5px;cursor: pointer;" @click="changeData">换一换?</span>
                  <div style="display: inline-block;cursor: pointer;"><img src="../../assets/re.png" style="width: 20px;height: 20px;margin-left: 5px;" @click="changeData"></div> -->
                </div>
              </div>
              
            </div>
            <div class="content_list" v-if="pageType==='query'">
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
              <div class="list_item" style="margin-left: 20px;">
                <div class="list_title">效率工具</div>
                  <div class="list_tip">办公学习必备</div>
                  <div class="img_list">
                    <div class="img_item" @click="changeType('tran')">
                      <div class="image"><img src="../../assets/1.png"></div>
                      <div class="img_text">
                        <div class="text_title">翻译</div>
                        <div class="text_content">准确将各国语言翻译成中文</div>
                      </div>
                    </div>
                    <div class="img_item" style="margin-top: 10px;" @click="changeType('final')">
                      <div class="image"><img src="../../assets/2.png"></div>
                      <div class="img_text">
                        <div class="text_title">总结</div>
                        <div class="text_content">AI智能总结,让复杂信息一目了然</div>
                      </div>
                    </div>
                    <div class="img_item" style="margin-top: 10px;">
                      <div class="image"><img src="../../assets/3.png"></div>
                      <div class="img_text">
                        <div class="text_title">更多功能</div>
                        <div class="text_content">开发中,敬请期待</div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
            <div class="content_list" v-if="pageType==='sample'">
              <div class="list_item">
                  <div class="list_title">今日热搜</div>
                  <div class="list_tip">深度搜索你关心的问题</div>
                  <div class="list_arry">
                    <div v-for="item in historyList" class="arr_item" >
                      <span>{{ item.index }}.</span>
                      <span style="padding-left: 3px;" class="item_hover" @click="submitSample(item.name)">{{ item.name }}</span>
                    </div>
                  </div>
              </div>
              <div class="list_item" style="margin-left: 20px;">
                <div class="list_title">效率工具</div>
                  <div class="list_tip">办公学习必备</div>
                  <div class="img_list">
                    <div class="img_item" @click="changeType('tran')">
                      <div class="image"><img src="../../assets/1.png"></div>
                      <div class="img_text">
                        <div class="text_title">翻译</div>
                        <div class="text_content">准确将各国语言翻译成中文</div>
                      </div>
                    </div>
                    <div class="img_item" style="margin-top: 10px;" @click="changeType('final')">
                      <div class="image"><img src="../../assets/2.png"></div>
                      <div class="img_text">
                        <div class="text_title">总结</div>
                        <div class="text_content">AI智能总结,让复杂信息一目了然</div>
                      </div>
                    </div>
                    <div class="img_item" style="margin-top: 10px;">
                      <div class="image"><img src="../../assets/3.png"></div>
                      <div class="img_text">
                        <div class="text_title">更多功能</div>
                        <div class="text_content">开发中,敬请期待</div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
            <div class="title" v-if="pageType==='tran'" style="width: 100%;justify-content: center;">
              <img src="../../assets/chat.deepseek.com_.png" class="title_src">
              <div>
                <div class="title_top" style="line-height: 30px;">立讯技术AI翻译专家</div>
                <div class="title_top">熟练掌握翻译技巧～你的翻译好帮手</div>
              </div>
              
            </div>
            <div style="font-size: 14px;margin-top: 30px;letter-spacing: 1px;" v-if="pageType==='tran'&&finalIng">
              <span> 正在为您翻译,请稍等</span>
              <span v-if="!transData">{{ dots }}</span>
            </div>
            <div style="margin-top: 30px;background-color: #fff;font-size: 14px;letter-spacing: 1px;line-height: 24px;border-radius: 10px;" v-if="pageType==='tran'" :style="{padding:transData?'0px 15px':'0px'}">
              <p>{{ transData }}</p>
            </div>

            <div class="title" v-if="pageType==='final'" style="width: 100%;justify-content: center;">
              <img src="../../assets/chat.deepseek.com_.png" class="title_src">
              <div>
                <div class="title_top" style="line-height: 30px;">立讯技术AI智能总结</div>
                <div class="title_top">精准概括，助你快速理解长文本</div>
              </div>
              
            </div>
            <div style="font-size: 14px;margin-top: 30px;letter-spacing: 1px;" v-if="pageType==='final'&&finalIng">
              <span> 正在为您总结,请稍等</span>
              <span v-if="!finalData.title">{{ dots }}</span>
            </div>
            <div style="margin-top: 20px;background-color: #fff;font-size: 14px;letter-spacing: 1px;line-height: 24px;border-radius: 10px;" v-if="pageType==='final'" :style="{padding:finalData.title?'15px 15px':'0px'}">
              <div v-if="finalData.title">
                <span>概括 : </span>
                <span>{{ finalData.title }} </span>
              </div>
              <div v-if="finalData.data.length>0" style="margin-top: 15px;">
                <div>关键词 : </div>
                <div v-for="items in finalData.data">
                  {{ items }}
                </div>
              </div>
            </div>
          </div>
          <div style="width: 100%;display: flex;justify-content: flex-end;align-items: center;border-radius: 10px;flex-direction: column;height: 140px;">
            <div class="tran_select" v-if="pageType==='query'||pageType==='sample'" style="display: flex;flex-direction: row-reverse;margin-bottom: 10px;">
              <el-radio-group v-model="selectedMode" @change="changeMode(selectedMode)" :disabled="isSampleLoad">
                <el-radio label="通用模式">通用模式</el-radio>
                <el-radio label="人资专题">人资专题</el-radio>
              </el-radio-group> 
              <div style="padding-right: 10px;line-height: 32px;font-size: 14px;">模式选择 : </div>
            </div>
            <div class="textarea" v-if="pageType==='query'">
              <el-input
              v-model="newQuestion"
              :placeholder="pageType==='query'?'请输入您的问题,换行请按下Shift+Enter':pageType==='final'?'请输入您想总结的文本,换行请按下Shift+Enter':'请输入您想翻译的文本,换行请按下Shift+Enter'"
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
            <div class="textarea" v-if="pageType==='sample'">
              <el-input
              v-model="newQuestion"
              placeholder="请输入您的问题,换行请按下Shift+Enter"
              style="width:100%;"
              class="custom-input"
              clearable
              @keydown="samplePost"
              @keyup.shift.enter="handleShiftEnter"
              ref="textareaInputSample"
              type="textarea"
              :rows="dynamicRows"
              @input="adjustTextareaHeightSample"
            />
                <!-- 发送图标 -->
            <div
              class="send-icon"
              :class="{ 'hovered': isHovered }"
              @click="submitSample"

            >
            <img :src="newQuestion?imageB:imageA" class="arrow"/>
            </div>

            </div>
            <div class="tran_select" v-if="pageType==='tran'" style="display: flex;flex-direction: row-reverse;margin-bottom: 10px;">
              
              <el-radio-group v-model="selectedLan">
                <el-radio label="中文">中文</el-radio>
                <el-radio label="英文">英文</el-radio>
                <el-radio label="西班牙语">西班牙语</el-radio>
                <el-radio label="越南语">越南语</el-radio>
              </el-radio-group>
              <div style="padding-right: 10px;line-height: 32px;font-size: 14px;">翻译成 : </div>
            </div>
            <div class="textarea" v-if="pageType==='tran'">
              <el-input
              v-model="newQuestion"
              :placeholder="pageType==='query'?'请输入您的问题,换行请按下Shift+Enter':pageType==='final'?'请输入您想总结的文本,换行请按下Shift+Enter':'请输入您想翻译的文本,换行请按下Shift+Enter'"
              style="width:100%;"
              class="custom-input"
              clearable
              @keydown="tranPost"
              @keyup.shift.enter="handleShiftEnter"
              ref="textareaInputTran"
              type="textarea"
              :rows="dynamicRows"
              @input="adjustTextareaHeightTran"
            />
                <!-- 发送图标 -->
            <div
              class="send-icon"
              :class="{ 'hovered': isHovered }"
              @click="submitTran"

            >
            <img :src="newQuestion?imageB:imageA" class="arrow"/>
            </div>
            </div>

            <div class="textarea" v-if="pageType==='final'">
              <el-input
              v-model="newQuestion"
              :placeholder="pageType==='query'?'请输入您的问题,换行请按下Shift+Enter':pageType==='final'?'请输入您想总结的文本,换行请按下Shift+Enter':'请输入您想翻译的文本,换行请按下Shift+Enter'"
              style="width:100%;"
              class="custom-input"
              clearable
              @keydown="finalPost"
              @keyup.shift.enter="handleShiftEnter"
              ref="textareaInputFinal"
              type="textarea"
              :rows="dynamicRows"
              @input="adjustTextareaHeightFinal"
            />
                <!-- 发送图标 -->
            <div
              class="send-icon"
              :class="{ 'hovered': isHovered }"
              @click="submitFinal"

            >
            <img :src="newQuestion?imageB:imageA" class="arrow"/>
            </div>
            </div>
        </div>
        </div>
        <div v-else style="height: 100%;">
            <div class="main_content" style="margin-bottom: 20px;width: 70%;margin-left: 15%;overflow-y: auto;overflow-x: hidden" :style="{height:pageType==='sample'?'calc(100% - 220px)':'calc(100% - 220px)',overflow:pageType==='sample'?'hidden':'auto'}">
            <!-- <div style="width: 100%;text-align: center;padding-top: 30px;" v-if="pageType==='query'">{{ currentObj.messages.type?'已为您匹配到最佳答案':'正在为您查询...' }} </div> -->
            <div style="display: flex;flex-direction: row-reverse;width: 100%;" :style="{marginTop:index===0?'100px':'80px'}" v-if="pageType==='query'">
              <div style="background-color: #409eff;border-radius: 10px;padding: 10px 15px;float: right;color:#fff">{{ tipQuery }}</div>
            </div>

            <div class="text_item" style="margin-top: 25px;display: flex;line-height: 30px;" v-if="pageType==='query'">
              <img src="../../assets/chat.deepseek.com_.png" class="title_src" style="margin-right: 4px;width: 30px;height: 30px;">
              <div style="width: 100%;padding-left: 3px;"> {{ currentObj.messages.type?'最佳答案已生成':'开始总结答案...' }} </div>
            
            </div>
            <div style="margin-top: 20px;width: 100%;font-size: 12px;display: flex;flex-direction: column;" v-if="pageType==='query'">
              <!-- <p style="font-size: 14px;" v-for="(msg,index) in displayedMessages">
                {{ msg}}
              </p> -->
              <div>{{ currentObj.messages.isHistory?'':currentMessage }}</div>
            </div>
            <MarkdownRenderer v-if="pageType==='query'&&currentObj.messages.type==='final_answer'" :markdown="currentObj.messages.content" />
            <div style="margin-top: 30px;padding: 0 10px;" v-if="pageType==='query'&&currentObj.messages.type==='final_answer'&&currentObj.messages.sources">附件</div>
            <a style="margin-top: 10px;color:#409eff;cursor: pointer;padding: 0 10px;font-size: 14px;" v-for="(it,index) in processedData" v-if="pageType==='query'&&currentObj.messages.type==='final_answer'&&currentObj.messages.sources" @click="toDoc(it)">
              <!-- {{ it.document_title }}  ( 第 {{ it.page }} 页 ) -->
              {{ it.document_title }}(第{{ it.page.join('/') }}页)
            </a>
            <div style="margin-top: 20px;width: 100%;display: flex;" v-if="pageType==='query'&&currentObj.messages.type==='final_answer'">
              <div><img src='../../assets/refresh.png' style="width: 18px;height: 18px;margin-left: 10px;cursor: pointer;"></div>
              <div><img src='../../assets/up.png' style="width: 18px;height: 18px;margin-left: 15px;cursor: pointer;" @click="upCommon"></div>
              <div><img src='../../assets/down.png' style="width: 18px;height: 18px;margin-left: 15px;cursor: pointer;" @click="downCommon"></div>
            </div>
            <!-- <div style="display: flex;flex-direction: row-reverse;width: 100%;" :style="{marginTop:index===0?'50px':'30px'}" v-if="pageType==='sample'">
              <div style="background-color: #409eff;border-radius: 10px;padding: 10px 15px;float: right;color:#fff">{{ tipQuery }}</div>
            </div> -->

            <div class="text_item" style="margin-top: 75px;display: flex;line-height: 30px;" v-if="pageType==='sample'">
              <img src="../../assets/chat.deepseek.com_.png" class="title_src" style="margin-right: 4px;width: 30px;height: 30px;">
              <div style="width: 100%;padding-left: 3px;"> {{ chatQuery.messages.length>0?'最佳答案已生成':'开始总结答案...' }} </div>
            
            </div>


            <div style="margin-top: 20px;width: 100%;font-size: 12px;display: flex;flex-direction: column;" v-if="pageType==='sample'">
              <div class="content-box">{{ displayedText }}</div>
            </div>
            <div style="width: 100%;height:calc(100% - 40px);display: flex;flex-direction: column;overflow-y: auto;overflow-x: hidden;" class="sample_item" ref="messageContainer">
              <div style="font-size: 14px;letter-spacing: 1px;line-height: 24px;width: 100%" v-if="pageType==='sample'&&chatQuery.messages.length>0"  v-for="(item,index) in chatQuery.messages" :style="{padding:chatQuery.messages.length>0?'5px':'0px'}">
                <div v-if="index % 2 === 0" style="background-color: #409eff;border-radius: 10px;padding: 10px 15px;float: right;color:#fff;margin-top: 30px;margin-right: 5px;" >问 : {{ item.content }}</div>
                <MarkdownRenderer v-if="index % 2 !== 0" :markdown="item.content" type="answer"/>
                <!-- <div v-if="index % 2 === 0" style="background-color: #409eff;border-radius: 10px;padding: 10px 15px;float: right;color:#fff;margin-top: 30px;margin-right: 5px;" >问 : {{ item.content }}</div> -->
                <!-- <div v-if="index % 2 !== 0" style="background-color: #fff;padding: 15px 15px;border-radius: 10px;">答 : {{ item.content }}</div> -->
              </div>
            </div>


            
          </div>
          <div style="width: 100%;display: flex;justify-content: flex-end;align-items: center;border-radius: 10px;flex-direction: column;height: 182px;">
            <!-- <el-button type="primary" @click="startNewConversation" class="back_set">
              开启新对话
            </el-button> -->
            <div class="tran_select" v-if="pageType==='query'||pageType==='sample'" style="display: flex;flex-direction: row-reverse;margin-bottom: 10px;">
              <el-radio-group v-model="selectedMode" @change="changeMode(selectedMode)" :disabled="isSampleLoad">
                <el-radio label="通用模式">通用模式</el-radio>
                <el-radio label="人资专题">人资专题</el-radio>
              </el-radio-group> 
              <div style="padding-right: 10px;line-height: 32px;font-size: 14px;">模式选择 : </div>
            </div>
            <div class="textarea" v-if="pageType==='query'">
              <el-input
              v-model="newQuestion"
             :placeholder="pageType==='query'?'请输入您的问题,换行请按下Shift+Enter':pageType==='final'?'请输入您想总结的文本,换行请按下Shift+Enter':'请输入您想翻译的文本,换行请按下Shift+Enter'"
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
            <div class="textarea" v-if="pageType==='sample'">
              <el-input
              v-model="newQuestion"
              placeholder="请输入您的问题,换行请按下Shift+Enter"
              style="width:100%;"
              class="custom-input"
              clearable
              @keydown="samplePost"
              @keyup.shift.enter="handleShiftEnter"
              ref="textareaInputSample"
              type="textarea"
              :rows="dynamicRows"
              @input="adjustTextareaHeightSample"
            />
                <!-- 发送图标 -->
            <div
              class="send-icon"
              :class="{ 'hovered': isHovered }"
              @click="submitSample"

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

  <el-dialog
    v-model="commonVisible"
    title="评价"
    width="40%"
    :before-close="handleCommonClose"
  >
  <el-input
          v-model="commonQuestion"
          placeholder="请输入您的宝贵意见"
          style="width:100%;"
          class="custom-input"
          clearable
          type="textarea"
          rows="5"
      />
      <div class="button-item" style="display: flex;width: 100%;margin-top: 40px;flex-direction: row-reverse;margin-bottom: 20px;">
        <el-button  @click="commonVisible = false" style="width: 100px;height: 40px;margin-left: 15px;">取消</el-button>
        <el-button type="primary" @click="submitCommon" style="width: 100px;height: 40px;">提交</el-button>
      </div>
  </el-dialog>
</template>

<script>
// 10.180.16.102
import { ref,computed,onMounted,onUnmounted,reactive,nextTick } from 'vue';
import { postRequest } from '../../utils/request'; // 导入封装的 axios 方法
import { ElMessage,ElLoading,ElPopover, ElButton, ElDivider } from 'element-plus'; // 引入 ElMessage
import { useRouter } from 'vue-router';
import imageA from '../../../src/assets/arrow_gray.png';
import imageB from '../../../src/assets/arrow_blue.png';
import photo from '../../../src/assets/chat.deepseek.com_.png';
import { createSSEConnection } from '../../../src/utils/sse';
import MarkdownRenderer from './component/markdown.vue'; // 引入 Markdown 渲染组件
import { View, Lock,Delete } from '@element-plus/icons-vue'; // 引入需要的图标
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
    const activeIndex = ref('')
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
    const textareaInputTran = ref(null)
    const textareaInputSample = ref(null)
    const textareaInputFinal = ref(null)
    const queryIng = ref(false);
    const passwordVisible = ref(false);
    const selectedLan = ref('中文')
    const selectedMode = ref('通用模式')
    const pageType = ref('sample')
    const transData = ref('')
    const isSampleLoad = ref(false)
    const messageContainer = ref(null)
    const currentId = ref('')
    const sampleObj = ref({
      messages:[]
    })
    const charData = ref([
        {type: 'process', content: '开始处理请求...', sources: null},
        {type: 'process', content: '[Start] 开始对问题进行分类...', sources: null},
        {type: 'process', content: '[Start] 开始对问题进行优化...', sources: null},
        {type: 'process', content: '[End] 已完成问题优化', sources: null},
        {type: 'process', content: '[Start] 开始第 1 轮查询...', sources: null},
        {type: 'process', content: '[End] 完成资料库检索', sources: null},
        {type: 'process', content: '[Start] 开始总结答案...', sources: null},
        {type: 'process', content: '[End] 已完成总结答案', sources: null},
      ]) 
    const chatQuery = reactive({
      messages:[]
    })
    const finalData = ref({
      title:'',
      data:[]
    })
    const commonQuestion = ref('')
    const userInfo = ref({
      userid:'',
    })
    const removeItemById = (arr, id) => {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].id === id) {
          arr.splice(i, 1);
          break; // 找到后立即退出循环
        }
      }
      return arr;
    }
    const removeItemByName = (arr, val) => {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
          arr.splice(i, 1);
          break; // 找到后立即退出循环
        }
      }
      return arr;
    }

    const changeMode = (val) => {
      currentQuestion.value = false
      activeIndex.value = ''
      newQuestion.value = ''
      dynamicRows.value = 1
      pageType.value = selectedMode.value==='通用模式'?'sample':'query'
    }
    // 删除数据
    const deleteData = async (id,val) => {
      try {
        // 替换为实际的后端接口地址
        const response = await fetch('http://10.180.16.102:8080/Message/deleteMessageById?id='+id, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          // body: JSON.stringify(query),

        })
        const res = await response.json();
        if(res.status){
          ElMessage.success('删除成功！');
          const aryId= JSON.parse(JSON.stringify(answerList.value))
          const aryName= JSON.parse(JSON.stringify(questions.value))
          answerList.value = removeItemById(aryId, id);
          questions.value = removeItemByName(aryName, val);
          chatQuery.messages = []
          activeIndex.value = ''
          currentQuestion.value = false
        }

      } catch (error) {
          // loadingInstance.close();
          console.error('获取回复失败:', error);
          // botMessage.text = '抱歉，暂时无法获取回复';
        
      }
    }
    

    // 点击确定删除
    const handleConfirmDelete = (val) => {
      if(selectedMode.value==='通用模式'){
        if(isSampleLoad.value){
          ElMessage.warning('有问题正在回答中，请稍后再删除');
          return
        }

      }
      let id = ''
      const queryLimit = []
      const anList = JSON.parse(JSON.stringify(answerList.value))
      for(var i=0;i<anList.length;i++){
        if(anList[i].type==='人资专题'){
          queryLimit.push(anList[i].data.question)
          if(anList[i].data.question===val){
            id = anList[i].id
          }
        }else {
          if(anList[i].title===val){
            id = anList[i].id
          }
        }

      }
      if(selectedMode.value==='人资专题'&&!queryLimit.includes(val)){
        ElMessage.warning('此问题正在回答中，请稍后再删除');
        return
      }
      deleteData(id,val)
    };

    // 点击取消
    const handleCancel = () => {
      // ElMessage.info('已取消删除');
    };
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

    const dots = ref('.'); // 初始点号
    let interval;

    // 点号变化逻辑
    const updateDots = () => {
      if (dots.value.length >= 5) {
        dots.value = '.'; // 重置为一个点
      } else {
        dots.value += '.'; // 增加一个点
      }
    };

    const toDoc = async (data) => {
      const query = {
        fileName:data.document_title
      }
      try {
        // 替换为实际的后端接口地址
        const response = await fetch('http://10.180.16.102:8080/Files/getFileInfoByName', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(query),

        })
        const res = await response.json();
        if(res.status){
          if(res.data && res.data.fileLink){
            window.open(res.data.fileLink, '_blank');
          }

        }

      } catch (error) {
          // loadingInstance.close();
          console.error('获取回复失败:', error);
          // botMessage.text = '抱歉，暂时无法获取回复';
        
      }
      
    }
    const togglePasswordVisibility = () => {
      passwordVisible.value = !passwordVisible.value;
    };
    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value;
    };
    const showPopup = ref(false);
    const dialogVisible = ref(false)
    const commonVisible = ref(false)
    const avatarUrl = ref(photo); // 替换为你的头像URL
    const answerList = ref([])
    const handleClose = (done) => {
      // 这里可以添加一些关闭前的逻辑
      done();
    };
    const handleCommonClose = (done) => {
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
        const response = await fetch('http://10.180.16.102:8080/UserInfo/login', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)

        })
        const res = await response.json();
        if(res.data && res.data.clientStatus==='PASS'){
          ElMessage.success('登录成功');
          showPopup.value = false
          activeIndex.value = ''
          isLogin.value = true
          localStorage.setItem('userInfo',JSON.stringify(data))
          userInfo.value.userid = data.userid
          getHistory()
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
      questions.value = []
      answerList.value = []
      chatQuery.messages = []
      currentId.value = ''
      currentAnswer.value = false
      currentQuestion.value = false
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
        name:'我进入立讯技术后如何选择导师'
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
        name:'中国的传统节日'
      },
      {
        index:2,
        name:'国务院发布的法定节假日安排'
      },
      {
        index:3,
        name:'如何锻炼腹肌'
      },
      {
        index:4,
        name:'工作压力大如何缓解压力'
      },
      {
        index:5,
        name:'东莞的旅游景点'
      },
    ]
  )

  
  const adjustTextareaHeightFinal = () => {
    const textarea = textareaInputFinal.value?.textarea; // 获取 textarea 元素
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

  
  const adjustTextareaHeightSample = () => {
    const textarea = textareaInputSample.value?.textarea; // 获取 textarea 元素
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

  const adjustTextareaHeightTran = () => {
    const textarea = textareaInputTran.value?.textarea; // 获取 textarea 元素
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
      activeIndex.value = ''
      chatQuery.messages = []
      currentId.value = ''
      pageType.value = 'sample'
      selectedMode.value = '通用模式'
    };

    const queryAn = (val) => {
      currentQuestion.value = val
      const queryList = questions.value
      const anList =  JSON.parse(JSON.stringify(answerList.value))
      const queryLimit = []
      const querySample = []

      for(var i=0;i<queryList.length;i++){
        if(queryList[i]===val){    
          tipQuery.value = val
        }
      }
      for(var j=0;j<anList.length;j++){
        if(anList[j].type==='人资专题'){
          queryLimit.push(anList[j].title)
          if(val==anList[j].title){
            currentId.value = anList[j].id
            pageType.value = 'query'
            selectedMode.value = '人资专题'
            currentObj.value.messages = anList[j].data.answer
          } 
        } else {
          querySample.push(anList[j].title)
          if(val==anList[j].title){
            pageType.value = 'sample'
            selectedMode.value = '通用模式'
            chatQuery.messages = anList[j].data
            currentId.value = anList[j].id
          } 
          // const hasIdOne = anList.some(item => item.title === val);
          // if(!hasIdOne){
          //   currentId.value = ''
          // }
        }

      }  
      console.log(currentId.value)
      if(pageType.value === 'query'&&!queryLimit.includes(val)){
        currentObj.value.messages = {}
      }
      if(pageType.value === 'sample'&&!querySample.includes(val)){
        chatQuery.messages = []
      }


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
  const sampleData = ref([])

  // 当前正在显示的消息索引
  const currentMessageIndex = ref(0);
  const sampleMessageIndex = ref(0)


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

   //  const changeData = () => {
    //   isHistory.value = !isHistory.value
   //  }

    
    const changeType = (val) => {
      activeIndex.value = ''
      finalData.value = {
        title:'',
        data:[]
      }
      transData.value = ''
      pageType.value = val
    }
    const finalIng = ref(false)
    const finalPost = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // 阻止默认的换行行为
        submitFinal();
      }
    }
    
    const submitFinal = async (val) => {
      if(!isLogin.value){
        ElMessage.warning('请先登录再使用');
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
      changeImage(imageA)
      dynamicRows.value = 1
      const data = {
        user_id:userInfo.value.userid,
        question:newQuestion.value,
      }
      newQuestion.value = ''
      finalData.value = {
        title:'',
        data:[]
      }
      finalIng.value = true
      interval = setInterval(updateDots, 500); // 每 500ms 更新一次
      try {
        // 替换为实际的后端接口地址
        const response = await fetch('http://10.180.16.102:8080/AI/summarize', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),

        })
        const res = await response.json();
        finalIng.value = false
        clearInterval(interval);
        if(res.status){
          finalData.value.title = res.data.summary
          if(res.data.key_points){
            finalData.value.data = res.data.key_points
          }
        }

      } catch (error) {
          finalIng.value = false
          clearInterval(interval);
          // loadingInstance.close();
          console.error('获取回复失败:', error);
          // botMessage.text = '抱歉，暂时无法获取回复';
        
      }
    }
    
    const samplePost = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // 阻止默认的换行行为
        submitSample();
      }
    }

    const tranPost = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // 阻止默认的换行行为
        submitTran();
      }
    }

    const displayedText = ref(''); // 当前显示的内容
    let currentItemIndex = 0; // 当前显示的数据索引
    let currentCharIndex = 0; // 当前显示的字符索引
    // 逐字显示函数
    const showText = () => {
      if (currentItemIndex < charData.value.length) {
        const currentItem = charData.value[currentItemIndex];
        if (currentCharIndex < currentItem.content.length) {
          displayedText.value += currentItem.content[currentCharIndex]; // 逐字添加到显示内容
          currentCharIndex++;
          setTimeout(showText, 30); // 每个字间隔 100ms
        } else {
          if (currentItemIndex < charData.value.length - 1) {
            // 如果不是最后一条，清空内容并显示下一条
            setTimeout(() => {
              displayedText.value = ''; // 清空内容
              currentCharIndex = 0; // 重置字符索引
              currentItemIndex++; // 切换到下一条数据
              showText(); // 继续显示下一条
            }, 100); // 显示完一条后，等待 1 秒再清空并显示下一条
          } else {
            // 如果是最后一条，保留内容
            console.log('所有内容显示完毕');
          }
        }
      }
      };
   const isDisabled = ref(false);
   const upCommon = async () => {
      if (isDisabled.value) return; // 如果按钮已禁用，直接返回
      let id = ''
      if(currentId.value){
        id = currentId.value
      } else{
        for(var i=0;i<answerList.value.length;i++){
          if(limitQuery.value === answerList.value[i].title){
            id = answerList.value[i].id
          }
        }
      }
      isDisabled.value = true;
      const data = {
        id:id,
        feedback:{
          agree:true,
          content:''
        }
      }
      // 2 秒后重新启用按钮
      setTimeout(() => {
        isDisabled.value = false;
      }, 3000);
      try {
        // 替换为实际的后端接口地址
        const response = await fetch('http://10.180.16.102:8080/Message/feedback', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),

        })
        const res = await response.json();
        if(res.status){
          ElMessage.success('评价成功,我们会继续努力');
          
        }

      } catch (error) {
          // loadingInstance.close();
          // ElMessage.error('评价成功,我们会继续努力');
          console.error('获取回复失败:', error);
          // botMessage.text = '抱歉，暂时无法获取回复';
        
      }


    }
    const downCommon = () => {
      commonVisible.value = true

    }
    const submitCommon = async () => {
      let id = ''
      if(currentId.value){
        id = currentId.value
      } else{
        for(var i=0;i<answerList.value.length;i++){
          if(limitQuery.value === answerList.value[i].title){
            id = answerList.value[i].id
          }
        }
      }

      const data = {
        id:id,
        feedback:{
          agree:false,
          content:commonQuestion.value
        }
      }

      try {
        // 替换为实际的后端接口地址
        const response = await fetch('http://10.180.16.102:8080/Message/feedback', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),

        })
        const res = await response.json();
        if(res.status){

          ElMessage.success('评价成功,我们会继续努力');
          commonVisible.value = false
          commonQuestion.value = ''
        }

      } catch (error) {
        commonVisible.value = false
        commonQuestion.value = ''
          // loadingInstance.close();
          // ElMessage.error('评价成功,我们会继续努力');
          console.error('获取回复失败:', error);
          // botMessage.text = '抱歉，暂时无法获取回复';
        
      }

      
    }
    
    // 使用 map 方法
    // const updateOddIndexIdsInPlace = (array) => {
    //   array.forEach((item, index) => {
    //     if (index % 2 !== 0) {
    //       item.role = 'user'; // 直接修改原数组中的对象
    //     }
    //   });
    //   return array
    // };
    
    const submitSample = async (val) => {
      if(!isLogin.value){
        ElMessage.warning('请先登录再使用');
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
      dynamicRows.value = 1
      sampleMessageIndex.value = 0
      isSampleLoad.value = true
      displayedText.value = ''; // 当前显示的内容
      currentItemIndex = 0; // 当前显示的数据索引
      currentCharIndex = 0; // 当前显示的字符索引
      showText(); // 开始显示数据
      
      const currentData = {
        role:'user',
        content:newQuestion.value
      }
      let mes = {
        messages:[]
      }
      mes = JSON.parse(JSON.stringify(chatQuery))
      mes.messages.push(currentData)
      const params = JSON.parse(JSON.stringify(mes))
      for(var j=0;j<params.messages.length;j++){
        if (j % 2 === 0) {
          params.messages[j].role = 'user'; 
        } else{
          params.messages[j].role = 'assistant'; 
        }
      }
      const queryValue = newQuestion.value
      tipQuery.value = queryValue
      newQuestion.value = ''
      const anList =  JSON.parse(JSON.stringify(answerList.value))
      const hasId = anList.some(item => item.id === currentId.value);
      if(!hasId){
        questions.value.unshift(queryValue)
        activeIndex.value = '0'
      }
      try {
        // 替换为实际的后端接口地址
        const response = await fetch('http://10.180.16.102:8080/AI/chat', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),

        })
        const res = await response.json();
        isSampleLoad.value = false
        if(res.status){
          const newMessage = { ...res.data.message }; //
          mes.messages.push(newMessage)
          chatQuery.messages = mes.messages
          nextTick(() => {
      // 滚动到底部
          if (messageContainer.value) {
            messageContainer.value.scrollTop = messageContainer.value.scrollHeight
          }
        })
          postSample()
        }

      } catch (error) {
          isSampleLoad.value = false
          // loadingInstance.close();
          console.error('获取回复失败:', error);
          // botMessage.text = '抱歉，暂时无法获取回复';
        
      }
      
    }
    
    const submitTran = async (val) => {
      if(!isLogin.value){
        ElMessage.warning('请先登录再使用');
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

      changeImage(imageA)
      dynamicRows.value = 1
      const data = {
        user_id:userInfo.value.userid,
        source_text:newQuestion.value,
        target_language:selectedLan.value
      }
      finalIng.value = true
      interval = setInterval(updateDots, 500); // 每 500ms 更新一次
      newQuestion.value = ''
      try {
        // 替换为实际的后端接口地址
        const response = await fetch('http://10.180.16.102:8080/AI/translate', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),

        })
        const res = await response.json();
        finalIng.value = false
        clearInterval(interval);
        if(res.status){
          transData.value = res.data
        }

      } catch (error) {
          finalIng.value = false
          clearInterval(interval);
          // loadingInstance.close();
          console.error('获取回复失败:', error);
          // botMessage.text = '抱歉，暂时无法获取回复';
        
      }
    }
    const summitPost = (event) => {

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // 阻止默认的换行行为
        submitQuestion();
      }
    }
    const limitQuery = ref('')
    const submitQuestion = async (val) => {
      if(queryIng.value){
        return
      }
      if(!isLogin.value){
        ElMessage.warning('请先登录再使用');
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
      limitQuery.value = newQuestion.value
      console.log(limitQuery.value)
      changeImage(imageA)
      dynamicRows.value = 1
      currentMessageIndex.value = 0
      currentObj.value.messages = {}
      currentObj.value.messageList = []
      displayedMessages.value = []
      const queryValue = newQuestion.value
      tipQuery.value = queryValue
      newQuestion.value = ''
      queryIng.value = true
      isSampleLoad.value = true
      if(questions.value.includes(queryValue)){
        queryIng.value = false
        for(var i=0;i<questions.value.length;i++){
          if(queryValue===questions.value[i]){
            activeIndex.value = i
          }
        }
        queryAn(queryValue)
        return
      }
      if(!questions.value.includes(queryValue)){
        
        questions.value.unshift(queryValue)
        activeIndex.value = '0'
      }
      try {
        // 替换为实际的后端接口地址
        const res = await fetch('http://10.180.16.102:8080/AI/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: queryValue,
            user_id: userInfo.value.userid,
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

            // 清理数据
            buffer = buffer.replace(/data:\s*/g, '');

            // 尝试按分隔符分割数据
            const jsonStr = buffer.split('\n\n');
            
            // 如果最后一个部分不完整，保留在缓冲区中
            buffer = jsonStr.pop() || '';

            // const jsonStr = buffer.replace(/data:\s*/g, '');
            // const jsonStrArr =jsonStr.split("\n\n").filter(item => item.length!=0)

            jsonStr.forEach(element => {
              const type = JSON.parse(element).type
              if(type==='final_answer'){
                queryIng.value = false
                isSampleLoad.value = false
                // loadingInstance.close();
                currentObj.value.messages = JSON.parse(element)
                currentObj.value.messages.isHistory = true
                postQuestion(JSON.parse(element),queryValue)
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
          isSampleLoad.value = false
          queryIng.value = false
          // loadingInstance.close();
          console.error('获取回复失败:', error);
          // botMessage.text = '抱歉，暂时无法获取回复';
        }
    };

    const postSample = async () => {
      let id = ''
      if(chatQuery.messages.length>2){
        id = currentId.value
      }
      console.log(currentId.value)
      const data = {
        userId:userInfo.value.userid,
        type:'通用模式',
        id:id,
        data:chatQuery.messages,
        title:chatQuery.messages[0].content
      }

      try {
        // 替换为实际的后端接口地址
        const response = await fetch('http://10.180.16.102:8080/Message/save', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),

        })
        const res = await response.json();
        if(res.status){
          currentId.value = res.data
          getHistory()
        }

      } catch (error) {
          // loadingInstance.close();
          console.error('获取回复失败:', error);
          // botMessage.text = '抱歉，暂时无法获取回复';
        
      }
    };

    const postQuestion = async (obj,val) => {
      const data = {
        userId:userInfo.value.userid,
        type:'人资专题',
        title:val,
        id:'',
        data:{
          question:val,
          answer:obj,
        }
      }
      try {
        // 替换为实际的后端接口地址
        const response = await fetch('http://10.180.16.102:8080/Message/save', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),

        })
        const res = await response.json();
        if(res.status){
          getHistory()
        }

      } catch (error) {
          // loadingInstance.close();
          console.error('获取回复失败:', error);
          // botMessage.text = '抱歉，暂时无法获取回复';
        
      }
    }
    // 10.180.16.102
    // 
    const getHistory = async () => {
      try {
        // 替换为实际的后端接口地址
        const response = await fetch('http://10.180.16.102:8080/Message/getMessageByUserId', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userInfo.value.userid
          }),

        })
        const res = await response.json();
        if(res.status){
          answerList.value = res.data
          if(res.data&&res.data.length>0){
            for(var i=0;i<res.data.length;i++){
              if(res.data[i].type==='人资专题'){
                questions.value.push(res.data[i].data.question)
              } else{
                questions.value.push(res.data[i].title)
              }
              
            }
            questions.value = questions.value.reduce((acc, current) => {
              if (!acc.find(item => item === current)) {
                acc.push(current);
              }
              return acc;
            }, []);
          }
          for(var j=0;j<answerList.value.length;j++){
            if(res.data[j].type==='人资专题'){
              answerList.value[j].data.answer.isHistory = true
            } else{
              answerList.value[j].data.isHistory = true
            }
            
          }

        }
      } catch (error) {
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
        getHistory()
      }else{
        dialogVisible.value = true
      }
    });
    const handleSelect = (index) => {
      activeIndex.value = index;
    };
        // 组件卸载时关闭 SSE 连接
    // 组件卸载时关闭 SSE 连接
    onUnmounted(() => {
      if(interval){
        clearInterval(interval)
      }
      
    });

    return {
      activeIndex,
      handleSelect,
      isCollapsed,
      questions,
      newQuestion,
      tipQuery,
      currentQuestion,
      currentImage,
      imageA,
      imageB,
      changeImage,
      toDoc,
      queryAn,
      currentAnswer,
      toggleCollapse,
      submitForm,
      submitCommon,
      startNewConversation,
      commonQuestion,
      handleShiftEnter,
      submitQuestion,
      summitPost,
      currentData,
      dynamicRows,
      textareaInput,
      textareaInputs,
      textareaInputTran,
      textareaInputFinal,
      textareaInputSample,
      adjustTextareaHeights,
      adjustTextareaHeight,
      adjustTextareaHeightTran,
      adjustTextareaHeightFinal,
      adjustTextareaHeightSample,
      tranPost,
      samplePost,
      finalPost,
      submitTran,
      submitFinal,
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
      sampleMessageIndex,
      displayMessagesSequentially,
      currentMessage,
      queryIng,
      isLogin,
      dialogVisible,
      commonVisible,
      handleClose,
      handleCommonClose,
      loginForm,
      togglePasswordVisibility,
      passwordVisible,
      View, // 注册图标组件
      Lock, // 注册图标组件
      // changeData,
      pageType,
      changeType,
      finalData,
      transData,
      dots,
      updateDots,
      finalIng,
      selectedLan,
      selectedMode,
      changeMode,
      handleConfirmDelete,
      Delete,
      handleCancel,
      charData,
      sampleObj,
      sampleData,  
      displayedText,
      showText,
      postSample,
      chatQuery,
      submitSample,
      isSampleLoad,
      messageContainer,
      limitQuery,
      upCommon,
      isDisabled,
      downCommon
    };
  },
};
</script>

<style lang="less">

.el-aside{
  overflow-x: hidden;
}


.sample_item::-webkit-scrollbar {
  width: 1px; /* 滚动条宽度 */
}

.sample_item::-webkit-scrollbar-track {
  background: #f1f1f1; /* 轨道背景颜色 */
  border-radius: 0px; /* 轨道圆角 */
}

.sample_item::-webkit-scrollbar-thumb {
  background: #888; /* 滑块颜色 */
  border-radius: 0px; /* 滑块圆角 */
  border: 1px solid #f1f1f1; /* 滑块边框 */
}

.sample_item::-webkit-scrollbar-thumb:hover {
  background: #555; /* 滑块悬停时的颜色 */
}


/* WebKit 浏览器滚动条样式 */
.main_content::-webkit-scrollbar {
  width: 1px; /* 滚动条宽度 */
}

.main_content::-webkit-scrollbar-track {
  background: #f1f1f1; /* 轨道背景颜色 */
  border-radius: 0px; /* 轨道圆角 */
}

.main_content::-webkit-scrollbar-thumb {
  background: #888; /* 滑块颜色 */
  border-radius: 0px; /* 滑块圆角 */
  border: 1px solid #f1f1f1; /* 滑块边框 */
}

.main_content::-webkit-scrollbar-thumb:hover {
  background: #555; /* 滑块悬停时的颜色 */
}

.el-menu{
  max-height: 620px;
  overflow-y: auto;
}
/* WebKit 浏览器滚动条样式 */
.el-menu::-webkit-scrollbar {
  width: 1px; /* 滚动条宽度 */
}

.el-menu::-webkit-scrollbar-track {
  background: #f1f1f1; /* 轨道背景颜色 */
  border-radius: 0px; /* 轨道圆角 */
}

.el-menu::-webkit-scrollbar-thumb {
  background: #888; /* 滑块颜色 */
  border-radius: 0px; /* 滑块圆角 */
  border: 1px solid #f1f1f1; /* 滑块边框 */
}

.el-menu::-webkit-scrollbar-thumb:hover {
  background: #555; /* 滑块悬停时的颜色 */
}

.custom-tooltip {
  max-width: 500px !important;
}
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
  padding: 0 25px 0 15px !important;
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
/* WebKit 浏览器滚动条样式 */
.el-textarea__inner::-webkit-scrollbar {
  width: 1px; /* 滚动条宽度 */
  opacity: 0;
}

.el-textarea__inner::-webkit-scrollbar-track {
  background: rgba(135, 206, 235, 0); /* 轨道背景颜色 */
  border-radius: 16px; /* 轨道圆角 */
  opacity: 0;
}

.el-textarea__inner::-webkit-scrollbar-thumb {
  background: rgba(135, 206, 235, 0); /* 滑块颜色 */
  border-radius: 0px; /* 滑块圆角 */
  border: 1px solid #f1f1f1; /* 滑块边框 */
  opacity: 0;
}

.el-textarea__inner::-webkit-scrollbar-thumb:hover {
  background: rgba(135, 206, 235, 0); /* 滑块悬停时的颜色 */
  opacity: 0;
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
            max-width: 180px;
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
  width: 220px;
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
  right: 8px;
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
  background-size: 12px 12px;
  background-position: 15px 9px;
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