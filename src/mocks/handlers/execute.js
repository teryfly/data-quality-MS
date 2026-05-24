import { http, HttpResponse } from 'msw'
import { mockDelay, mockPaginate } from '../utils.js'
import { mockExecutions, mockExecutionDetails } from '../data/executions.js'

let executionProgress = {}

export const executeHandlers = [
  http.get('/api/execute/plan', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20
    const result = mockPaginate(mockExecutions, page, size)
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: result
    })
  }),

  http.post('/api/execute/manual', async ({ request }) => {
    await mockDelay()
    const payload = await request.json()
    const executionId = `EXEC-MANUAL-${Date.now()}`
    executionProgress[executionId] = 0
    return HttpResponse.json({
      code: 200,
      message: '执行已创建',
      data: { executionId }
    })
  }),

  http.get('/api/execute/status/:executionId', async ({ params }) => {
    await mockDelay(300, 500)
    const { executionId } = params
    if (!executionProgress[executionId]) {
      executionProgress[executionId] = Math.floor(Math.random() * 40)
    } else {
      executionProgress[executionId] = Math.min(100, executionProgress[executionId] + Math.floor(Math.random() * 25) + 10)
    }

    const progress = executionProgress[executionId]
    const details = mockExecutionDetails['EXEC-20260524-001'] || {}

    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: {
        executionId,
        progress,
        status: progress >= 100 ? 'done' : 'running',
        orgProgress: details.orgProgress || [],
        logs: details.logs || []
      }
    })
  }),

  http.get('/api/execute/log', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20
    const result = mockPaginate(mockExecutions, page, size)
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: result
    })
  })
]
