import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

export const useNotificationStore = defineStore('notification', () => {
  /** 未读数，供 TopBar 铃铛徽标使用 */
  const unreadCount = ref(0)
  /** 最新 5 条，供下拉面板使用 */
  const latestList = ref([])

  const fetchUnread = async () => {
    try {
      const data = await request.get('/api/notification')
      unreadCount.value = data.unreadCount ?? 0
      latestList.value = data.notifications ?? []
    } catch {
      // 静默失败，不中断轮询
    }
  }

  const markRead = async (id) => {
    try {
      await request.put(`/api/notification/${id}/read`)
      // 本地立即更新，避免等待下次轮询
      const item = latestList.value.find(n => n.id === id)
      if (item && item.isRead === 0) {
        item.isRead = 1
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch {
      // 静默失败
    }
  }

  const markAllRead = async () => {
    try {
      await request.put('/api/notification/mark-all-read')
      latestList.value.forEach(n => { n.isRead = 1 })
      unreadCount.value = 0
    } catch {
      // 静默失败
    }
  }

  return {
    unreadCount,
    latestList,
    fetchUnread,
    markRead,
    markAllRead,
  }
})
