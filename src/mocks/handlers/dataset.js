import { http, HttpResponse } from 'msw'
import { mockDelay, mockPaginate } from '../utils.js'
import {
  getDatasets, getDataset, addDataset, updateDataset, deleteDataset,
  getElements, addElement, updateElement, deleteElement,
} from '../store/datasetStore.js'

export const datasetHandlers = [
  // ── Dataset list ─────────────────────────────────────────────────
  http.get('/api/dataset', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20
    const codeQ = (url.searchParams.get('datasetCode') || '').toLowerCase()
    const nameQ = (url.searchParams.get('datasetName') || '').toLowerCase()

    let list = getDatasets()
    if (codeQ) list = list.filter(d => d.datasetCode.toLowerCase().includes(codeQ))
    if (nameQ) list = list.filter(d => d.datasetName.toLowerCase().includes(nameQ))

    return HttpResponse.json({
      code: 200, message: '成功',
      data: mockPaginate(list, page, size),
    })
  }),

  // ── Create dataset ────────────────────────────────────────────────
  http.post('/api/dataset', async ({ request }) => {
    await mockDelay()
    const payload = await request.json()

    // Validate unique code
    const exists = getDatasets().find(d => d.datasetCode === payload.datasetCode)
    if (exists) {
      return HttpResponse.json({ code: 400, message: '数据集编码已存在', data: null })
    }

    const newDs = addDataset(payload)
    return HttpResponse.json({ code: 200, message: '数据集创建成功', data: newDs })
  }),

  // ── Update dataset ────────────────────────────────────────────────
  http.put('/api/dataset/:id', async ({ params, request }) => {
    await mockDelay()
    const payload = await request.json()
    const updated = updateDataset(params.id, payload)
    if (!updated) {
      return HttpResponse.json({ code: 404, message: '数据集不存在', data: null })
    }
    return HttpResponse.json({ code: 200, message: '数据集更新成功', data: updated })
  }),

  // ── Delete dataset ────────────────────────────────────────────────
  http.delete('/api/dataset/:id', async ({ params }) => {
    await mockDelay()
    const ds = getDataset(params.id)
    if (!ds) {
      return HttpResponse.json({ code: 404, message: '数据集不存在', data: null })
    }
    deleteDataset(params.id)
    return HttpResponse.json({ code: 200, message: '数据集已删除', data: null })
  }),

  // ── Sync dataset fields (trigger) ────────────────────────────────
  http.post('/api/dataset/:id/sync', async ({ params }) => {
    await mockDelay(800, 1200)
    return HttpResponse.json({
      code: 200, message: '字段同步已开始',
      data: { syncJobId: `sync-dataset-${params.id}` },
    })
  }),

  // ── Get elements of dataset ────────────────────────────────────────
  http.get('/api/dataset/:id/elements', async ({ request, params }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 200
    const nameQ = (url.searchParams.get('elementName') || '').toLowerCase()

    let elements = getElements(params.id)
    if (nameQ) elements = elements.filter(e => (e.elementName || '').toLowerCase().includes(nameQ))

    return HttpResponse.json({
      code: 200, message: '成功',
      data: mockPaginate(elements, page, size),
    })
  }),

  // ── Create element ─────────────────────────────────────────────────
  http.post('/api/dataset/:id/elements', async ({ params, request }) => {
    await mockDelay()
    const payload = await request.json()

    // Check unique code within dataset
    const existing = getElements(params.id)
    if (existing.find(e => e.elementCode === payload.elementCode)) {
      return HttpResponse.json({ code: 400, message: '字段编码在当前数据集中已存在', data: null })
    }

    const newEl = addElement(params.id, payload)
    return HttpResponse.json({ code: 200, message: '数据元创建成功', data: newEl })
  }),

  // ── Update element ─────────────────────────────────────────────────
  http.put('/api/dataset/:id/elements/:elementId', async ({ params, request }) => {
    await mockDelay()
    const payload = await request.json()
    const updated = updateElement(params.id, params.elementId, payload)
    if (!updated) {
      return HttpResponse.json({ code: 404, message: '数据元不存在', data: null })
    }
    return HttpResponse.json({ code: 200, message: '数据元更新成功', data: updated })
  }),

  // ── Delete element ─────────────────────────────────────────────────
  http.delete('/api/dataset/:id/elements/:elementId', async ({ params }) => {
    await mockDelay()
    deleteElement(params.id, params.elementId)
    return HttpResponse.json({ code: 200, message: '数据元已删除', data: null })
  }),

  // ── Sync preview ───────────────────────────────────────────────────
  http.post('/api/dataset/:id/elements/sync-preview', async ({ params }) => {
    await mockDelay(1000, 1500)
    return HttpResponse.json({
      code: 200, message: '成功',
      data: {
        added: [
          { elementName: '新增字段示例', elementCode: 'XZ_DEMO', elementType: 'string' },
        ],
        deleted: [
          { elementName: '已删字段示例', elementCode: 'SC_DEMO', elementType: 'string' },
        ],
        modified: [
          { elementName: '修改类型示例', elementCode: 'XG_DEMO', oldType: 'string', newType: 'number' },
        ],
      },
    })
  }),

  // ── Sync confirm ───────────────────────────────────────────────────
  http.put('/api/dataset/:id/elements/sync-confirm', async ({ params }) => {
    await mockDelay()
    return HttpResponse.json({
      code: 200, message: '字段同步已确认',
      data: { datasetId: Number(params.id), syncedCount: 25 },
    })
  }),
]
