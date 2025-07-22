/**
 * 全局常量配置
 */

// 文件相关配置
export const FILE_CONFIG = {
  MAX_SIZE_MB: 50,
  MAX_SIZE_BYTES: 50 * 1024 * 1024,
  ALLOWED_EXTENSIONS: ['.doc', '.docx', '.txt', '.pdf', '.pptx', '.ppt', '.xls', '.xlsx'],
  UPLOAD_DELAY: 300,
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks
  PREVIEW_CHUNK_SIZE: 10 * 1024 * 1024 // 10MB for preview
}

// UI相关配置
export const UI_CONFIG = {
  ANIMATION_INTERVAL: 500,
  DEBOUNCE_DELAY: 100,
  THROTTLE_DELAY: 300,
  BUTTON_DISABLE_DURATION: 3000,
  PAGE_SIZES: [30, 50, 100],
  DEFAULT_PAGE_SIZE: 100,
  SCROLL_BEHAVIOR: 'smooth'
}

// 文本框配置
export const TEXTAREA_CONFIG = {
  MIN_ROWS: 1,
  MAX_ROWS: 10,
  MAX_LENGTH: 4096,
  PLACEHOLDER: '请输入您的问题,换行请按下Shift+Enter'
}

// 消息配置
export const MESSAGE_CONFIG = {
  LOADING_TEXT: '正在为您解答,请稍等',
  ERROR_DURATION: 3000,
  SUCCESS_DURATION: 2000,
  WARNING_DURATION: 2000
}

// 网络配置
export const NETWORK_CONFIG = {
  CHECK_INTERVAL: 5000, // 5秒
  TIMEOUT: 30000, // 30秒
  RETRY_TIMES: 3,
  RETRY_DELAY: 1000
}

// 聊天模式映射
export const CHAT_MODE_MAP = {
  '人资行政专题': { pageType: 'query', key: 'HR' },
  'IT专题': { pageType: 'it', key: 'IT' },
  '法务专题': { pageType: 'law', key: 'Law' },
  '通用模式': { pageType: 'sample', key: 'General' },
  '翻译': { pageType: 'tran', key: 'Translation' },
  '总结': { pageType: 'final', key: 'Summary' }
}

// 文件图标映射
export const FILE_ICON_MAP = {
  txt: 'text',
  pdf: 'pdf',
  ppt: 'ppt',
  pptx: 'ppt',
  xls: 'excel',
  xlsx: 'excel',
  doc: 'word',
  docx: 'word',
  default: 'word'
}

// 存储键名
export const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  POWER_LIST: 'powerList',
  ENABLE_LAW: 'enableLaw',
  ENABLE_BOARD_OFFICE: 'enableBoardOffice',
  IS_NET: 'isNet',
  COUNT: 'count'
} 