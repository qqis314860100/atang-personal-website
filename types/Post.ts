export interface BlogPost {
  userId?: string
  id: string
  title: string
  body: string
  author: string | null | undefined
  createdAt?: Date
  updatedAt?: Date
  categories: { id: string; name: string }[]
}

export interface Category {
  id: string
  name: string
}

export interface ButtonProps {
  label?: string
  onClick?: () => void
  className?: string
  disabled?: boolean
  icon?: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  usePendingStatus?: boolean
  pendingContent?: string
  isLoading?: boolean
  loadingComponent?: React.ReactNode
}

export interface InputProps {
  className?: string
  variant?: 'standard' | 'outlined' | 'static'
  placeholder?: string
  id?: string
  type: string
  name: string
  disabled?: boolean
  value?: string
  defaultValue?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export interface TextareaProps {
  className: string
  id: string
  rows: number
  name: string
  value?: string
  defaultValue?: string
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export interface SiteConfigProps {
  name: string
  description: string
  url: string
  og: string
  ogImage: string
  links: {
    github: string
  }
}
