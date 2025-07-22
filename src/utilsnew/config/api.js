/**
 * API 配置文件
 * 定义所有API端点和配置
 */

// API 端点配置
export const API_ENDPOINTS = {
  // 用户相关
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout', 
    REFRESH: '/auth/refresh',
    USER_INFO: '/UserInfo/getUserIP',
    USER_PROFILE: '/user/profile'
  },
  
  // 聊天相关
  CHAT: {
    QUERY: '/AI/query',
    HISTORY: '/chat/history',
    SAVE: '/chat/save',
    DELETE: '/chat/delete',
    CLEAR: '/chat/clear'
  },
  
  // 文件相关
  FILE: {
    UPLOAD: '/file/upload',
    DOWNLOAD: '/file/download',
    DELETE: '/file/delete',
    PREVIEW: '/file/preview',
    PROCESS: '/file/process'
  },
  
  // 翻译相关
  TRANSLATION: {
    TRANSLATE: '/translation/translate',
    DETECT: '/translation/detect',
    LANGUAGES: '/translation/languages'
  },
  
  // 智能体相关
  INTEL: {
    LIST: '/intel/list',
    CREATE: '/intel/create',
    UPDATE: '/intel/update',
    DELETE: '/intel/delete',
    CHAT: '/intel/chat'
  },
  
  // 系统相关
  SYSTEM: {
    HEALTH: '/system/health',
    CONFIG: '/system/config',
    LOGS: '/system/logs'
  }
}

// 请求配置
export const REQUEST_CONFIG = {
  // 默认请求头
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // 文件上传请求头
  UPLOAD_HEADERS: {
    'Content-Type': 'multipart/form-data'
  },
  
  // 流式请求头
  STREAM_HEADERS: {
    'Accept': 'text/event-stream',
    'Cache-Control': 'no-cache'
  },
  
  // 超时配置
  TIMEOUTS: {
    DEFAULT: 30000,     // 30秒
    UPLOAD: 300000,     // 5分钟
    DOWNLOAD: 600000,   // 10分钟
    STREAM: 0           // 不超时
  },
  
  // 重试配置
  RETRY: {
    COUNT: 3,
    DELAY: 1000,
    BACKOFF: 2
  }
}

// 响应处理配置
export const RESPONSE_CONFIG = {
  // 成功状态码
  SUCCESS_CODES: [200, 201, 204],
  
  // 需要重试的状态码
  RETRY_CODES: [408, 429, 500, 502, 503, 504],
  
  // 不需要错误提示的状态码
  SILENT_CODES: [401],
  
  // 数据转换配置
  TRANSFORM: {
    REQUEST: true,
    RESPONSE: true
  }
}

// 缓存配置
export const CACHE_CONFIG = {
  // 缓存键前缀
  PREFIX: 'luxshare_ai_',
  
  // 缓存时间（毫秒）
  TTL: {
    SHORT: 5 * 60 * 1000,      // 5分钟
    MEDIUM: 30 * 60 * 1000,    // 30分钟
    LONG: 24 * 60 * 60 * 1000  // 24小时
  },
  
  // 需要缓存的API
  CACHEABLE_APIS: [
    API_ENDPOINTS.AUTH.USER_INFO,
    API_ENDPOINTS.TRANSLATION.LANGUAGES,
    API_ENDPOINTS.SYSTEM.CONFIG
  ]
}

// 模拟数据配置（开发环境）
export const MOCK_CONFIG = {
  ENABLED: import.meta.env.MODE === 'development',
  DELAY: 1000, // 模拟网络延迟
  
  // 模拟响应
  RESPONSES: {
    [API_ENDPOINTS.AUTH.USER_INFO]: {
      status: true,
      data: {
        id: '1',
        name: '测试用户',
        department: 'IT部',
        url: 'https://example.com/avatar.jpg'
      }
    }
  }
}

// WebSocket 配置
export const WEBSOCKET_CONFIG = {
  URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
  RECONNECT: {
    MAX_ATTEMPTS: 5,
    DELAY: 3000,
    BACKOFF: 1.5
  },
  HEARTBEAT: {
    INTERVAL: 30000,
    TIMEOUT: 5000
  }
}

// 流式响应配置
export const STREAM_CONFIG = {
  CHUNK_SIZE: 1024,
  ENCODING: 'utf-8',
  SEPARATOR: '\n\n',
  EVENT_PREFIX: 'data: '
}

// 环境相关配置
export const ENV_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
  UPLOAD_URL: import.meta.env.VITE_UPLOAD_URL || 'http://localhost:8080/upload',
  
  // 环境标识
  IS_DEV: import.meta.env.MODE === 'development',
  IS_PROD: import.meta.env.MODE === 'production',
  IS_TEST: import.meta.env.MODE === 'test'
} 