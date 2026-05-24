import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const AUTH_KEYS = [
  'auth_token', 'auth_userId', 'auth_orgId', 'auth_orgCode',
  'auth_orgName', 'auth_roleId', 'auth_roleName', 'auth_dataScope',
  'auth_permissions', 'auth_realName',
]

// Check both storages; localStorage takes priority
const getStored = (key) =>
  localStorage.getItem(key) ?? sessionStorage.getItem(key) ?? null

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getStored('auth_token') || '')
  const userId = ref(JSON.parse(getStored('auth_userId') || 'null'))
  const orgId = ref(JSON.parse(getStored('auth_orgId') || 'null'))
  const orgCode = ref(getStored('auth_orgCode') || '')
  const orgName = ref(getStored('auth_orgName') || '')
  const roleId = ref(JSON.parse(getStored('auth_roleId') || 'null'))
  const roleName = ref(getStored('auth_roleName') || '')
  const dataScope = ref(JSON.parse(getStored('auth_dataScope') || 'null'))
  const permissions = ref(JSON.parse(getStored('auth_permissions') || '[]'))
  const realName = ref(getStored('auth_realName') || '')

  const isAuthenticated = computed(() => !!token.value)

  /**
   * @param {object} data - login response data
   * @param {boolean} rememberMe - if true, persist to localStorage; otherwise sessionStorage
   */
  const setAuth = (data, rememberMe = true) => {
    token.value = data.token || ''
    userId.value = data.userId ?? null
    orgId.value = data.orgId ?? null
    orgCode.value = data.orgCode || ''
    orgName.value = data.orgName || ''
    roleId.value = data.roleId ?? null
    roleName.value = data.roleName || ''
    dataScope.value = data.dataScope ?? null
    permissions.value = data.permissions || []
    realName.value = data.realName || ''

    // Clear both storages to avoid stale data across modes
    AUTH_KEYS.forEach(k => {
      localStorage.removeItem(k)
      sessionStorage.removeItem(k)
    })

    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem('auth_token', token.value)
    storage.setItem('auth_userId', JSON.stringify(userId.value))
    storage.setItem('auth_orgId', JSON.stringify(orgId.value))
    storage.setItem('auth_orgCode', orgCode.value)
    storage.setItem('auth_orgName', orgName.value)
    storage.setItem('auth_roleId', JSON.stringify(roleId.value))
    storage.setItem('auth_roleName', roleName.value)
    storage.setItem('auth_dataScope', JSON.stringify(dataScope.value))
    storage.setItem('auth_permissions', JSON.stringify(permissions.value))
    storage.setItem('auth_realName', realName.value)
  }

  const logout = () => {
    token.value = ''
    userId.value = null
    orgId.value = null
    orgCode.value = ''
    orgName.value = ''
    roleId.value = null
    roleName.value = ''
    dataScope.value = null
    permissions.value = []
    realName.value = ''

    AUTH_KEYS.forEach(k => {
      localStorage.removeItem(k)
      sessionStorage.removeItem(k)
    })
  }

  const hasPermission = (key) => permissions.value.includes(key)

  return {
    token,
    userId,
    orgId,
    orgCode,
    orgName,
    roleId,
    roleName,
    dataScope,
    permissions,
    realName,
    isAuthenticated,
    setAuth,
    logout,
    hasPermission,
  }
})
