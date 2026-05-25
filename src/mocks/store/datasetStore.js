/**
 * Mock store for dataset CRUD operations
 * Manages both datasets and their data elements in memory
 */
import { mockDatasets } from '../data/datasets.js'
import { mockElements } from '../data/elements.js'

// Deep clone initial data so operations don't mutate source
let datasetsStore = JSON.parse(JSON.stringify(mockDatasets))

// Elements keyed by datasetId; build from mockElements
let elementsStore = {}
for (const el of mockElements) {
  if (!elementsStore[el.datasetId]) elementsStore[el.datasetId] = []
  elementsStore[el.datasetId].unshift({ ...el })
}

let nextDatasetId = Math.max(...datasetsStore.map(d => d.id), 0) + 1
let nextElementId = 10000 // start high to avoid collision with string IDs

// ── Dataset CRUD ────────────────────────────────────────────────────

export const getDatasets = () => datasetsStore

export const getDataset = (id) => datasetsStore.find(d => d.id === Number(id))

export const addDataset = (payload) => {
  const newDs = {
    id: nextDatasetId++,
    dataSourceId: payload.dataSourceId || 1,
    datasetCode: payload.datasetCode,
    datasetName: payload.datasetName,
    orgCodeField: payload.orgCodeField || 'YLJGDM',
    businessKeyField: payload.businessKeyField || '',
    isRequired: payload.isRequired ?? 0,
    recordCount: 0,
    sortNo: payload.sortNo || 99,
    status: 1,
    createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  datasetsStore.unshift(newDs)
  elementsStore[newDs.id] = []
  return newDs
}

export const updateDataset = (id, patch) => {
  const idx = datasetsStore.findIndex(d => d.id === Number(id))
  if (idx < 0) return null
  datasetsStore[idx] = { ...datasetsStore[idx], ...patch }
  return datasetsStore[idx]
}

export const deleteDataset = (id) => {
  const numId = Number(id)
  datasetsStore = datasetsStore.filter(d => d.id !== numId)
  delete elementsStore[numId]
}

// ── Element CRUD ────────────────────────────────────────────────────

export const getElements = (datasetId) => {
  return elementsStore[Number(datasetId)] || []
}

export const addElement = (datasetId, payload) => {
  const numId = Number(datasetId)
  if (!elementsStore[numId]) elementsStore[numId] = []
  const newEl = {
    id: `${numId}-${nextElementId++}`,
    datasetId: numId,
    elementName: payload.elementName,
    elementCode: payload.elementCode,
    elementType: payload.elementType || 'string',
    isRequired: payload.isRequired ?? 0,
    remark: payload.remark || '',
    sortNo: payload.sortNo || 99,
    createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  elementsStore[numId].unshift(newEl)
  return newEl
}

export const updateElement = (datasetId, elementId, patch) => {
  const numId = Number(datasetId)
  const arr = elementsStore[numId]
  if (!arr) return null
  const idx = arr.findIndex(e => String(e.id) === String(elementId))
  if (idx < 0) return null
  arr[idx] = { ...arr[idx], ...patch }
  return arr[idx]
}

export const deleteElement = (datasetId, elementId) => {
  const numId = Number(datasetId)
  if (!elementsStore[numId]) return
  elementsStore[numId] = elementsStore[numId].filter(e => String(e.id) !== String(elementId))
}
