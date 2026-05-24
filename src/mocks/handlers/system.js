import { http, HttpResponse } from 'msw'
import { mockDelay, mockPaginate } from '../utils.js'
import { getOrgs, addOrg, updateOrg, deleteOrg, getUsers, addUser, updateUser, deleteUser, resetPassword, getRoles, addRole, updateRole, deleteRole } from '../store/systemStore.js'

const permissionTree = [
  {
    id: 'datasource',
    label: '数据源',
    children: [
      { id: 'datasource:view', label: '查看' },
      { id: 'datasource:add', label: '新增' },
      { id: 'datasource:edit', label: '编辑' },
      { id: 'datasource:delete', label: '删除' },
      { id: 'datasource:sync', label: '同步' }
    ]
  },
  {
    id: 'rule',
    label: '规则管理',
    children: [
      { id: 'rule:view', label: '查看' },
      { id: 'rule:add', label: '新增' },
      { id: 'rule:edit', label: '编辑' },
      { id: 'rule:delete', label: '删除' },
      { id: 'rule:test', label: '测试' },
      { id: 'rule:export', label: '导出' },
      { id: 'rule:import', label: '导入' },
      { id: 'rule:batch-enable', label: '批量启用' },
      { id: 'rule:execute', label: '执行' }
    ]
  },
  {
    id: 'result',
    label: '结果查询',
    children: [
      { id: 'result:view', label: '查看' },
      { id: 'result:export', label: '导出' },
      { id: 'result:fix', label: '整改' }
    ]
  },
  {
    id: 'system',
    label: '系统管理',
    children: [
      { id: 'system:org', label: '机构' },
      { id: 'system:user', label: '用户' },
      { id: 'system:role', label: '角色' }
    ]
  }
]

export const systemHandlers = [
  http.get('/api/system/org', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20
    const result = mockPaginate(getOrgs(), page, size)
    return HttpResponse.json({ code: 200, message: '成功', data: result })
  }),

  http.post('/api/system/org', async ({ request }) => {
    await mockDelay()
    const payload = await request.json()
    const newOrg = addOrg(payload)
    return HttpResponse.json({ code: 200, message: '机构创建成功', data: newOrg })
  }),

  http.put('/api/system/org/:id', async ({ params, request }) => {
    await mockDelay()
    const { id } = params
    const payload = await request.json()
    const updated = updateOrg(Number(id), payload)
    return HttpResponse.json({ code: 200, message: '机构更新成功', data: updated })
  }),

  http.get('/api/system/user', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20
    const result = mockPaginate(getUsers(), page, size)
    return HttpResponse.json({ code: 200, message: '成功', data: result })
  }),

  http.post('/api/system/user', async ({ request }) => {
    await mockDelay()
    const payload = await request.json()
    const newUser = addUser(payload)
    return HttpResponse.json({ code: 200, message: '用户创建成功', data: newUser })
  }),

  http.put('/api/system/user/:id', async ({ params, request }) => {
    await mockDelay()
    const { id } = params
    const payload = await request.json()
    const updated = updateUser(Number(id), payload)
    return HttpResponse.json({ code: 200, message: '用户更新成功', data: updated })
  }),

  http.put('/api/system/user/:id/reset-password', async ({ params, request }) => {
    await mockDelay()
    const { id } = params
    const { newPassword } = await request.json()
    resetPassword(Number(id), newPassword)
    return HttpResponse.json({ code: 200, message: '密码重置成功', data: null })
  }),

  http.get('/api/system/role', async () => {
    await mockDelay()
    return HttpResponse.json({ code: 200, message: '成功', data: getRoles() })
  }),

  http.post('/api/system/role', async ({ request }) => {
    await mockDelay()
    const payload = await request.json()
    const newRole = addRole(payload)
    return HttpResponse.json({ code: 200, message: '角色创建成功', data: newRole })
  }),

  http.put('/api/system/role/:id', async ({ params, request }) => {
    await mockDelay()
    const { id } = params
    const payload = await request.json()
    const updated = updateRole(Number(id), payload)
    return HttpResponse.json({ code: 200, message: '角色更新成功', data: updated })
  }),

  http.get('/api/system/permission/tree', async () => {
    await mockDelay()
    return HttpResponse.json({ code: 200, message: '成功', data: permissionTree })
  })
]
