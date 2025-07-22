/**
 * 加密工具
 * 改进版本，增加错误处理和功能扩展
 */

import JSEncrypt from 'jsencrypt'

/**
 * RSA加密数据
 * @param {string} publicKey 公钥
 * @param {string} data 要加密的数据
 * @returns {string|null} 加密后的数据
 */
export function encryptData(publicKey, data) {
  try {
    if (!publicKey || !data) {
      throw new Error('公钥和数据都是必需的')
    }
    
    const encryptor = new JSEncrypt()
    encryptor.setPublicKey(publicKey)
    
    const encrypted = encryptor.encrypt(data)
    if (!encrypted) {
      throw new Error('加密失败')
    }
    
    return encrypted
  } catch (error) {
    console.error('RSA加密失败:', error)
    return null
  }
}

/**
 * RSA解密数据
 * @param {string} privateKey 私钥
 * @param {string} encryptedData 加密的数据
 * @returns {string|null} 解密后的数据
 */
export function decryptData(privateKey, encryptedData) {
  try {
    if (!privateKey || !encryptedData) {
      throw new Error('私钥和加密数据都是必需的')
    }
    
    const decryptor = new JSEncrypt()
    decryptor.setPrivateKey(privateKey)
    
    const decrypted = decryptor.decrypt(encryptedData)
    if (!decrypted) {
      throw new Error('解密失败')
    }
    
    return decrypted
  } catch (error) {
    console.error('RSA解密失败:', error)
    return null
  }
}

/**
 * 生成随机字符串
 * @param {number} length 长度
 * @returns {string} 随机字符串
 */
export function generateRandomString(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Base64编码
 * @param {string} data 要编码的数据
 * @returns {string} 编码后的数据
 */
export function base64Encode(data) {
  try {
    return btoa(unescape(encodeURIComponent(data)))
  } catch (error) {
    console.error('Base64编码失败:', error)
    return ''
  }
}

/**
 * Base64解码
 * @param {string} encodedData 编码的数据
 * @returns {string} 解码后的数据
 */
export function base64Decode(encodedData) {
  try {
    return decodeURIComponent(escape(atob(encodedData)))
  } catch (error) {
    console.error('Base64解码失败:', error)
    return ''
  }
} 