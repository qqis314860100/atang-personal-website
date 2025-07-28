'use client'

import { TCreatePostSchema, createPostSchema } from '@/schemas/createPostSchema'
import { Category } from '@/types/Post'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from './ui/input'
import toast from 'react-hot-toast'
import TextArea from './TextArea'
import { Button } from './ui/button'
import Modal from './Modal'
import { createPost } from '@/app/actions/createPost'

const CreatePostForm = () => {
  const {
    register,
    formState: { errors },
    reset,
    getValues,
  } = useForm<TCreatePostSchema>({ resolver: zodResolver(createPostSchema) })

  const [previewMode, setPreviewMode] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [previewData, setPreviewData] = useState<{ title: ''; body: '' }>({
    title: '',
    body: '',
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const t = useTranslations('createPost')

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const handleFormSubmit = async (formData: FormData) => {
    const data = {
      title: formData.get('title'),
      body: formData.get('body'),
      categoryId: selectedCategories,
    }
    console.log(data)

    const parsed = createPostSchema.safeParse(data)

    if (!parsed.success) {
      parsed.error.errors.forEach((error) => {
        toast.error(error.message, { id: error.path.join('-') })
      })
      return
    }

    try {
      await createPost(parsed.data)

      reset()
      setSelectedCategories([])
      toast.success('Post created successfully')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Failed to create the post!')
      }
    }
  }
  return (
    <section className="flex mx-5 flex-col items-center justify-center">
      <form
        className="mb-4 rounded-3xl w-full max-w-60"
        action={handleFormSubmit}
      >
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="title"
              className="block dark:text-white text-sm font-bold mb-2"
            >
              {t('title.label')}
            </label>
          </div>

          <div>
            <div className="relative mt-2 rounded-md shadown-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 mt-[1.2rem]"></div>
            </div>
            <Input
              className="block w-full rounded-md border-0 py-1.5 pl-10 dark:text-white bg-transparent ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:focus:ring-2 dark:focus:ring-inset dark:focus:ring-indigo-600 sm:text-sm sm:leading-6"
              type="text"
              placeholder={t('title.placeholder')}
              {...register('title')}
              name="title"
            />
            {errors.title &&
              toast.error(`${errors.title.message}`, {
                id: 'Title-Error',
              })}
          </div>

          <div className="mb-4">
            <label
              className="block dark:text-white text-sm font-bold mb-2"
              htmlFor="body"
            >
              {t('body.label')}
            </label>

            <TextArea
              className="block w-full rounded-md border-0 py-1.5 px-1.5 dark:text-white bg-transparent shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:focus:ring-2 dark:focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              rows={4}
              {...register('body')}
              name="body"
              id="body"
            />
            {errors.body &&
              toast.error(`${errors.body.message}`, {
                id: 'Body-Error',
              })}
          </div>

          <div className="mb-4">
            <label
              className="block dark:text-white text-sm font-bold mb-2"
              htmlFor="category"
            >
              {t('category.label')}
            </label>
            <div>
              {categories.map((category) => (
                <div key={category.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={category.id}
                    value={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                    className="mr-2"
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="dark:text-white"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center flex-col justify-between">
          <Button
            usePendingStatus={true}
            pendingContent={t('createButtonLoading')}
            className="inline-block w-full cursor-pointer rounded-xl disabled:bg-gray-500 disabled:cursor-not-allowed dark:bg-white px-8 py-4 mt-4 text-center duration-300 font-semibold text-black no-underline dark:hover:bg-gray-300 hover:bg-gray-200 ring-1 ring-inset ring-gray-300"
            type="submit"
            label={t('createButton')}
          />
        </div>
      </form>

      <Modal isOpen={previewMode} onClose={() => setPreviewMode(false)}>
        <div
          className={`flex items-center justify-center flex-col transition-opacity duration-300 ease-out ${
            previewMode ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <h1 className="text-xl font-bold dark:text-white">
            {t('preview.postTitle')}:{' '}
            {previewData.title || t('preview.untitled')}{' '}
          </h1>
          <p className="text-xl font-bold dark:text-white">
            {t('preview.postBody')}:{' '}
            {previewData.body || t('preview.noContent')}{' '}
          </p>
          <h3 className="text-xl font-bold dark:text-white">
            {t('preview.category')}:{' '}
            {selectedCategories.length > 0
              ? selectedCategories
                  .map(
                    (categoryId) =>
                      categories.find((cat) => cat.id === categoryId)?.name
                  )
                  .filter(Boolean)
                  .join(', ')
              : t('preview.uncategorized')}{' '}
          </h3>
        </div>
      </Modal>
    </section>
  )
}

export default CreatePostForm
