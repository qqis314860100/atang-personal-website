import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedVideoData() {
  try {
    console.log('🌱 开始初始化视频数据...')

    // 检查是否已有测试用户
    let testUser = await prisma.userProfile.findUnique({
      where: { id: 'test-user-001' },
    })

    // 如果没有测试用户，创建一个
    if (!testUser) {
      console.log('👤 创建测试用户...')
      testUser = await prisma.userProfile.create({
        data: {
          id: 'test-user-001',
          email: 'test@example.com',
          username: 'testuser',
          bio: '测试用户',
          isAdmin: false,
        },
      })
      console.log('✅ 测试用户创建成功:', testUser.username)
    } else {
      console.log('✅ 测试用户已存在:', testUser.username)
    }

    // 检查是否已有测试视频
    const existingVideos = await prisma.video.findMany({
      where: { userId: testUser.id },
    })

    if (existingVideos.length === 0) {
      console.log('🎥 创建测试视频...')

      const testVideos = [
        {
          title: 'Big Buck Bunny 动画短片',
          description: '这是一个经典的动画短片，展示了开源动画的魅力。',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnail:
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
          duration: 596,
          viewCount: 1250,
          likeCount: 89,
          dislikeCount: 3,
          danmakuCount: 156,
          category: '动画',
          tags: ['动画', '短片', '开源'],
          isPublic: true,
          userId: testUser.id,
        },
        {
          title: 'Elephant Dream 实验短片',
          description: 'Blender基金会的第一部开源电影，展示了3D动画的可能性。',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          thumbnail:
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
          duration: 653,
          viewCount: 890,
          likeCount: 67,
          dislikeCount: 1,
          danmakuCount: 98,
          category: '实验',
          tags: ['3D', '实验', 'Blender'],
          isPublic: true,
          userId: testUser.id,
        },
        {
          title: 'Sintel 开源电影',
          description:
            'Blender基金会制作的第三部开源电影，讲述了一个关于友谊和背叛的故事。',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          thumbnail:
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
          duration: 888,
          viewCount: 2100,
          likeCount: 156,
          dislikeCount: 8,
          danmakuCount: 234,
          category: '电影',
          tags: ['电影', '开源', 'Blender'],
          isPublic: true,
          userId: testUser.id,
        },
      ]

      for (const videoData of testVideos) {
        const video = await prisma.video.create({
          data: videoData,
        })
        console.log('✅ 视频创建成功:', video.title)
      }
    } else {
      console.log('✅ 测试视频已存在，数量:', existingVideos.length)
    }

    // 创建一些测试弹幕
    const videos = await prisma.video.findMany({
      where: { userId: testUser.id },
    })

    for (const video of videos) {
      const existingDanmaku = await prisma.danmaku.count({
        where: { videoId: video.id },
      })

      if (existingDanmaku === 0) {
        console.log(`💬 为视频 "${video.title}" 创建测试弹幕...`)

        const testDanmaku = [
          {
            content: '这个视频很棒！',
            timeMs: 10000, // 10秒
            type: 1, // 滚动弹幕
            fontSize: 25,
            color: 16777215, // 白色
            poolType: 0,
            userId: testUser.id,
            videoId: video.id,
          },
          {
            content: '学到了很多',
            timeMs: 30000, // 30秒
            type: 1,
            fontSize: 25,
            color: 16711680, // 红色
            poolType: 0,
            userId: testUser.id,
            videoId: video.id,
          },
          {
            content: '支持开源项目',
            timeMs: 60000, // 1分钟
            type: 5, // 顶部弹幕
            fontSize: 25,
            color: 65280, // 绿色
            poolType: 0,
            userId: testUser.id,
            videoId: video.id,
          },
        ]

        for (const danmakuData of testDanmaku) {
          await prisma.danmaku.create({
            data: {
              ...danmakuData,
              timestampMs: BigInt(Date.now()),
            },
          })
        }
        console.log('✅ 弹幕创建成功')
      }
    }

    // 更新视频的弹幕数量
    for (const video of videos) {
      const danmakuCount = await prisma.danmaku.count({
        where: { videoId: video.id },
      })

      await prisma.video.update({
        where: { id: video.id },
        data: { danmakuCount },
      })
    }

    console.log('🎉 视频数据初始化完成!')

    // 显示统计信息
    const totalVideos = await prisma.video.count()
    const totalDanmaku = await prisma.danmaku.count()
    const totalUsers = await prisma.userProfile.count()

    console.log('📊 数据统计:')
    console.log(`   - 用户: ${totalUsers}`)
    console.log(`   - 视频: ${totalVideos}`)
    console.log(`   - 弹幕: ${totalDanmaku}`)
  } catch (error) {
    console.error('❌ 初始化失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  seedVideoData()
    .then(() => {
      console.log('✅ 种子数据创建完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ 种子数据创建失败:', error)
      process.exit(1)
    })
}

export { seedVideoData }
