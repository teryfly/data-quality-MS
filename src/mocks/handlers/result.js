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
        // Field names match the Dashboard's expectations
        totalChecks: 18750000,
        totalChecksMoM: 8.4,
        totalIssues: 234560,
        totalIssuesMoM: -3.1,
        issueRatio: 1.25,
        issueRatioMoM: -0.23,
        rectificationRate: 67.3,
        rectificationRateMoM: 5.2,
        // Keep legacy keys too so other pages aren't broken
        totalCheckCount: 18750000,
        totalProblemCount: 234560,
        problemRatio: 1.25,
        fixedRate: 67.3,
        monthNewProblem: 12300,
        problemRatioChange: -0.23,
        fixedRateChange: 5.2,
      }
    })
  }),

  http.get('/api/result/chart/trend', async () => {
    await mockDelay()
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return `${d.getMonth() + 1}/${d.getDate()}`
    })
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: {
        dates,
        series: [
          { name: '达州市中医医院',   data: [120, 135, 142, 138, 156, 161, 175] },
          { name: '达州市中心医院',   data: [98, 102, 110, 115, 108, 120, 128] },
          { name: '通川区人民医院',   data: [76, 82, 79, 88, 92, 95, 101] },
          { name: '通川区社区卫生服务中心', data: [45, 48, 52, 50, 55, 58, 62] },
        ],
      },
    })
  }),

  http.get('/api/result/chart/type-dist', async () => {
    await mockDelay()
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: [
        { name: '非空校验',   value: 8542 },
        { name: '值域校验',   value: 5231 },
        { name: '格式校验',   value: 3876 },
        { name: '关联校验',   value: 2145 },
        { name: '逻辑校验',   value: 1320 },
      ],
    })
  }),

  http.get('/api/result/org-ranking', async () => {
    await mockDelay()
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: [
        { rank: 1, orgName: '达州市中医医院',           score: 95.2, issueRatio: 0.8,  rectificationRate: 92 },
        { rank: 2, orgName: '达州市中心医院',           score: 91.4, issueRatio: 1.1,  rectificationRate: 88 },
        { rank: 3, orgName: '通川区人民医院',           score: 87.6, issueRatio: 1.6,  rectificationRate: 81 },
        { rank: 4, orgName: '达川区人民医院',           score: 82.3, issueRatio: 2.0,  rectificationRate: 74 },
        { rank: 5, orgName: '通川区社区卫生服务中心', score: 76.8, issueRatio: 2.8,  rectificationRate: 65 },
      ],
    })
  }),

  http.get('/api/result/alerts', async () => {
    await mockDelay()
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: [
        { id: 1, ruleName: '患者姓名非空检查',       orgName: '达州市中医医院',     datasetName: '门诊记录表',   time: '10分钟前' },
        { id: 2, ruleName: '身份证号格式验证',       orgName: '达州市中心医院',     datasetName: '患者基本信息', time: '32分钟前' },
        { id: 3, ruleName: '出院日期早于入院日期',  orgName: '通川区人民医院',     datasetName: '住院记录表',   time: '1小时前' },
        { id: 4, ruleName: '诊断代码值域校验',       orgName: '达川区人民医院',     datasetName: '诊断记录表',   time: '2小时前' },
        { id: 5, ruleName: '科室代码非空检查',       orgName: '通川区社区卫生服务中心', datasetName: '门诊记录表',  time: '3小时前' },
      ],
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
