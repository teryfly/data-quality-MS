import { ref, reactive } from 'vue'

/**
 * 封装表格的 init / loading / success / empty / error 五状态管理
 *
 * 用法：
 * ```js
 * const { state, tableData, total, page, pageSize, fetchData } = useTableState()
 *
 * // 初始加载
 * fetchData(api.getList, { page: 1, size: 20 })
 *
 * // 分页变化时重新请求
 * function onPageChange(p) {
 *   page.value = p
 *   fetchData(api.getList, { page: p, size: pageSize.value })
 * }
 * ```
 */
export function useTableState(options = {}) {
  const {
    defaultPageSize = 20,
    /** 自定义数据提取：(apiResponse) => { records, total } */
    extract = defaultExtract,
  } = options

  /** 当前状态：'init' | 'loading' | 'success' | 'empty' | 'error' */
  const state = ref('init')
  const tableData = ref([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(defaultPageSize)
  const errorMsg = ref('')

  /** 计算属性辅助（供 DataTable 直接绑定） */
  const isInit = () => state.value === 'init'
  const isLoading = () => state.value === 'loading'
  const isEmpty = () => state.value === 'empty'
  const isError = () => state.value === 'error'

  /**
   * 执行接口请求并自动管理状态
   * @param {Function} apiFn - 接口函数（返回 Promise）
   * @param {Object} params - 接口参数
   */
  async function fetchData(apiFn, params = {}) {
    state.value = 'loading'
    errorMsg.value = ''

    try {
      const res = await apiFn(params)
      const { records, total: t } = extract(res)

      tableData.value = records
      total.value = t

      state.value = t > 0 ? 'success' : 'empty'
    } catch (err) {
      state.value = 'error'
      errorMsg.value = err?.message || '数据加载失败'
      tableData.value = []
      total.value = 0
    }
  }

  /** 重置到初始状态 */
  function reset() {
    state.value = 'init'
    tableData.value = []
    total.value = 0
    page.value = 1
    errorMsg.value = ''
  }

  return {
    state,
    tableData,
    total,
    page,
    pageSize,
    errorMsg,
    isInit,
    isLoading,
    isEmpty,
    isError,
    fetchData,
    reset,
  }
}

/**
 * 默认响应数据提取器
 * 兼容：{ records, total } | { data: { records, total } } | 数组
 */
function defaultExtract(res) {
  if (!res) return { records: [], total: 0 }

  // 直接包含 records
  if (Array.isArray(res.records)) {
    return { records: res.records, total: res.total ?? res.records.length }
  }

  // 数组形式
  if (Array.isArray(res)) {
    return { records: res, total: res.length }
  }

  // 嵌套 data 字段
  if (res.data) return defaultExtract(res.data)

  return { records: [], total: 0 }
}
