import { http, HttpResponse } from 'msw'
import { mockDelay, mockPaginate } from '../utils.js'
import { mockCodesets } from '../data/codesets.js'

export const codesetHandlers = [
  http.get('/api/codeset', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20
    let codesets = mockCodesets

    const source = url.searchParams.get('source')
    if (source) codesets = codesets.filter(c => c.source === source)

    const result = mockPaginate(codesets, page, size)
    return HttpResponse.json({ code: 200, message: '成功', data: result })
  }),

  http.put('/api/codeset/:id/calibrate', async ({ params, request }) => {
    await mockDelay()
    const { id } = params
    const payload = await request.json()
    return HttpResponse.json({
      code: 200,
      message: '代码集校准成功',
      data: { codesetId: Number(id), calibratedCount: payload.items?.length || 0 }
    })
  })
]
