import { http, HttpResponse } from 'msw'
import { mockDelay, mockPaginate } from '../utils.js'
import { getDetails, updateFix, batchFix, getDetail } from '../store/resultStore.js'

export const resultHandlers = [
  http.get('/api/result/summary', async () => {
    await mockDelay()
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: {
        totalCheckCount: 18750000,
        totalProblemCount: 234560,
        problemRatio: 1.25,
        fixedRate: 67.3,
        monthNewProblem: 12300,
        problemRatioChange: -0.23,
        fixedRateChange: 5.2
      }
    })
  }),

  http.get('/api/result/by-rule', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20
    const mockByRule = [
      { ruleId: 1, ruleName: '患者姓名非空检查', problemCount: 234, fixedCount: 156, ratio: 66.7 },
      { ruleId: 2, ruleName: '患者身份证非空检查', problemCount: 189, fixedCount: 145, ratio: 76.7 },
      { ruleId: 5, ruleName: '性别代码值域检查', problemCount: 456, fixedCount: 289, ratio: 63.4 }
    ]
    const result = mockPaginate(mockByRule, page, size)
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: result
    })
  }),

  http.get('/api/result/detail', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20
    let details = getDetails()

    const isFixed = url.searchParams.get('isFixed')
    if (isFixed !== null) details = details.filter(d => d.isFixed === Number(isFixed))

    const result = mockPaginate(details, page, size)
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: result
    })
  }),

  http.put('/api/result/detail/:id/fix', async ({ params, request }) => {
    await mockDelay()
    const { id } = params
    const { isFixed, fixDescription } = await request.json()
    const updated = updateFix(Number(id), isFixed, fixDescription)
    return HttpResponse.json({
      code: 200,
      message: '整改标记成功',
      data: updated
    })
  }),

  http.put('/api/result/detail/batch-fix', async ({ request }) => {
    await mockDelay()
    const { ids, isFixed, fixDescription } = await request.json()
    batchFix(ids, isFixed, fixDescription)
    return HttpResponse.json({
      code: 200,
      message: '批量整改成功',
      data: { count: ids.length }
    })
  }),

  http.get('/api/result/detail/:id/business-data', async ({ params }) => {
    await mockDelay()
    const { id } = params
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: {
        detailId: id,
        data: {
          'BRID': '10023456',
          'XM': '',
          'SFZHM': '511701199005151234',
          'XBM': '1',
          'CSRQ': '1990-05-15',
          'GXDW': '通州市某某医院',
          'LXDH': '13800000000',
          'MZDM': '01',
          'GJDM': '156',
          'HYZKDM': '2'
        }
      }
    })
  }),

  http.get('/api/result/detail/:id/fix-history', async ({ params }) => {
    await mockDelay()
    const { id } = params
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: [
        {
          timestamp: '2026-05-20 14:30:00',
          operator: '王机管',
          operatorType: 'user',
          action: '状态变更：未整改 → 整改中',
          description: '已通知数据录入员修改，预计明日完成'
        },
        {
          timestamp: '2026-05-21 09:15:00',
          operator: '王机管',
          operatorType: 'user',
          action: '状态变更：整改中 → 已整改',
          description: '已修正患者姓名字段'
        },
        {
          timestamp: '2026-05-21 09:16:00',
          operator: '系统',
          operatorType: 'system',
          action: '自动复检：通过 ✓',
          description: '问题状态已更新为"已整改"'
        }
      ]
    })
  })
]
