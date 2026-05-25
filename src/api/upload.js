import request, { createRequest } from '@/utils/request'
import { useAuthStore } from '@/store/auth'

/**
 * 数据上传监控 - 按日上传量
 * @param {object} params - { yearMonth, districtCode?, systemType?, orgCode? }
 */
export function getUploadDaily(params) {
  return request.get('/api/upload/daily', { params })
}

/**
 * 数据上传监控 - 导出 Excel
 * 后端直接返回文件流，超时设为 120 秒以容纳导出耗时；
 * 使用独立 axios 实例以避开默认响应拦截器对二进制流的处理，
 * 返回完整 response，便于读取 Content-Disposition 头。
 * @param {object} params - 同 getUploadDaily 的筛选条件
 */
export function exportUploadDaily(params) {
  const exporter = createRequest(120000)
  const authStore = useAuthStore()
  if (authStore.token) {
    exporter.defaults.headers.common.Authorization = `Bearer ${authStore.token}`
  }
  return exporter.get('/api/upload/daily', {
    params: { ...params, export: true },
    responseType: 'blob',
  })
}
