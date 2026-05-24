import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const notificationCount = ref(3)

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setNotificationCount = (count) => {
    notificationCount.value = count
  }

  return {
    sidebarCollapsed,
    notificationCount,
    toggleSidebar,
    setNotificationCount,
  }
})
