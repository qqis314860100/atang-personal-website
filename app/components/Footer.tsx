'use client'

import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'
import { useEffect, useState } from 'react'

export default function Footer() {
  const [year, setYear] = useState('2024')

  useEffect(() => {
    setYear(new Date().getFullYear().toString())
  }, [])

  return (
    <footer>
      <div className="mt-16 flex flex-col items-center">
        <div className="mb-2 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <SocialIcon
            kind="mail"
            href={`mailto:${siteMetadata.email}`}
            size={6}
          />
          <div>{siteMetadata.author}</div>
          <div>{` • `}</div>
          <div>{`© ${year}`}</div>
          <div>{` • `}</div>
          <SocialIcon kind="github" href={siteMetadata.github} size={6} />
          <Link href="/">{siteMetadata.title}</Link>
        </div>
        <div className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          <Link href="">Tailwind Nextjs Theme</Link>
        </div>
      </div>
    </footer>
  )
}
