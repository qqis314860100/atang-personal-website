'use client'

import { useEffect, useState, useCallback, use } from 'react'
import Spinner from '@/app/[locale]/blog/loading'
import { fetchPosts } from '@/app/actions/fetchPosts'
import toast from 'react-hot-toast'

export interface BlogPostProps {
  userId?: string
  id: string
  title: string
  body: string
  author: string | null | undefined
  createdAt?: Date
  updatedAt?: Date
  categories: { id: string; name: string }[]
}

const PostsList = () => {
  const [posts, setPosts] = useState<BlogPostProps[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  const loadPosts = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const postsData = await fetchPosts(0, 20)
      console.log('postsData', JSON.stringify(postsData))
      setPosts(postsData)
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load posts. Please try again later.')
      setError(true)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  return (
    <div className="max-w-6xl mx-auto">
      {loading && (
        <div className="text-center font-bold text-white mt-16 flex items-center justify-center min-h-screen">
          <Spinner color="white" />
        </div>
      )}
      {!loading && error && (
        <div className="text-center font-bold text-white mt-16">
          <p>Failed to load posts. Please try again later.</p>
        </div>
      )}
      {!loading && !error && posts.length === 0 && (
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4">No posts found</h2>
          <p className="mb-8">
            There are no posts available at the moment. Please check back later.
          </p>
          <a href="/create-post" className="btn btn-primary">
            Create New Post
          </a>
        </div>
      )}
      {!loading && !error && posts.length > 0 && (
        <main className="px-2 sm:px-16 py-16 sm:max-w-lg md:max-w-4xl max-auto">
          <div className="flex items-center flex-col gap-y-16">
            <div className="gap-y-2">
              {
                // {posts.map((post) => (
                //   <div key={post.id}>
                //     <BlogCard post={post} />
                //   </div>
                // ))}
              }
            </div>
          </div>
        </main>
      )}
    </div>
  )
}
export default PostsList
