import { onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/store/notification'

const POLL_INTERVAL_MS = 30 * 1000 // 30秒轮询一次

/**
 * 全局通知轮询 composable
 * - 每 30 秒调用 GET /api/notification
 * - 页面不可见时暂停，可见时立即拉取
 * - 在组件 onMounted 时启动，onUnmounted 时停止
 */
export function useNotification() {
  const notificationStore = useNotificationStore()
  let timer = null

  const poll = () => {
    if (document.visibilityState === 'visible') {
      notificationStore.fetchUnread()
    }
  }

  const startPolling = () => {
    // 立即拉取一次
    notificationStore.fetchUnread()
    timer = setInterval(poll, POLL_INTERVAL_MS)
  }

  const stopPolling = () => {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // 页面重新可见时立即拉取
      notificationStore.fetchUnread()
    }
    // 不可见时不主动停止 timer，交给 setInterval 里的 visibilityState 判断
  }

  onMounted(() => {
    startPolling()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    stopPolling()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return { notificationStore }
}
