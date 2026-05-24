import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils.js'
import { getDatasources, addDatasource, updateDatasource, deleteDatasource, testConnection, syncCodeset, getSyncStatus } from '../store/datasourceStore.js'

export const datasourceHandlers = [
  http.get('/api/datasource', async () => {
    await mockDelay()
    const datasources = getDatasources()
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: { records: datasources, total: datasources.length }
    })
  }),

  http.post('/api/datasource', async ({ request }) => {
    await mockDelay()
    const payload = await request.json()
    const newDatasource = addDatasource(payload)
    return HttpResponse.json({
      code: 200,
      message: '数据源添加成功',
      data: newDatasource
    })
  }),

  http.put('/api/datasource/:id', async ({ params, request }) => {
    await mockDelay()
    const { id } = params
    const payload = await request.json()
    const updated = updateDatasource(Number(id), payload)
    return HttpResponse.json({
      code: 200,
      message: '数据源更新成功',
      data: updated
    })
  }),

  http.delete('/api/datasource/:id', async ({ params }) => {
    await mockDelay()
    const { id } = params
    deleteDatasource(Number(id))
    return HttpResponse.json({
      code: 200,
      message: '数据源删除成功',
      data: null
    })
  }),

  http.post('/api/datasource/:id/test', async ({ params }) => {
    await mockDelay(1500, 1500)
    const { id } = params
    const success = testConnection(Number(id))
    return HttpResponse.json({
      code: success ? 200 : 500,
      message: success ? '连接成功' : '连接失败：网络超时',
      data: { connected: success }
    })
  }),

  http.post('/api/datasource/:id/sync', async ({ params }) => {
    await mockDelay()
    const { id } = params
    const jobId = syncCodeset(Number(id))
    return HttpResponse.json({
      code: 200,
      message: '同步已开始',
      data: { jobId: jobId.jobId }
    })
  }),

  http.get('/api/datasource/:id/sync-status', async ({ params }) => {
    await mockDelay(300, 300)
    const { id } = params
    const status = getSyncStatus(`sync-${id}`)
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: status
    })
  })
]
