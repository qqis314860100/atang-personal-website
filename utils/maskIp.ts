/**
 * IP地址脱敏处理
 * @param ip IP地址
 * @returns 脱敏后的IP地址
 */
export function maskIp(ip?: string | null): string {
  if (!ip) return 'unknown'

  // 处理IPv4地址
  if (ip.includes('.')) {
    const parts = ip.split('.')
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.*`
    }
  }

  // 处理IPv6地址
  if (ip.includes(':')) {
    const parts = ip.split(':')
    if (parts.length >= 4) {
      return `${parts[0]}:${parts[1]}:****:****`
    }
  }

  // 处理本地地址
  if (ip === 'localhost' || ip === '127.0.0.1' || ip === '::1') {
    return '本地访问'
  }

  return ip
}
