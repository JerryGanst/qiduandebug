/**
 * 组合式函数统一导出
 * 提供便捷的批量导入方式
 */

export { useAuth } from './useAuth.js'
export { useChat } from './useChat.js'
export { useFile } from './useFile.js'
export { useUI } from './useUI.js'
export { useIntel } from './useIntel.js'
export { useTranslation } from './useTranslation.js'

// 批量导出函数，用于一次性导入所有composables
export async function useAll() {
  const { useAuth } = await import('./useAuth.js')
  const { useChat } = await import('./useChat.js')
  const { useFile } = await import('./useFile.js')
  const { useUI } = await import('./useUI.js')
  const { useIntel } = await import('./useIntel.js')
  const { useTranslation } = await import('./useTranslation.js')
  
  return {
    ...useAuth(),
    ...useChat(),
    ...useFile(),
    ...useUI(),
    ...useIntel(),
    ...useTranslation()
  }
}

// 兼容旧版本的useShared导出（渐进式迁移）
export function useShared() {
  console.warn('useShared 已被弃用，请使用具体的模块: useAuth, useChat, useFile, useUI')
  
  // 返回合并的功能（用于向后兼容）
  return useAll()
} 