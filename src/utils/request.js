import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'

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

request.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data
    if (code !== 200) {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
    return data
  },
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = '/login'
    }
    const message = error.message || '网络错误'
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
