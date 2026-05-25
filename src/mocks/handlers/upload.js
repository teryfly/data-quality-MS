import { http, HttpResponse } from 'msw'
import { mockDelay, mockExportDelay, createMockBlob } from '../utils.js'
import { generateUploadMonitor } from '../data/uploadMonitor.js'

export const uploadHandlers = [
  http.get('/api/upload/daily', async ({ request }) => {
    const url = new URL(request.url)
    const isExport = url.searchParams.get('export') === 'true'
    const yearMonth = url.searchParams.get('yearMonth') || '2026-05'

    if (isExport) {
      await mockExportDelay()
      const blob = createMockBlob(`数据上传监控_${yearMonth}.xlsx`)
      return new HttpResponse(blob, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=upload_monitor_${yearMonth}.xlsx`
        }
      })
    }

    await mockDelay()
    const datasets = generateUploadMonitor(yearMonth)
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: { datasets, yearMonth }
    })
  })
]
