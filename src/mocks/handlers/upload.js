import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils.js'
import { generateUploadMonitor } from '../data/uploadMonitor.js'

export const uploadHandlers = [
  http.get('/api/upload/daily', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const yearMonth = url.searchParams.get('yearMonth') || '2026-05'
    const data = generateUploadMonitor(yearMonth)
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: data
    })
  })
]
