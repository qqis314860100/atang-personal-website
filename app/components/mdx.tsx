'use client'

import * as React from 'react'
import { useMDXComponent } from 'next-contentlayer/hooks'
import A from '@/app/components/A'

const components = {
  A,
}

interface MdxProps {
  code: string
}

export function Mdx({ code }: MdxProps) {
  const Component = useMDXComponent(code)

  return <Component components={components} />
}
