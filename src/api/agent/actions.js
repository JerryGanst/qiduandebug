/**
 * 抽取接口调用方法
 */
import request from '@/utils/request.js'

const API = Object.freeze({
  // 获取当前用户下的智能体
  GET_AGENT_LIST_BY_USER_ID: '/Agent/findAgentByUserId?userId=',
  // 保存智能体
  SAVE_AGENT: '/Agent/saveAgent',
  // 获取智能体描述内容
  GET_AGENT_CONTENT: '/Agent/generateAgentDescription',
  // 删除智能体
  REMOVE_AGENT: '/Agent/deleteAgentById?agentId=',
  // 根据图片文件的对象名获得预览链接
  GET_AGENT_IMAGE_BY_OBJ: '/Agent/getPicUrl?objectName=',
  // 编辑智能体（根据智能体ID查询智能体详情）
  GET_AGENT_BY_AGENT_ID: '/Agent/findAgentById?agentId=',
  // 根据智能体ID获取智能体聊天记录
  GET_AGENT_CHAT_BY_AGENT_ID: '/Agent/findAgentChatByAgentId?agentId=',
  // 保存智能体对话
  SAVE_AGENT_CHAT: '/Agent/saveAgentChat',
  // 根据id删除聊天记录
  REMOVE_AGENT_CHAT_BY_ID: '/Agent/deleteAgentChatById?agentChatId=',
  // 根据聊天记录ID获取聊天记录
  GET_AGENT_CHAT_BY_CHAT_ID: '/Agent/findAgentChatByChatId?chatId=',
  // 修改智能体标题
  CHANGE_AGENT_CHAT_TITLE: '/Agent/updateAgentChatTitle?agentChatId='
});

export const getAgentListByUserId = (userId) => request.post(API.GET_AGENT_LIST_BY_USER_ID + userId, {})

export const saveAgent = (agentItem) => request.post(API.SAVE_AGENT, agentItem)

export const getAgentContent = (agentItem) => request.post(API.GET_AGENT_CONTENT, agentItem)

export const removeAgentById = (agentId) => request.post(API.REMOVE_AGENT + agentId, {})

export const getAgentImgByObj = (objectName) => request.post(API.GET_AGENT_IMAGE_BY_OBJ + objectName, {})

export const getAgentDetailById = (agentId) => request.post(API.GET_AGENT_BY_AGENT_ID + agentId, {})

export const getAgentChatByAgentId = (agentId, keyword) => request.post(API.GET_AGENT_CHAT_BY_AGENT_ID + agentId + '&keyword=' + (keyword || ''), {})

export const saveAgentChat = (agentChats) => request.post(API.SAVE_AGENT_CHAT, agentChats)

export const removeAgentChatById = (chatId, userId) => request.post(API.REMOVE_AGENT_CHAT_BY_ID + chatId + '&userId=' + (userId || ''), {  })

export const getAgentChatByChatId = (chatId) => request.post(API.GET_AGENT_CHAT_BY_CHAT_ID + chatId , {  })

export const changeAgentChatTitle = (agentChatId, title) => request.post(API.CHANGE_AGENT_CHAT_TITLE + agentChatId + '&title=' + (title || ''), {  })
