import request, { createRequest } from '@/utils/request'
import { useAuthStore } from '@/store/auth'

/**
 * 获取月度报告列表（最多12个月）
 * @param {object} params - { orgId?, page?, size? }
 * @returns {Promise}
 */
export function getMonthlyReportList(params = {}) {
  return request.get('/api/report/monthly', { params })
}

/**
 * 获取月度报告详情（含统计分析数据）
 * @param {number|string} id - 报告ID
 * @returns {Promise}
 */
export function getMonthlyReportDetail(id) {
  return request.get(`/api/report/monthly/${id}`)
}

/**
 * 导出月度报告 PDF（后端生成，120秒超时）
 * @param {number|string} id - 报告ID
 * @returns {Promise<Blob>}
 */
export function exportMonthlyReport(id) {
  const exporter = createRequest(120000)
  const authStore = useAuthStore()
  if (authStore.token) {
    exporter.defaults.headers.common.Authorization = `Bearer ${authStore.token}`
  }
  return exporter.get(`/api/report/monthly/${id}/export`, {
    responseType: 'blob',
  })
}

/**
 * 下载问题明细 Excel
 * @param {number|string} id - 报告ID
 * @returns {Promise<Blob>}
 */
export function downloadProblemDetail(id) {
  const exporter = createRequest(120000)
  const authStore = useAuthStore()
  if (authStore.token) {
    exporter.defaults.headers.common.Authorization = `Bearer ${authStore.token}`
  }
  return exporter.get(`/api/report/monthly/${id}/problems/export`, {
    responseType: 'blob',
  })
}
