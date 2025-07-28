// components/client-toploader.tsx
'use client'

import NextTopLoader from 'nextjs-toploader'

export function ClientTopLoader() {
  return (
    <NextTopLoader
      showSpinner={true}
      color="#2563eb"
      initialPosition={0.08}
      height={3}
      shadow="0 0 10px #2563eb,0 0 5px #2563eb"
    />
  )
}
