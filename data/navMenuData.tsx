const navMenuData = [
  { href: '/dashboard', title: '主页' },
  {
    href: '/blog',
    title: '博客',
    children: [
      { title: 'react', href: '/react', description: 'react学习' },
      { title: 'vue', href: '/vue', description: 'vue学习' },
    ],
  },
  {
    href: '/project',
    title: '项目',
    children: [
      {
        title: '低代码编辑器',
        href: '/lowcode',
        description: '低代码编辑器学习',
      },
      { title: '大模型MCP', href: '/AiMcp', description: '大模型MCP学习' },
      { title: '购物商城', href: '/market', description: '购物商城学习' },
    ],
  },
  {
    href: '/about',
    title: '关于我',
    children: [
      {
        title: '附件简历',
        href: '/attach-resume',
        description: '我的附件简历',
      },
      {
        title: '在线简历',
        href: '/online-resume',
        description: '我的在线简历',
      },
    ],
  },
]

export default navMenuData
