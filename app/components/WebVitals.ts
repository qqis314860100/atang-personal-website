'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric)
    const body = JSON.stringify(metric)

    const url = 'http://47.120.78.92:4001/report'
    // const url = 'http://localhost:4001/report'
    // sendBeacon 是浏览器原生API，用于在后台发送数据，不会阻塞主线程
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body)
    } else {
      fetch(url, {
        body,
        method: 'POST',
        keepalive: true,
      })
    }
  })
}
