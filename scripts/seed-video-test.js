import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始添加测试视频数据...')

  // 创建测试用户
  const testUser = await prisma.userProfile.upsert({
    where: { id: 'test-user-1' },
    update: {},
    create: {
      id: 'test-user-1',
      username: '测试用户',
      email: 'test@example.com',
      avatar: 'https://via.placeholder.com/150',
    },
  })

  console.log('创建测试用户:', testUser.username)

  // 创建测试视频
  const testVideos = [
    {
      id: 'video-1',
      title: '示例视频 1',
      description: '这是一个示例视频，用于测试视频管理系统',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200',
      duration: 120,
      viewCount: 150,
      likeCount: 25,
      dislikeCount: 2,
      danmakuCount: 15,
      category: '教育',
      tags: ['示例', '测试', '教育'],
      isPublic: true,
      userId: testUser.id,
    },
    {
      id: 'video-2',
      title: '示例视频 2',
      description: '另一个示例视频，展示不同的内容类型',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200',
      duration: 180,
      viewCount: 89,
      likeCount: 12,
      dislikeCount: 1,
      danmakuCount: 8,
      category: '娱乐',
      tags: ['娱乐', '搞笑', '视频'],
      isPublic: true,
      userId: testUser.id,
    },
    {
      id: 'video-3',
      title: '技术教程视频',
      description: '这是一个关于编程技术的教程视频',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200',
      duration: 600,
      viewCount: 320,
      likeCount: 45,
      dislikeCount: 3,
      danmakuCount: 28,
      category: '科技',
      tags: ['编程', '教程', '技术'],
      isPublic: true,
      userId: testUser.id,
    },
  ]

  for (const videoData of testVideos) {
    const video = await prisma.video.upsert({
      where: { id: videoData.id },
      update: videoData,
      create: videoData,
    })
    console.log('创建视频:', video.title)
  }

  console.log('测试数据添加完成！')
}

main()
  .catch((e) => {
    console.error('添加测试数据失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
