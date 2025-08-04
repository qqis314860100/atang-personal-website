interface NavMenuItem {
  title: string
  href: string
  description?: string
  children?: NavMenuItem[]
}

const navMenuData: NavMenuItem[] = [
  {
    title: '首页',
    href: '/'
  },
  {
    title: '博客',
    href: '/blog'
  },
  {
    title: '分类管理',
    href: '/blog/category'
  },
  {
    title: '创建文章',
    href: '/blog/create'
  },
  {
    title: '仪表板',
    href: '/dashboard'
  }
]

export default navMenuData