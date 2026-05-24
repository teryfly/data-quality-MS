import { http, HttpResponse } from 'msw'
import { mockDelay, mockPaginate, createMockBlob } from '../utils.js'
import { mockRuleCategories } from '../data/ruleCategories.js'
import { getRules, addRule, updateRule, deleteRule, batchEnable, batchDelete } from '../store/ruleStore.js'

export const ruleHandlers = [
  http.get('/api/rule/category', async () => {
    await mockDelay()
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: mockRuleCategories
    })
  }),

  http.get('/api/rule', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20
    let rules = getRules()

    const ruleName = url.searchParams.get('ruleName')
    if (ruleName) rules = rules.filter(r => r.ruleName.includes(ruleName))

    const categoryId = url.searchParams.get('categoryId')
    if (categoryId) rules = rules.filter(r => r.categoryId === Number(categoryId))

    const ruleLevel = url.searchParams.get('ruleLevel')
    if (ruleLevel) rules = rules.filter(r => r.ruleLevel === Number(ruleLevel))

    const isEnabled = url.searchParams.get('isEnabled')
    if (isEnabled !== null) rules = rules.filter(r => r.isEnabled === Number(isEnabled))

    const result = mockPaginate(rules, page, size)
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: result
    })
  }),

  http.post('/api/rule', async ({ request }) => {
    await mockDelay()
    const payload = await request.json()
    const newRule = addRule(payload)
    return HttpResponse.json({
      code: 200,
      message: '规则创建成功',
      data: newRule
    })
  }),

  http.put('/api/rule/:id', async ({ params, request }) => {
    await mockDelay()
    const { id } = params
    const payload = await request.json()
    const updated = updateRule(Number(id), payload)
    return HttpResponse.json({
      code: 200,
      message: '规则更新成功',
      data: updated
    })
  }),

  http.delete('/api/rule/:id', async ({ params }) => {
    await mockDelay()
    const { id } = params
    deleteRule(Number(id))
    return HttpResponse.json({
      code: 200,
      message: '规则删除成功',
      data: null
    })
  }),

  http.post('/api/rule/:id/test', async ({ params }) => {
    await mockDelay(2000, 2500)
    const { id } = params
    const problemCount = Math.floor(Math.random() * 100) + 10
    return HttpResponse.json({
      code: 200,
      message: '测试成功',
      data: {
        ruleId: Number(id),
        problemCount,
        problems: Array.from({ length: Math.min(10, problemCount) }, (_, i) => ({
          businessId: `TEST-${id}-${i + 1}`,
          problemValue: `测试问题值${i + 1}`,
          problemDesc: `这是第${i + 1}条测试问题`,
          createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }))
      }
    })
  }),

  http.get('/api/rule/:id/preview-sql', async ({ params }) => {
    const { id } = params
    await mockDelay()
    const sqlTemplates = [
      'SELECT * FROM jbxx_brxx WHERE XM IS NULL OR XM = ""',
      'SELECT * FROM jbxx_brxx WHERE XBM NOT IN ("1", "2")',
      'SELECT * FROM zy_cyxx WHERE CYRQ < RYXJ',
      'SELECT * FROM mz_jzjl WHERE JZSJ > NOW()',
      'SELECT * FROM mz_cf_main main LEFT JOIN mz_cf_detail detail ON main.CFID = detail.CFID WHERE detail.CFID IS NULL'
    ]
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: { sql: sqlTemplates[Number(id) % sqlTemplates.length] }
    })
  }),

  http.put('/api/rule/batch-enable', async ({ request }) => {
    await mockDelay()
    const { ruleIds, isEnabled } = await request.json()
    batchEnable(ruleIds, isEnabled)
    return HttpResponse.json({
      code: 200,
      message: '批量操作成功',
      data: { count: ruleIds.length }
    })
  }),

  http.delete('/api/rule/batch', async ({ request }) => {
    await mockDelay()
    const { ruleIds } = await request.json()
    batchDelete(ruleIds)
    return HttpResponse.json({
      code: 200,
      message: '批量删除成功',
      data: { count: ruleIds.length }
    })
  }),

  http.get('/api/rule/export', async () => {
    await mockDelay(1500, 2500)
    const blob = createMockBlob('规则导出.xlsx')
    return new HttpResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=rules_export.xlsx'
      }
    })
  }),

  http.post('/api/rule/import', async ({ request }) => {
    await mockDelay(2000, 3000)
    const formData = await request.formData()
    return HttpResponse.json({
      code: 200,
      message: '导入成功',
      data: {
        successCount: 28,
        failedCount: 2,
        failures: [
          { rowNumber: 5, ruleName: '某规则1', error: '规则名称重复' },
          { rowNumber: 12, ruleName: '某规则2', error: '必填字段缺失' }
        ]
      }
    })
  })
]
