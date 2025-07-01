'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { IStaticMethods } from 'flyonui/flyonui'
declare global {
  interface Window {
    HSStaticMethods: IStaticMethods
  }
}

export default function FlyonuiScript() {
  const path = usePathname()

  useEffect(() => {
    const loadFlyonui = async () => {
      try {
        await import('flyonui/flyonui')
        if (typeof window !== 'undefined' && window.HSStaticMethods) {
          window.HSStaticMethods.autoInit()
        }
      } catch (error) {
        console.error('Failed to load flyonui:', error)
      }
    }
    loadFlyonui()
  }, [path])

  return null
}
