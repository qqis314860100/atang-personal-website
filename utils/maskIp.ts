export function maskIp(ip?: string | null) {
  if (!ip) return ''
  // IPv4: 123.45.67.89 => 123.45.*.*
  // IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334 => 2001:0db8:****:****:****:****:****:****
  if (ip.includes('.')) {
    const parts = ip.split('.')
    return `${parts[0]}.${parts[1]}.*.*`
  } else if (ip.includes(':')) {
    const parts = ip.split(':')
    return `${parts[0]}:${parts[1]}:****:****:****:****:****:****`
  }
  return ip
}
