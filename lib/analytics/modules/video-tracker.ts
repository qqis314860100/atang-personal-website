import { ModuleTracker } from '../types'
import { analytics } from '../core'

export class VideoTracker implements ModuleTracker {
  moduleName = 'video'
  version = '1.0.0'

  initialize(): void {
    console.log('Video tracker initialized')
  }

  trackEvent(eventType: string, data: any): void {
    switch (eventType) {
      case 'video_play':
        this.trackVideoPlay(data)
        break
      case 'video_pause':
        this.trackVideoPause(data)
        break
      case 'video_seek':
        this.trackVideoSeek(data)
        break
      case 'danmaku_send':
        this.trackDanmakuSend(data)
        break
      case 'danmaku_interaction':
        this.trackDanmakuInteraction(data)
        break
      case 'video_quality_change':
        this.trackVideoQualityChange(data)
        break
      default:
        console.log(`Unknown video event type: ${eventType}`)
    }
  }

  trackPerformance(metric: string, value: number): void {
    analytics.trackPerformance(`video_${metric}`, value, 'ms')
  }

  trackError(error: Error, context?: any): void {
    analytics.trackError('video_error', error.message, error.stack, context)
  }

  private trackVideoPlay(data: {
    videoId: string
    currentTime: number
    playbackRate: number
    volume: number
  }) {
    analytics.trackBusinessEvent('video_play', data.videoId, {
      currentTime: data.currentTime,
      playbackRate: data.playbackRate,
      volume: data.volume,
    })
  }

  private trackVideoPause(data: {
    videoId: string
    currentTime: number
    duration: number
  }) {
    analytics.trackBusinessEvent('video_pause', data.videoId, {
      currentTime: data.currentTime,
      duration: data.duration,
    })
  }

  private trackVideoSeek(data: {
    videoId: string
    fromTime: number
    toTime: number
  }) {
    analytics.trackBusinessEvent('video_seek', data.videoId, {
      fromTime: data.fromTime,
      toTime: data.toTime,
    })
  }

  private trackDanmakuSend(data: {
    videoId: string
    content: string
    type: 'scroll' | 'top' | 'bottom' | 'special'
    color: string
    fontSize: number
  }) {
    analytics.trackBusinessEvent('danmaku_send', data.videoId, {
      content: data.content,
      type: data.type,
      color: data.color,
      fontSize: data.fontSize,
    })
  }

  private trackDanmakuInteraction(data: {
    danmakuId: string
    videoId: string
    action: 'like' | 'dislike' | 'report' | 'reply'
  }) {
    analytics.trackUserAction(
      `danmaku_${data.action}`,
      data.danmakuId,
      true,
      undefined,
      {
        videoId: data.videoId,
      }
    )
  }

  private trackVideoQualityChange(data: {
    videoId: string
    fromQuality: string
    toQuality: string
    reason: string
  }) {
    analytics.trackBusinessEvent('video_quality_change', data.videoId, {
      fromQuality: data.fromQuality,
      toQuality: data.toQuality,
      reason: data.reason,
    })
  }
}
