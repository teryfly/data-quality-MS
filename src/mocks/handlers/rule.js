import { http, HttpResponse } from 'msw'
import { mockDelay, mockPaginate, createMockBlob } from '../utils.js'
import { mockRuleCategories } from '../data/ruleCategories.js'
import { getRules, addRule, updateRule, deleteRule, batchEnable, batchDelete } from '../store/ruleStore.js'

let categoriesStore = JSON.parse(JSON.stringify(mockRuleCategories))
let categoryIdSeq = categoriesStore.length + 1

export const ruleHandlers = [
  http.get('/api/rule/category', async () => {
    await mockDelay()
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: categoriesStore
    })
  }),

  http.post('/api/rule/category', async ({ request }) => {
    await mockDelay()
    const body = await request.json()
    const newCat = { id: categoryIdSeq++, ...body }
    categoriesStore.unshift(newCat)
    return HttpResponse.json({ code: 200, message: '创建成功', data: newCat })
  }),

  http.put('/api/rule/category/:id', async ({ params, request }) => {
    await mockDelay()
    const { id } = params
    const body = await request.json()
    const idx = categoriesStore.findIndex(c => c.id === Number(id))
    if (idx >= 0) { categoriesStore[idx] = { ...categoriesStore[idx], ...body } }
    return HttpResponse.json({ code: 200, message: '更新成功', data: categoriesStore[idx] })
  }),

  http.delete('/api/rule/category/:id', async ({ params }) => {
    await mockDelay()
    const { id } = params
    categoriesStore = categoriesStore.filter(c => c.id !== Number(id))
    return HttpResponse.json({ code: 200, message: '删除成功', data: null })
  }),

  http.put('/api/rule/category/sort', async ({ request }) => {
    await mockDelay()
    const { ids } = await request.json()
    ids.forEach((id, index) => {
      const cat = categoriesStore.find(c => c.id === id)
      if (cat) cat.sortOrder = index + 1
    })
    return HttpResponse.json({ code: 200, message: '排序更新成功', data: null })
  }),

  http.post('/api/rule/validate-sql', async ({ request }) => {
    await mockDelay(500, 800)
    const { expr } = await request.json()
    const hasError = expr && expr.includes('ERROR')
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: { valid: !hasError, error: hasError ? 'SQL语法错误：无效的字段引用' : null }
    })
  }),

  http.get('/api/rule/template/download', async () => {
    await mockDelay(800, 1200)
    const blob = createMockBlob('规则导入模板.xlsx')
    return new HttpResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=rule_import_template.xlsx'
      }
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
