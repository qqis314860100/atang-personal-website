import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const https = require('https')

/**
 * IP地址工具类
 */
export class IpUtils {
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
   * 通过外部API获取公网IP
   * @returns {Promise<string>} 公网IP地址
   */
  static async getPublicIp() {
    const apis = [
      { hostname: 'api.ipify.org', path: '/' },
      { hostname: 'icanhazip.com', path: '/' },
      { hostname: 'ident.me', path: '/' },
      { hostname: 'checkip.amazonaws.com', path: '/' },
    ]

    for (const api of apis) {
      try {
        const ip = await this.callIpApi(api)
        if (ip && !this.isLocalIp(ip)) {
          console.log(`✅ 成功从 ${api.hostname} 获取公网IP: ${ip}`)
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
        timeout: 3000, // 减少超时时间
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
   * 获取IP地址信息（地理位置等）
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

    // 使用免费的IP地理位置API
    const apis = [
      { hostname: 'ipapi.co', path: `/${ip}/json/` },
      { hostname: 'ip-api.com', path: `/json/${ip}` },
      { hostname: 'freegeoip.app', path: `/json/${ip}` },
    ]

    for (const api of apis) {
      try {
        const info = await this.callIpInfoApi(api)
        if (info && info.country) {
          console.log(`✅ 成功从 ${api.hostname} 获取IP信息`)
          return info
        }
      } catch (error) {
        console.log(`❌ ${api.hostname} 获取IP信息失败:`, error.message)
        continue
      }
    }

    // 如果所有API都失败，返回基本信息
    return {
      ip: ip,
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      isp: 'Unknown',
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
        timeout: 3000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
}
