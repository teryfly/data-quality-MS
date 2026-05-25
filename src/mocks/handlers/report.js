import { http, HttpResponse } from 'msw'
import { mockDelay, mockPaginate, createMockBlob } from '../utils.js'
import { getAllReports, getMockReportDetail, generateMockReport } from '../data/report.js'

export const reportHandlers = [
  /**
   * 报告列表（按 orgId 过滤，最多返回12条，按月份降序）
   */
  http.get('/api/report/monthly', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Math.min(Number(url.searchParams.get('size')) || 20, 12)
    let reports = getAllReports()

    const orgId = url.searchParams.get('orgId')
    if (orgId) reports = reports.filter(r => r.orgId === Number(orgId))

    reports = [...reports]
      .sort((a, b) => b.reportMonth.localeCompare(a.reportMonth))
      .slice(0, 12)

    const result = mockPaginate(reports, page, size)
    return HttpResponse.json({ code: 200, message: '成功', data: result })
  }),

  /**
   * 报告详情（含统计图表数据）
   */
  http.get('/api/report/monthly/:id', async ({ params }) => {
    await mockDelay()
    const detail = getMockReportDetail(params.id)
    if (!detail) {
      return HttpResponse.json({ code: 404, message: '报告不存在', data: null }, { status: 404 })
    }
    return HttpResponse.json({ code: 200, message: '成功', data: detail })
  }),

  /**
   * 生成月度报告（POST）
   * body: { orgId, reportMonth }
   */
  http.post('/api/report/generate', async ({ request }) => {
    await mockDelay(1500, 2500) // simulate AI analysis time
    const { orgId, reportMonth } = await request.json()

    if (!orgId || !reportMonth) {
      return HttpResponse.json({ code: 400, message: '机构和报告月份不能为空', data: null })
    }

    const result = generateMockReport(orgId, reportMonth)
    if (result.error) {
      return HttpResponse.json({ code: 409, message: result.error, data: result.report })
    }

    return HttpResponse.json({
      code: 200,
      message: `${reportMonth}月度质量报告已成功生成`,
      data: result.report,
    })
  }),

  /**
   * 导出月度报告 PDF
   */
  http.get('/api/report/monthly/:id/export', async ({ params }) => {
    await mockDelay(1500, 2500)
    const blob = createMockBlob(`月度报告_${params.id}.pdf`)
    return new HttpResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=monthly_report_${params.id}.pdf`,
      },
    })
  }),

  /**
   * 下载问题明细 Excel
   */
  http.get('/api/report/monthly/:id/problems/export', async ({ params }) => {
    await mockDelay(1200, 2000)
    const blob = createMockBlob(`问题明细_${params.id}.xlsx`)
    return new HttpResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=problems_${params.id}.xlsx`,
      },
    })
  }),
]
