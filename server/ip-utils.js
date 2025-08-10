import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const https = require('https')

/**
 * IP地址工具类 - 优化版本
 */
export class IpUtils {
  // 缓存配置
  static cache = new Map()
  static cacheTimeout = 5 * 60 * 1000 // 5分钟缓存

  // 限流配置
  static rateLimit = new Map()
  static rateLimitWindow = 60 * 1000 // 1分钟窗口
  static maxRequestsPerWindow = 10 // 每分钟最多10次请求
  /**
   * 获取客户端真实IP地址
   * @param {Object} socket - Socket.IO socket对象
   * @returns {string} 真实IP地址
   */
  static getClientIp(socket) {
    // 1. 优先从代理头部获取真实IP
    const forwardedFor = socket.handshake.headers['x-forwarded-for']
    const realIp = socket.handshake.headers['x-real-ip']
    const cfConnectingIp = socket.handshake.headers['cf-connecting-ip']

    // 2. 从请求对象获取IP
    const remoteAddress = socket.handshake.address
    const remoteAddr = socket.request?.connection?.remoteAddress
    const socketRemoteAddr = socket.conn?.remoteAddress

    console.log('🔍 IP获取调试信息:')
    console.log('  - x-forwarded-for:', forwardedFor)
    console.log('  - x-real-ip:', realIp)
    console.log('  - cf-connecting-ip:', cfConnectingIp)
    console.log('  - socket.handshake.address:', remoteAddress)
    console.log('  - socket.request.connection.remoteAddress:', remoteAddr)
    console.log('  - socket.conn.remoteAddress:', socketRemoteAddr)

    // 3. 按优先级获取IP
    if (forwardedFor && !this.isLocalIp(forwardedFor)) {
      // x-forwarded-for 可能包含多个IP，取第一个非本地IP
      const ips = forwardedFor.split(',').map((ip) => ip.trim())
      const realIp = ips.find((ip) => !this.isLocalIp(ip))
      if (realIp) return realIp
    }

    if (realIp && !this.isLocalIp(realIp)) {
      return realIp
    }

    if (cfConnectingIp && !this.isLocalIp(cfConnectingIp)) {
      return cfConnectingIp
    }

    // 4. 尝试从其他来源获取
    if (remoteAddr && !this.isLocalIp(remoteAddr)) {
      return remoteAddr
    }

    if (socketRemoteAddr && !this.isLocalIp(socketRemoteAddr)) {
      return socketRemoteAddr
    }

    // 5. 如果都是本地地址，返回标识
    if (this.isLocalIp(remoteAddress)) {
      return 'localhost'
    }

    return remoteAddress || 'unknown'
  }

  /**
   * 判断是否为本地IP地址
   * @param {string} ip - IP地址
   * @returns {boolean} 是否为本地IP
   */
  static isLocalIp(ip) {
    if (!ip) return true

    // 处理IPv6格式的IPv4地址
    const normalizedIp = this.normalizeIp(ip)

    const localIps = [
      '::1', // IPv6 本地回环
      '127.0.0.1', // IPv4 本地回环
      'localhost', // 本地主机名
      'unknown', // 未知地址
    ]

    // 检查是否为本地IP
    if (localIps.includes(normalizedIp)) return true

    // 检查是否为私有IP段
    if (normalizedIp.startsWith('192.168.')) return true
    if (normalizedIp.startsWith('10.')) return true
    if (normalizedIp.startsWith('172.')) {
      const secondOctet = parseInt(normalizedIp.split('.')[1])
      if (secondOctet >= 16 && secondOctet <= 31) return true
    }

    return false
  }

