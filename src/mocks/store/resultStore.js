import { mockResultDetails } from '../data/resultDetails.js'

let resultDetailsStore = JSON.parse(JSON.stringify(mockResultDetails))

export const getDetails = () => resultDetailsStore

export const updateFix = (id, fixStatus, fixDescription = '') => {
  const detail = resultDetailsStore.find(d => d.id === id)
  if (detail) {
    detail.isFixed = fixStatus // 0未整改 1整改中 2已整改 3无需整改
    if (fixStatus > 0) {
      detail.fixedTime = new Date().toISOString().replace('T', ' ').slice(0, 19)
      detail.fixDescription = fixDescription
    }
    return detail
  }
  return null
}

export const batchFix = (ids, fixStatus, fixDescription = '') => {
  ids.forEach(id => {
    updateFix(id, fixStatus, fixDescription)
  })
}

export const getDetail = (id) => {
  return resultDetailsStore.find(d => d.id === id)
}
