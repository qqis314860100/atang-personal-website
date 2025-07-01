import { Suspense } from 'react'
import Loading from '@/app/[locale]/blog/loading'
import { Metadata } from 'next'
import PostsList from '@/app/components/PostList'

export const metadata: Metadata = {
  title: 'Blog',
}

const Blog = () => {
  return (
    <Suspense fallback={<Loading />}>
      <PostsList />
    </Suspense>
  )
}

export default Blog
