import { http, HttpResponse } from 'msw'
import { mockDelay, mockPaginate } from '../utils.js'
import { mockDatasets } from '../data/datasets.js'
import { mockElements } from '../data/elements.js'

export const datasetHandlers = [
  http.get('/api/dataset', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20
    const result = mockPaginate(mockDatasets, page, size)
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: result
    })
  }),

  http.put('/api/dataset/:id', async ({ params, request }) => {
    await mockDelay()
    const { id } = params
    const payload = await request.json()
    const dataset = mockDatasets.find(d => d.id === Number(id))
    if (dataset) {
      Object.assign(dataset, payload)
      return HttpResponse.json({
        code: 200,
        message: '数据集更新成功',
        data: dataset
      })
    }
    return HttpResponse.json({
      code: 404,
      message: '数据集不存在',
      data: null
    })
  }),

  http.post('/api/dataset/:id/sync', async ({ params }) => {
    await mockDelay(800, 1200)
    const { id } = params
    return HttpResponse.json({
      code: 200,
      message: '字段同步已开始',
      data: { syncJobId: `sync-dataset-${id}` }
    })
  }),

  http.get('/api/dataset/:id/elements', async ({ params }) => {
    await mockDelay()
    const { id } = params
    const elements = mockElements.filter(e => e.datasetId === Number(id))
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: { records: elements, total: elements.length }
    })
  }),

  http.post('/api/dataset/:id/elements/sync-preview', async ({ params }) => {
    await mockDelay(1000, 1500)
    const { id } = params
    const elements = mockElements.filter(e => e.datasetId === Number(id))
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: {
        added: [
          { elementName: '新增字段1', elementCode: 'XZ01', elementType: 'string' },
          { elementName: '新增字段2', elementCode: 'XZ02', elementType: 'datetime' }
        ],
        deleted: [
          { elementName: '删除字段1', elementCode: 'SC01', elementType: 'string' }
        ],
        modified: [
          { elementName: '修改字段1', elementCode: 'XG01', oldType: 'string', newType: 'number' }
        ]
      }
    })
  }),

  http.put('/api/dataset/:id/elements/sync-confirm', async ({ params, request }) => {
    await mockDelay()
    const { id } = params
    const payload = await request.json()
    return HttpResponse.json({
      code: 200,
      message: '字段同步已确认',
      data: { datasetId: Number(id), syncedCount: 25 }
    })
  })
]
