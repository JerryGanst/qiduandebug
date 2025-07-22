import JSEncrypt from 'jsencrypt'
// 或者使用 encryptlong（如果需要加密长文本）
// import JSEncryptLong from 'encryptlong'

// 创建加密函数
export function encryptData(publicKey, data) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey)
  return encryptor.encrypt(data)
}
