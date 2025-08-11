import bcrypt from 'bcrypt'
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto'

/***
 * crypto 是什么
    Node.js 内置的加密库，提供随机数、哈希、对称/非对称加密等能力。
    典型功能：randomBytes、pbkdf2、scrypt、createHash(sha256)、aes-256-gcm 等。
    适用场景：生成安全随机值、实现对称/非对称加密、基于 PBKDF2/Scrypt 的密码派生。

 * bcrypt 是什么
    一种专为“密码哈希存储”设计的算法/库（抗暴力破解，计算可调慢）。
    特点：内置“加盐”和成本因子（轮数），输出包含盐和值（一个字符串里）。
    适用场景：用户密码存储与验证（你的项目正使用它）。

 * 盐值（Salt）是什么
    给密码哈希前额外添加的一段随机值。
    作用：
    防彩虹表攻击（即使密码相同，也因盐不同而哈希不同）。
    避免同一密码在数据库中出现相同哈希。
    bcrypt 会自动生成并管理盐值；盐值会被编码进最终哈希字符串中，无需你单独存储。

 * 何时自己生成盐值
  使用 pbkdf2 或 scrypt 等时，通常需要你自己生成并存储盐（或与哈希一起保存）。
  用 bcrypt 时，一般不需要自己生成盐；如果要也可以，但通常直接让 bcrypt 自动处理更安全和简单。

 * 生成随机字符串
 * Edge/浏览器环境用随机数，使用 Web Crypto：crypto.getRandomValues(new Uint8Array(n))
 * Node.js 直接 randomBytes
 * 如果需要基于密码的随机数（如向量），更建议用 bcrypt 内置的 bcrypt.genSaltSync/genSalt 或 pbkdf2/scrypt 等。

 * 注意
 * “加密”与“哈希”不同：密码应“哈希存储”（不可逆），不应对密码做可逆“加密”。
 * 在 Edge/浏览器环境用随机数，使用 Web Crypto：crypto.getRandomValues(new Uint8Array(n))
 * 
 * 总结：
    crypto 是通用加密工具箱；bcrypt 是专门的密码哈希算法。
    盐值是哈希前混入的随机数；bcrypt 已自动处理盐值，你只需存 bcrypt 产出的哈希字符串即可。
 */

const SALT_ROUNDS = 12
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key'
// 统一派生 32 字节密钥用于 aes-256-gcm
const KEY = createHash('sha256').update(ENCRYPTION_KEY).digest()

// 加密密码
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

// 验证密码
export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}

// 生成随机盐值,盐值是给密码哈希前额外添加的一段随机值
// 防彩虹表攻击（即使密码相同，也因盐不同而哈希不同）。
// 避免同一密码在数据库中出现相同哈希。
export function generateSalt(size: number = 16): string {
  return randomBytes(size).toString('hex')
}

export function validatePasswordStreanth(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  if (password.length < 8) {
    errors.push('密码长度至少8位')
  }
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('密码需要包含至少一个大写字母')
  // }

  // if (!/[a-z]/.test(password)) {
  //   errors.push('密码需要包含至少一个小写字母')
  // }

  // if (!/\d/.test(password)) {
  //   errors.push('密码需要包含至少一个数字')
  // }

  // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
  //   errors.push('密码需要包含至少一个特殊字符')
  // }

  return { isValid: errors.length === 0, errors: errors }
}

// 敏感数据加密（如用户个人信息）
export function encryptSensitiveData(data: string): string {
  const iv = randomBytes(12) // GCM 推荐 12 字节 IV
  const cipher = createCipheriv('aes-256-gcm', KEY, iv)

  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  return JSON.stringify({
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  })
}

// 敏感数据解密
export function decryptSensitiveData(encryptedData: string): string | null {
  try {
    const { encrypted, iv, authTag } = JSON.parse(encryptedData)
    const ivBuf = Buffer.from(iv, 'hex')
    const decipher = createDecipheriv('aes-256-gcm', KEY, ivBuf)

    decipher.setAuthTag(Buffer.from(authTag, 'hex'))

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('解密失败:', error)
    return null
  }
}
