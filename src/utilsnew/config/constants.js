/**
 * 应用常量配置
 * 用于消除代码中的硬编码问题
 */

// HTTP 配置
export const HTTP_CONFIG = {
  TIMEOUT: 180000, // 3分钟超时
  RETRY_COUNT: 3,
  STATUS_CODES: {
    SUCCESS: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_ERROR: 500
  }
}

// Excel 配置
export const EXCEL_CONFIG = {
  MAX_ROWS: 10,
  SUPPORTED_FORMATS: ['.xlsx', '.xls', '.csv'],
  PREVIEW_ROWS: 5,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SHEET_OPTIONS: {
    TYPE: 'array',
    DENSE: true,
    HEADER: 1,
    DEFAULT_VALUE: ''
  }
}

// 文件上传配置
export const FILE_CONFIG = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks
  ALLOWED_TYPES: {
    DOCUMENT: ['.pdf', '.doc', '.docx', '.txt'],
    SPREADSHEET: ['.xlsx', '.xls', '.csv'],
    PRESENTATION: ['.ppt', '.pptx'],
    IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    ARCHIVE: ['.zip', '.rar', '.7z']
  },
  UPLOAD_TIMEOUT: 60000 // 1分钟
}

// 网络配置
export const NETWORK_CONFIG = {
  CHECK_INTERVAL: 30000, // 30秒检查一次
  PING_TIMEOUT: 5000,
  INTERNAL_NETWORK_PATTERNS: [
    /^192\.168\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /internal/,
    /local/
  ]
}

// 消息配置
export const MESSAGE_CONFIG = {
  MAX_HISTORY: 50,
  AUTO_SAVE_INTERVAL: 10000, // 10秒自动保存
  TYPING_INDICATOR_DELAY: 500,
  MESSAGE_TIMEOUT: 30000
}

// 模式映射
export const MODE_MAPPING = new Map([
  ['通用模式', 'sample'],
  ['人资行政专题', 'query'],
  ['IT专题', 'it'],
  ['法务专题', 'law'],
  ['董办专题', 'board'],
  ['翻译', 'translation'],
  ['智能体', 'intel'],
  ['总结', 'final']
])

// 翻译配置
export const TRANSLATION_CONFIG = {
  SUPPORTED_LANGUAGES: [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' },
    { code: 'ru', name: 'Русский' }
  ],
  DEFAULT_LANGUAGE: 'zh',
  BATCH_SIZE: 10
}

// 智能体配置
export const INTEL_CONFIG = {
  MAX_AGENTS: 20,
  DEFAULT_AGENT: {
    name: '默认智能体',
    role: 'assistant',
    tone: 'friendly',
    description: '通用助手智能体'
  },
  ROLES: [
    { value: 'assistant', label: '助手' },
    { value: 'teacher', label: '老师' },
    { value: 'consultant', label: '顾问' },
    { value: 'analyst', label: '分析师' },
    { value: 'developer', label: '开发者' }
  ],
  TONES: [
    { value: 'friendly', label: '友好的' },
    { value: 'professional', label: '专业的' },
    { value: 'casual', label: '随和的' },
    { value: 'formal', label: '正式的' },
    { value: 'humorous', label: '幽默的' }
  ]
}

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  IS_NETWORK: 'isNet',
  CHAT_HISTORY: 'chatHistory',
  USER_PREFERENCES: 'userPreferences',
  LAST_MODE: 'lastMode',
  THEME: 'theme'
}

// 动画配置
export const ANIMATION_CONFIG = {
  DURATION: {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 500
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out'
  }
}

// 错误信息
export const ERROR_MESSAGES = {
  NETWORK: {
    OFFLINE: '网络连接已断开，请检查网络设置',
    TIMEOUT: '请求超时，请稍后重试',
    SERVER_ERROR: '服务器错误，请稍后重试',
    TOO_MANY_REQUESTS: '请求过于频繁，请稍后再试'
  },
  FILE: {
    SIZE_EXCEEDED: '文件大小超出限制',
    TYPE_NOT_SUPPORTED: '不支持的文件类型',
    UPLOAD_FAILED: '文件上传失败',
    PROCESSING_FAILED: '文件处理失败'
  },
  AUTH: {
    LOGIN_REQUIRED: '请先登录再使用',
    TOKEN_EXPIRED: '登录已过期，请重新登录',
    PERMISSION_DENIED: '权限不足'
  },
  VALIDATION: {
    REQUIRED: '此字段为必填项',
    INVALID_FORMAT: '格式不正确',
    TOO_SHORT: '内容过短',
    TOO_LONG: '内容过长'
  }
} 