  /**
   * 标准化IP地址（将IPv6格式的IPv4地址转换为IPv4格式）
   * @param {string} ip - IP地址
   * @returns {string} 标准化后的IP地址
   */
  static normalizeIp(ip) {
    if (!ip) return ip

    // 处理 ::ffff:127.0.0.1 格式
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7) // 移除 ::ffff: 前缀
    }

    // 处理 ::1 格式
    if (ip === '::1') {
      return '127.0.0.1'
    }

    return ip
  }

  /**
   * 检查限流
   * @param {string} apiHostname - API主机名
   * @returns {boolean} 是否被限流
   */
  static isRateLimited(apiHostname) {
    const now = Date.now()
    const windowStart = now - this.rateLimitWindow

    if (!this.rateLimit.has(apiHostname)) {
      this.rateLimit.set(apiHostname, [])
    }

    const requests = this.rateLimit.get(apiHostname)
    // 清理过期的请求记录
    const validRequests = requests.filter((time) => time > windowStart)

    if (validRequests.length >= this.maxRequestsPerWindow) {
      return true
    }

    // 记录新请求
    validRequests.push(now)
    this.rateLimit.set(apiHostname, validRequests)
    return false
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {any} 缓存值或null
   */
  static getCache(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.value
    }
    this.cache.delete(key)
    return null
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   */
  static setCache(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    })
  }

  /**
   * 通过外部API获取公网IP - 优化版本
   * @returns {Promise<string>} 公网IP地址
   */
  static async getPublicIp() {
    // 检查缓存
    const cachedIp = this.getCache('public_ip')
    if (cachedIp) {
      console.log('✅ 从缓存获取公网IP:', cachedIp)
      return cachedIp
    }

    const apis = [
      { hostname: 'icanhazip.com', path: '/', priority: 1 },
      { hostname: 'checkip.amazonaws.com', path: '/', priority: 2 },
      { hostname: 'ident.me', path: '/', priority: 3 },
      { hostname: 'api.ipify.org', path: '/', priority: 4 },
    ]

    // 按优先级排序
    apis.sort((a, b) => a.priority - b.priority)

    for (const api of apis) {
      // 检查限流
      if (this.isRateLimited(api.hostname)) {
        console.log(`⏳ ${api.hostname} 被限流，跳过`)
        continue
      }

      try {
        const ip = await this.callIpApiWithRetry(api)
        if (ip && !this.isLocalIp(ip)) {
          console.log(`✅ 成功从 ${api.hostname} 获取公网IP: ${ip}`)
          // 缓存结果
          this.setCache('public_ip', ip)
          return ip
        }
      } catch (error) {
        console.log(`❌ ${api.hostname} 获取失败:`, error.message)
        continue
      }
    }

    throw new Error('所有IP API都失败了')
  }

  /**
   * 带重试机制的IP API调用
   * @param {Object} api - API配置
   * @param {number} maxRetries - 最大重试次数
   * @returns {Promise<string>} IP地址
   */
  static async callIpApiWithRetry(api, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const ip = await this.callIpApi(api)
        if (ip && !this.isLocalIp(ip)) {
          return ip
        }
      } catch (error) {
        if (attempt === maxRetries) {
          throw error
        }

        // 指数退避延迟
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        console.log(
          `⏳ ${api.hostname} 第${attempt}次尝试失败，${delay}ms后重试...`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  /**
   * 调用单个IP API
   * @param {Object} api - API配置
   * @returns {Promise<string>} IP地址
   */
  static callIpApi(api) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: api.hostname,
        port: 443,
        path: api.path,
        method: 'GET',
        timeout: 5000, // 增加超时时间到5秒
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'text/plain,application/json,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
      }

      const req = https.request(options, (res) => {
        let data = ''

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(data.trim())
          } else {
            reject(new Error(`HTTP ${res.statusCode}`))
          }
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Timeout'))
      })

      req.end()
    })
  }

  /**
   * 获取IP地址信息（地理位置等） - 优化版本
   * @param {string} ip - IP地址
   * @returns {Promise<Object>} IP信息
   */
  static async getIpInfo(ip) {
    if (this.isLocalIp(ip)) {
      return {
        ip: ip,
        country: 'Local',
        region: 'Development',
        city: 'Localhost',
        isp: 'Local Network',
      }
    }

    // 检查缓存
    const cacheKey = `ip_info_${ip}`
    const cachedInfo = this.getCache(cacheKey)
    if (cachedInfo) {
      console.log('✅ 从缓存获取IP信息:', ip)
      return cachedInfo
    }

    // 使用免费的IP地理位置API，按可靠性排序
    const apis = [
      { hostname: 'ipapi.co', path: `/${ip}/json/`, priority: 1 },
      { hostname: 'ip-api.com', path: `/json/${ip}`, priority: 2 },
      { hostname: 'freegeoip.app', path: `/json/${ip}`, priority: 3 },
    ]

    // 按优先级排序
    apis.sort((a, b) => a.priority - b.priority)

    for (const api of apis) {
      // 检查限流
      if (this.isRateLimited(api.hostname)) {
        console.log(`⏳ ${api.hostname} 被限流，跳过`)
        continue
      }

      try {
        const info = await this.callIpInfoApiWithRetry(api)
        if (info && info.country) {
          console.log(`✅ 成功从 ${api.hostname} 获取IP信息`)
          // 缓存结果
          this.setCache(cacheKey, info)
          return info
        }
      } catch (error) {
        console.log(`❌ ${api.hostname} 获取IP信息失败:`, error.message)
        continue
      }
    }

    // 如果所有API都失败，返回基本信息
    const fallbackInfo = {
      ip: ip,
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      isp: 'Unknown',
    }

    // 缓存失败结果，避免重复请求
    this.setCache(cacheKey, fallbackInfo)
    return fallbackInfo
  }

  /**
   * 带重试机制的IP信息API调用
   * @param {Object} api - API配置
   * @param {number} maxRetries - 最大重试次数
   * @returns {Promise<Object>} IP信息
   */
  static async callIpInfoApiWithRetry(api, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const info = await this.callIpInfoApi(api)
        if (info && info.country) {
          return info
        }
      } catch (error) {
        if (attempt === maxRetries) {
          throw error
        }

        // 指数退避延迟
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        console.log(
          `⏳ ${api.hostname} 第${attempt}次尝试失败，${delay}ms后重试...`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  /**
   * 调用单个IP信息API
   * @param {Object} api - API配置
   * @returns {Promise<Object>} IP信息
   */
  static callIpInfoApi(api) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: api.hostname,
        port: 443,
        path: api.path,
        method: 'GET',
        timeout: 5000, // 增加超时时间到5秒
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
      }

      const req = https.request(options, (res) => {
        let data = ''

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const info = JSON.parse(data)
              resolve(info)
            } catch (error) {
              reject(error)
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}`))
          }
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Timeout'))
      })

      req.end()
    })
  }

  /**
   * 格式化IP地址显示
   * @param {string} ip - IP地址
   * @returns {string} 格式化后的IP地址
   */
  static formatIp(ip) {
    if (!ip || ip === 'unknown' || ip === 'localhost') {
      return '本地访问'
    }

    // 标准化IP地址
    const normalizedIp = this.normalizeIp(ip)

    // 如果是本地IP，显示本地访问
    if (this.isLocalIp(normalizedIp)) {
      return '本地访问'
    }

    return normalizedIp
  }

  /**
   * 清理过期缓存
   */
  static cleanupCache() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        ttl: this.cacheTimeout - (Date.now() - value.timestamp),
      })),
    }
  }
}

// 定期清理缓存
setInterval(() => {
  IpUtils.cleanupCache()
}, 60000) // 每分钟清理一次
