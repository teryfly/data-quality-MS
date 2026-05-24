import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import router from '@/router'

const baseURL = import.meta.env.VITE_API_BASE

const request = axios.create({
  baseURL,
  timeout: 30000,
})

request.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

const isLoginRequest = (config) =>
  typeof config?.url === 'string' && config.url.includes('/api/user/login')

request.interceptors.response.use(
  (response) => {
    const body = response.data
    // Non-envelope responses (e.g. binary downloads) pass through untouched
    if (!body || typeof body !== 'object' || !('code' in body)) {
      return body
    }
    const { code, message, data } = body
    if (code !== 200) {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
    return data
  },
  (error) => {
    // For the login endpoint, surface the server's message and let the caller handle it
    // — do NOT logout / redirect, since we're already on /login.
    if (isLoginRequest(error.config)) {
      const message = error.response?.data?.message || '用户名或密码错误'
      ElMessage.error(message)
      return Promise.reject(error)
    }
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      // Use the SPA router instead of window.location to avoid a hard reload
      // (which can race with in-flight chunk loads and look like a "login flash").
      if (router.currentRoute.value.path !== '/login') {
        router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
      }
      return Promise.reject(error)
    }
    const message = error.response?.data?.message || error.message || '网络错误'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export const createRequest = (timeout) => {
  return axios.create({
    baseURL,
    timeout,
  })
}

export default request
