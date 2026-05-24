import { http, HttpResponse } from 'msw'
import { mockDelay, mockPaginate, createMockBlob } from '../utils.js'
import { mockMonthlyReports } from '../data/report.js'

export const reportHandlers = [
  http.get('/api/report/monthly', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20
    let reports = mockMonthlyReports

    const orgId = url.searchParams.get('orgId')
    if (orgId) reports = reports.filter(r => r.orgId === Number(orgId))

    const result = mockPaginate(reports, page, size)
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: result
    })
  }),

  http.get('/api/report/monthly/:id/export', async ({ params }) => {
    await mockDelay(1500, 2500)
    const blob = createMockBlob('月度报告.pdf')
    return new HttpResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=monthly_report.pdf'
      }
    })
  })
]
