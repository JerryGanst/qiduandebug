/**
 * UI 配置文件
 * 界面相关的配置常量
 */

// 文本框配置
export const TEXTAREA_CONFIG = {
  MIN_ROWS: 1,
  MAX_ROWS: 5,
  DEFAULT_LINE_HEIGHT: 24,
  PADDING: {
    TOP: 8,
    BOTTOM: 8,
    LEFT: 12,
    RIGHT: 12
  },
  RESIZE_DEBOUNCE: 100
}

// 模态框配置
export const MODAL_CONFIG = {
  Z_INDEX: {
    MODAL: 1000,
    OVERLAY: 999,
    DROPDOWN: 1001
  },
  ANIMATION_DURATION: 300,
  BACKDROP_CLOSE: true
}

// 加载状态配置
export const LOADING_CONFIG = {
  DOTS: {
    INITIAL: '.',
    ANIMATION_INTERVAL: 500,
    MAX_DOTS: 3
  },
  SPINNER: {
    SIZE: {
      SMALL: 16,
      MEDIUM: 24,
      LARGE: 32
    }
  }
}

// 分页配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_VISIBLE_PAGES: 7
}

// 文件展示配置
export const FILE_DISPLAY_CONFIG = {
  ICONS: {
    PDF: '/icons/pdf.png',
    EXCEL: '/icons/excel.png',
    WORD: '/icons/word.png',
    PPT: '/icons/ppt.png',
    IMAGE: '/icons/image.png',
    ARCHIVE: '/icons/archive.png',
    UNKNOWN: '/icons/file.png'
  },
  PREVIEW: {
    MAX_WIDTH: 800,
    MAX_HEIGHT: 600,
    THUMBNAIL_SIZE: 120
  }
}

// 消息气泡配置
export const MESSAGE_BUBBLE_CONFIG = {
  MAX_WIDTH: '70%',
  BORDER_RADIUS: 12,
  SPACING: 16,
  AVATAR_SIZE: 32,
  TIMESTAMP_FORMAT: 'HH:mm'
}

// 侧边栏配置
export const SIDEBAR_CONFIG = {
  WIDTH: {
    COLLAPSED: 60,
    EXPANDED: 280
  },
  ANIMATION_DURATION: 200,
  ITEM_HEIGHT: 48
}

// 工具栏配置
export const TOOLBAR_CONFIG = {
  HEIGHT: 56,
  BUTTON_SIZE: 40,
  SPACING: 8,
  ICON_SIZE: 20
}

// 响应式断点
export const BREAKPOINTS = {
  XS: 480,
  SM: 768,
  MD: 1024,
  LG: 1280,
  XL: 1536
}

// 主题配置
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#1890ff',
    SUCCESS: '#52c41a',
    WARNING: '#faad14',
    ERROR: '#ff4d4f',
    INFO: '#13c2c2'
  },
  DARK_MODE: {
    BACKGROUND: '#141414',
    SURFACE: '#1f1f1f',
    TEXT: '#ffffff'
  },
  LIGHT_MODE: {
    BACKGROUND: '#ffffff',
    SURFACE: '#f5f5f5',
    TEXT: '#000000'
  }
}

// 拖拽配置
export const DRAG_CONFIG = {
  HOVER_CLASS: 'drag-hover',
  ACTIVE_CLASS: 'drag-active',
  ACCEPT_TYPES: ['Files'],
  MULTIPLE: true,
  HIGHLIGHT_BORDER: '2px dashed #1890ff'
}

// 通知配置
export const NOTIFICATION_CONFIG = {
  DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000
  },
  POSITION: 'top-right',
  MAX_COUNT: 5
}

// 表单验证配置
export const VALIDATION_CONFIG = {
  DEBOUNCE_DELAY: 300,
  SHOW_ERROR_IMMEDIATELY: false,
  HIGHLIGHT_ERROR_FIELDS: true
}

// 滚动配置
export const SCROLL_CONFIG = {
  SMOOTH_SCROLL: true,
  SCROLL_OFFSET: 80,
  AUTO_SCROLL_SPEED: 1,
  CHAT_AUTO_SCROLL: true
} 