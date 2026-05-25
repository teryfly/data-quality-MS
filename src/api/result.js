import request, { createRequest } from '@/utils/request'
import { useAuthStore } from '@/store/auth'

/* ── 6.1 Overview ─────────────────────────────────────────────────── */

/**
 * 概览指标卡数据
 * @param {object} params - { orgId?, statMonth?, type? }
 */
export function getResultSummary(params = {}) {
  return request.get('/api/result/summary', {
    params: { type: 'overview', ...params },
  })
}

/**
 * 近6个月问题占比趋势
 * @param {object} params - { orgId?, statMonth? }
 */
export function getIssueRatioTrend(params = {}) {
  return request.get('/api/result/chart/issue-ratio-trend', { params })
}

/**
 * 按规则分类问题数占比
 * @param {object} params - { orgId?, statMonth? }
 */
export function getCategoryPie(params = {}) {
  return request.get('/api/result/chart/category-pie', { params })
}

/**
 * 按数据集问题数排名 Top10
 * @param {object} params - { orgId?, statMonth? }
 */
export function getDatasetRanking(params = {}) {
  return request.get('/api/result/chart/dataset-ranking', { params })
}

/* ── 6.2 By-rule ──────────────────────────────────────────────────── */

/**
 * 按规则统计
 * @param {object} params - { datasetId?, categoryId?, ruleId?, startDate?, endDate?, ruleLevels?, page?, size? }
 */
export function getResultByRule(params = {}) {
  return request.get('/api/result/by-rule', { params })
}

/**
 * 按规则统计导出
 */
export function exportResultByRule(params = {}) {
  const exporter = createRequest(120000)
  const authStore = useAuthStore()
  if (authStore.token) {
    exporter.defaults.headers.common.Authorization = `Bearer ${authStore.token}`
  }
  return exporter.get('/api/result/by-rule/export', {
    params,
    responseType: 'blob',
  })
}

/* ── 6.3 Detail ───────────────────────────────────────────────────── */

/**
 * 问题明细列表
 * @param {object} params - { datasetId?, ruleId?, startDate?, endDate?, isFixed?, statMonth?, page?, size? }
 */
export function getResultDetail(params = {}) {
  return request.get('/api/result/detail', { params })
}

/**
 * 标记整改
 * @param {number|string} id
 * @param {object} payload - { isFixed, fixDescription? }
 */
export function markFix(id, payload) {
  return request.put(`/api/result/detail/${id}/fix`, payload)
}

/**
 * 批量整改
 * @param {object} payload - { ids: number[], isFixed, fixDescription? }
 */
export function batchMarkFix(payload) {
  return request.put('/api/result/detail/batch-fix', payload)
}

/**
 * 业务数据详情
 * @param {number|string} id
 */
export function getBusinessData(id) {
  return request.get(`/api/result/detail/${id}/business-data`)
}

/**
 * 整改历史
 * @param {number|string} id
 */
export function getFixHistory(id) {
  return request.get(`/api/result/detail/${id}/fix-history`)
}
