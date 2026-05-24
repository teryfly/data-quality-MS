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
    const totalOrgs = 8
    const doneOrgs = Math.floor(progress / 100 * totalOrgs)
    const orgNames = ['达州市中医医院','达州市中心医院','通川区人民医院','通川区社区卫生服务中心','达县人民医院','宣汉县人民医院','开江县中医院','大竹县人民医院']
    const orgProgress = orgNames.map((name, i) => ({
      orgName: name,
      status: i < doneOrgs ? 'done' : i === doneOrgs ? 'running' : 'pending',
      execRules: i < doneOrgs ? '35/35' : i === doneOrgs ? `${Math.floor(progress % 100 * 0.35)}/35` : '0/35',
      problemCount: i < doneOrgs ? Math.floor(Math.random() * 200 + 50) : null,
      duration: i < doneOrgs ? `${Math.floor(Math.random() * 3 + 1)}m${Math.floor(Math.random() * 59)}s` : null
    }))

    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: {
        executionId,
        progress,
        status: progress >= 100 ? 'done' : 'running',
        orgProgress,
        logs: []
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
