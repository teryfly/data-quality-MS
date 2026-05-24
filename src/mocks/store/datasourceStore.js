import { mockDataSources } from '../data/datasources.js'

let datasourcesStore = JSON.parse(JSON.stringify(mockDataSources))

export const getDatasources = () => datasourcesStore

export const addDatasource = (datasource) => {
  const newDatasource = {
    ...datasource,
    id: Math.max(...datasourcesStore.map(d => d.id), 0) + 1,
    createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    connectStatus: -1
  }
  datasourcesStore.push(newDatasource)
  return newDatasource
}

export const updateDatasource = (id, patch) => {
  const index = datasourcesStore.findIndex(d => d.id === id)
  if (index >= 0) {
    datasourcesStore[index] = { ...datasourcesStore[index], ...patch }
    return datasourcesStore[index]
  }
  return null
}

export const deleteDatasource = (id) => {
  datasourcesStore = datasourcesStore.filter(d => d.id !== id)
}

export const testConnection = (id) => {
  // 90% 成功率
  const success = Math.random() < 0.9
  if (success) {
    const datasource = datasourcesStore.find(d => d.id === id)
    if (datasource) datasource.connectStatus = 1
  }
  return success
}

export const syncCodeset = (id) => {
  const datasource = datasourcesStore.find(d => d.id === id)
  if (datasource) {
    datasource.lastSyncTime = new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  return { jobId: `sync-${id}-${Date.now()}` }
}

let syncProgress = {}

export const getSyncStatus = (jobId) => {
  if (!syncProgress[jobId]) {
    syncProgress[jobId] = 0
  }
  syncProgress[jobId] = Math.min(100, syncProgress[jobId] + Math.floor(Math.random() * 30) + 10)
  return { jobId, progress: syncProgress[jobId], status: syncProgress[jobId] >= 100 ? 'done' : 'syncing' }
}
