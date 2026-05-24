import { mockNotifications } from '../data/notifications.js'

let notificationsStore = JSON.parse(JSON.stringify(mockNotifications))
let firstFetchTime = null

export const getNotifications = () => {
  // Record first fetch time
  if (!firstFetchTime) {
    firstFetchTime = Date.now()
    // Schedule automatic notification insertion after 60 seconds
    setTimeout(() => {
      const newNotification = {
        id: Math.max(...notificationsStore.map(n => n.id), 0) + 1,
        type: 'execute_done',
        title: '[质控完成] 定时执行质控已完成',
        content: '批次 EXEC-SCHEDULED-AUTO，发现567条问题，已完成。',
        isRead: 0,
        createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        relatedData: { executionId: 'EXEC-SCHEDULED-AUTO', status: 'done', problemCount: 567 },
        icon: '⏳',
        iconColor: '#1890ff'
      }
      notificationsStore.unshift(newNotification)
    }, 60000)
  }

  return notificationsStore
}

export const getUnreadCount = () => {
  return notificationsStore.filter(n => n.isRead === 0).length
}

export const markRead = (id) => {
  const notification = notificationsStore.find(n => n.id === id)
  if (notification) {
    notification.isRead = 1
    return notification
  }
  return null
}

export const markAllRead = () => {
  notificationsStore.forEach(n => n.isRead = 1)
}
