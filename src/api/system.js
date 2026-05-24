import request from '@/utils/request'

/* ── 机构管理 ─────────────────────────────────────────────────────── */

/**
 * 机构列表
 * @param {object} params - { orgName?, districtCode?, status?, page, size }
 */
export function getOrgList(params = {}) {
  return request.get('/api/system/org', { params })
}

/**
 * 新增机构
 * @param {object} data
 */
export function createOrg(data) {
  return request.post('/api/system/org', data)
}

/**
 * 编辑机构
 * @param {number} id
 * @param {object} data
 */
export function updateOrg(id, data) {
  return request.put(`/api/system/org/${id}`, data)
}

/* ── 用户管理 ─────────────────────────────────────────────────────── */

/**
 * 用户列表
 * @param {object} params - { username?, realName?, orgId?, roleId?, status?, page, size }
 */
export function getUserList(params = {}) {
  return request.get('/api/system/user', { params })
}

/**
 * 新增用户
 * @param {object} data
 */
export function createUser(data) {
  return request.post('/api/system/user', data)
}

/**
 * 编辑用户
 * @param {number} id
 * @param {object} data
 */
export function updateUser(id, data) {
  return request.put(`/api/system/user/${id}`, data)
}

/**
 * 重置密码
 * @param {number} id
 * @param {object} data - { newPassword }
 */
export function resetUserPassword(id, data) {
  return request.put(`/api/system/user/${id}/reset-password`, data)
}

/* ── 角色管理 ─────────────────────────────────────────────────────── */

/**
 * 角色列表
 */
export function getRoleList() {
  return request.get('/api/system/role')
}

/**
 * 新增角色
 * @param {object} data
 */
export function createRole(data) {
  return request.post('/api/system/role', data)
}

/**
 * 编辑角色（含权限）
 * @param {number} id
 * @param {object} data
 */
export function updateRole(id, data) {
  return request.put(`/api/system/role/${id}`, data)
}

/**
 * 删除角色
 * @param {number} id
 */
export function deleteRole(id) {
  return request.delete(`/api/system/role/${id}`)
}

/* ── 权限树 ───────────────────────────────────────────────────────── */

/**
 * 获取权限树
 */
export function getPermissionTree() {
  return request.get('/api/system/permission/tree')
}
