import { useAuthStore } from '@/store/auth'

export const vPermission = {
  mounted(el, binding) {
    const authStore = useAuthStore()
    const permission = binding.value

    if (!authStore.hasPermission(permission)) {
      el.style.display = 'none'
    }
  },
}

export default vPermission
