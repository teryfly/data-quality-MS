import { http, HttpResponse } from 'msw'
import { mockDelay, mockPaginate } from '../utils.js'
import {
  getOrgs, addOrg, updateOrg, deleteOrg,
  getUsers, addUser, updateUser, deleteUser, resetPassword,
  getRoles, addRole, updateRole, deleteRole,
} from '../store/systemStore.js'

// 完整权限树（覆盖 SRS_Frontend.md 2.4 全部权限标识）
const permissionTree = [
  {
    id: 'datasource',
    label: '数据源管理',
    children: [
      { id: 'datasource:view', label: '查看数据源' },
      { id: 'datasource:add', label: '新增数据源' },
      { id: 'datasource:edit', label: '编辑数据源' },
      { id: 'datasource:delete', label: '删除数据源' },
      { id: 'datasource:sync', label: '触发同步' },
    ],
  },
  {
    id: 'dataset',
    label: '数据集管理',
    children: [
      { id: 'dataset:view', label: '查看数据集' },
      { id: 'dataset:edit', label: '编辑数据集' },
      { id: 'dataset:sync', label: '同步字段' },
    ],
  },
  {
    id: 'upload',
    label: '数据上传监控',
    children: [
      { id: 'upload:view', label: '查看上传监控' },
      { id: 'upload:export', label: '导出上传数据' },
    ],
  },
  {
    id: 'rule',
    label: '质控规则',
    children: [
      { id: 'rule:view', label: '查看规则' },
      { id: 'rule:add', label: '新增规则' },
      { id: 'rule:edit', label: '编辑规则' },
      { id: 'rule:delete', label: '删除规则' },
      { id: 'rule:test', label: '测试规则' },
      { id: 'rule:export', label: '导出规则' },
      { id: 'rule:import', label: '导入规则' },
      { id: 'rule:batch-enable', label: '批量启用/禁用' },
      { id: 'template:apply', label: '应用模板' },
    ],
  },
  {
    id: 'result',
    label: '质控结果',
    children: [
      { id: 'result:view', label: '查看质控结果' },
      { id: 'result:export', label: '导出结果' },
      { id: 'result:fix', label: '标记整改' },
    ],
  },
  {
    id: 'report',
    label: '数据质量报告',
    children: [
      { id: 'report:view', label: '查看报告' },
      { id: 'report:export', label: '导出报告' },
    ],
  },
  {
    id: 'system',
    label: '系统管理',
    children: [
      { id: 'system:org', label: '机构管理' },
      { id: 'system:user', label: '用户管理' },
      { id: 'system:role', label: '角色管理' },
    ],
  },
]

// 系统预置角色 ID（不允许删除）
const SYSTEM_ROLE_IDS = [1, 2, 3, 4]

export const systemHandlers = [
  /* ── 机构管理 ──────────────────────────────────────────────────── */
  http.get('/api/system/org', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20
    const orgName = url.searchParams.get('orgName') || ''
    const districtCode = url.searchParams.get('districtCode') || ''
    const status = url.searchParams.get('status')

    let list = getOrgs()
    if (orgName) list = list.filter(o => o.orgName.includes(orgName))
    if (districtCode) list = list.filter(o => o.districtCode === districtCode)
    if (status !== null && status !== '') list = list.filter(o => String(o.status) === status)

    const result = mockPaginate(list, page, size)
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
    const payload = await request.json()
    const updated = updateOrg(Number(params.id), payload)
    return HttpResponse.json({ code: 200, message: '机构更新成功', data: updated })
  }),

  /* ── 用户管理 ──────────────────────────────────────────────────── */
  http.get('/api/system/user', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20
    const username = url.searchParams.get('username') || ''
    const realName = url.searchParams.get('realName') || ''
    const orgId = url.searchParams.get('orgId')
    const roleId = url.searchParams.get('roleId')
    const status = url.searchParams.get('status')

    let list = getUsers()
    if (username) list = list.filter(u => u.username.includes(username))
    if (realName) list = list.filter(u => u.realName.includes(realName))
    if (orgId !== null && orgId !== '') list = list.filter(u => String(u.orgId) === orgId)
    if (roleId !== null && roleId !== '') list = list.filter(u => String(u.roleId) === roleId)
    if (status !== null && status !== '') list = list.filter(u => String(u.status) === status)

    const result = mockPaginate(list, page, size)
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
    const payload = await request.json()
    const updated = updateUser(Number(params.id), payload)
    return HttpResponse.json({ code: 200, message: '用户更新成功', data: updated })
  }),

  http.put('/api/system/user/:id/reset-password', async ({ params, request }) => {
    await mockDelay()
    const { newPassword } = await request.json()
    resetPassword(Number(params.id), newPassword)
    return HttpResponse.json({ code: 200, message: '密码重置成功', data: null })
  }),

  /* ── 角色管理 ──────────────────────────────────────────────────── */
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
    const payload = await request.json()
    const updated = updateRole(Number(params.id), payload)
    return HttpResponse.json({ code: 200, message: '角色更新成功', data: updated })
  }),

  http.delete('/api/system/role/:id', async ({ params }) => {
    await mockDelay()
    const id = Number(params.id)
    if (SYSTEM_ROLE_IDS.includes(id)) {
      return HttpResponse.json({ code: 400, message: '系统预置角色不允许删除', data: null })
    }
    deleteRole(id)
    return HttpResponse.json({ code: 200, message: '角色删除成功', data: null })
  }),

  /* ── 权限树 ────────────────────────────────────────────────────── */
  http.get('/api/system/permission/tree', async () => {
    await mockDelay()
    return HttpResponse.json({ code: 200, message: '成功', data: permissionTree })
  }),
]
