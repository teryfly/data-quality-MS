import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils.js'
import { mockTemplates } from '../data/templates.js'

// Tracks ids for dynamically created user templates in this session
let nextTemplateId = Math.max(...mockTemplates.map(t => t.id)) + 1

export const templateHandlers = [
  http.get('/api/template', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const tab = url.searchParams.get('tab') || 'system'
    const templates = tab === 'system'
      ? mockTemplates.filter(t => t.templateType === 'system')
      : mockTemplates.filter(t => t.templateType === 'user')
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: { records: templates, total: templates.length }
    })
  }),

  http.get('/api/template/:id/items', async ({ params }) => {
    await mockDelay()
    const { id } = params
    const template = mockTemplates.find(t => t.id === Number(id))
    if (!template) {
      return HttpResponse.json({ code: 404, message: '模板不存在', data: null })
    }
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: template.rules || []
    })
  }),

  http.post('/api/template/:id/apply', async ({ params, request }) => {
    await mockDelay(1500, 1500)
    const { id } = params
    const payload = await request.json()
    return HttpResponse.json({
      code: 200,
      message: '模板应用成功',
      data: { appliedRuleCount: 6, datasetId: payload.datasetId }
    })
  }),

  http.delete('/api/template/:id', async ({ params }) => {
    await mockDelay()
    const idx = mockTemplates.findIndex(t => t.id === Number(params.id))
    if (idx !== -1) mockTemplates.splice(idx, 1)
    return HttpResponse.json({ code: 200, message: '删除成功', data: null })
  }),

  http.post('/api/template', async ({ request }) => {
    await mockDelay()
    const payload = await request.json()
    const newTemplate = {
      id: nextTemplateId++,
      templateName: payload.templateName || '未命名模板',
      description: payload.description || '',
      templateType: 'user',
      isEnabled: 1,
      createdBy: payload.createdBy || 'org_admin',
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ruleIds: payload.ruleIds || [],
      rules: payload.rules || [],
    }
    mockTemplates.unshift(newTemplate)
    return HttpResponse.json({
      code: 200,
      message: '模板保存成功',
      data: { templateId: newTemplate.id, templateName: newTemplate.templateName }
    })
  })
]
