import { useAuthStore } from '@/store/auth'

export const hasPermission = (key) => {
  const authStore = useAuthStore()
  return authStore.hasPermission(key)
}

export const checkPermissions = (keys, mode = 'and') => {
  const authStore = useAuthStore()

  if (mode === 'and') {
    return keys.every((key) => authStore.hasPermission(key))
  } else if (mode === 'or') {
    return keys.some((key) => authStore.hasPermission(key))
  }

  return false
}
