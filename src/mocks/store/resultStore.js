import { mockResultDetails } from '../data/resultDetails.js'

let resultDetailsStore = JSON.parse(JSON.stringify(mockResultDetails))
const fixHistoryStore = {}

export const getDetails = () => resultDetailsStore

const ts = () => new Date().toISOString().replace('T', ' ').slice(0, 19)

const statusLabel = (s) => ({
  0: '未整改',
  1: '整改中',
  2: '已整改',
  3: '无需整改',
}[s] || '未知')

function appendHistory(id, entry) {
  if (!fixHistoryStore[id]) fixHistoryStore[id] = []
  fixHistoryStore[id].unshift(entry)
}

export const updateFix = (id, fixStatus, fixDescription = '', operator = '当前用户') => {
  const detail = resultDetailsStore.find(d => d.id === id)
  if (!detail) return null

  const prevStatus = detail.isFixed
  detail.isFixed = fixStatus // 0未整改 1整改中 2已整改 3无需整改
  if (fixStatus > 0) {
    detail.fixedTime = ts()
    detail.fixDescription = fixDescription
  }

  appendHistory(id, {
    timestamp: ts(),
    operator,
    operatorType: 'user',
    action: `状态变更：${statusLabel(prevStatus)} → ${statusLabel(fixStatus)}`,
    description: fixDescription || '',
  })

  // Simulate system auto-recheck for "已整改"
  if (fixStatus === 2) {
    const recheckPass = Math.random() > 0.2
    if (recheckPass) {
      appendHistory(id, {
        timestamp: ts(),
        operator: '系统',
        operatorType: 'system',
        action: '自动复检：通过 ✓',
        description: '问题状态已更新为"已整改"',
      })
    } else {
      detail.isFixed = 0
      appendHistory(id, {
        timestamp: ts(),
        operator: '系统',
        operatorType: 'system',
        action: '自动复检：未通过 ✗',
        description: '问题依然存在，问题状态已重置为"未整改"',
      })
    }
  }

  return detail
}

export const batchFix = (ids, fixStatus, fixDescription = '') => {
  ids.forEach(id => {
    updateFix(Number(id), fixStatus, fixDescription)
  })
}

export const getDetail = (id) => {
  return resultDetailsStore.find(d => d.id === Number(id))
}

export const getFixHistoryById = (id) => {
  const numId = Number(id)
  if (fixHistoryStore[numId] && fixHistoryStore[numId].length > 0) {
    return fixHistoryStore[numId]
  }
  // Default seed history for items that already had isFixed > 0
  const detail = resultDetailsStore.find(d => d.id === numId)
  if (detail && detail.isFixed > 0) {
    return [
      {
        timestamp: '2026-05-20 14:30:00',
        operator: '王机管',
        operatorType: 'user',
        action: '状态变更：未整改 → 整改中',
        description: '已通知数据录入员修改，预计明日完成',
      },
      {
        timestamp: detail.fixedTime || '2026-05-21 09:15:00',
        operator: '王机管',
        operatorType: 'user',
        action: `状态变更：整改中 → ${statusLabel(detail.isFixed)}`,
        description: detail.fixDescription || '已修正字段',
      },
      ...(detail.isFixed === 2
        ? [{
            timestamp: '2026-05-21 09:16:00',
            operator: '系统',
            operatorType: 'system',
            action: '自动复检：通过 ✓',
            description: '问题状态已更新为"已整改"',
          }]
        : []),
    ]
  }
  return []
}
