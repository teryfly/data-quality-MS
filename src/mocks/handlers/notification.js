import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils.js'
import { getNotifications, getUnreadCount, markRead, markAllRead } from '../store/notificationStore.js'

export const notificationHandlers = [
  http.get('/api/notification', async () => {
    await mockDelay()
    const all = getNotifications()
    const unreadCount = getUnreadCount()
    const latest = all.slice(0, 5)
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: {
        unreadCount,
        notifications: latest
      }
    })
  }),

  http.put('/api/notification/:id/read', async ({ params }) => {
    await mockDelay()
    const { id } = params
    const updated = markRead(Number(id))
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: updated
    })
  }),

  http.put('/api/notification/mark-all-read', async () => {
    await mockDelay()
    markAllRead()
    return HttpResponse.json({
      code: 200,
      message: '全部标记为已读',
      data: null
    })
  }),

  http.get('/api/notification/all', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20
    const all = getNotifications()
    const start = (page - 1) * size
    const end = start + size
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: {
        records: all.slice(start, end),
        total: all.length,
        page,
        size
      }
    })
  })
]
