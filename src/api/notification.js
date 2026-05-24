import request from '@/utils/request'

/**
 * 获取未读通知数及最新5条
 */
export const getNotificationList = () =>
  request.get('/api/notification')

/**
 * 获取全部通知（分页）
 * @param {object} params - { page, size, type?, isRead? }
 */
export const getAllNotifications = (params) =>
  request.get('/api/notification/all', { params })

/**
 * 标记单条通知已读
 * @param {number} id
 */
export const markNotificationRead = (id) =>
  request.put(`/api/notification/${id}/read`)

/**
 * 全部标为已读
 */
export const markAllNotificationsRead = () =>
  request.put('/api/notification/mark-all-read')
