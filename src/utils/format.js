/**
 * 格式化工具函数
 */

/**
 * 千分位格式化数字；0 或空值返回 "-"
 * @param {number|string|null|undefined} n
 * @returns {string}
 */
export function formatNumber(n) {
  if (n === null || n === undefined || n === '') return '-'
  const num = Number(n)
  if (isNaN(num) || num === 0) return '-'
  return num.toLocaleString('zh-CN')
}

/**
 * 百分比格式化
 * @param {number|null|undefined} n - 原始比例值（如 0.856 或 85.6 均可，视 isRatio 参数）
 * @param {number} decimal - 小数位数，默认2
 * @param {boolean} isRatio - 是否为 0~1 的比例（true时自动×100），默认false
 * @returns {string}
 */
export function formatPercent(n, decimal = 2, isRatio = false) {
  if (n === null || n === undefined || isNaN(Number(n))) return '-'
  const val = isRatio ? Number(n) * 100 : Number(n)
  return `${val.toFixed(decimal)}%`
}

/**
 * 日期时间格式化
 * @param {string|number|Date|null|undefined} str
 * @param {string} fmt - 格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string}
 */
export function formatDateTime(str, fmt = 'YYYY-MM-DD HH:mm:ss') {
  if (!str) return '-'
  const d = new Date(str)
  if (isNaN(d.getTime())) return String(str)

  const pad = n => String(n).padStart(2, '0')
  return fmt
    .replace('YYYY', d.getFullYear())
    .replace('MM', pad(d.getMonth() + 1))
    .replace('DD', pad(d.getDate()))
    .replace('HH', pad(d.getHours()))
    .replace('mm', pad(d.getMinutes()))
    .replace('ss', pad(d.getSeconds()))
}

/**
 * 仅格式化日期部分
 * @param {string|number|Date|null|undefined} str
 * @returns {string}
 */
export function formatDate(str) {
  return formatDateTime(str, 'YYYY-MM-DD')
}

/**
 * 秒数转"X分X秒"展示（< 60s 直接显示秒，>= 3600s 加小时）
 * @param {number|null|undefined} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || isNaN(Number(seconds))) return '-'
  const total = Math.round(Number(seconds))
  if (total < 0) return '-'
  if (total === 0) return '0秒'

  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60

  const parts = []
  if (h > 0) parts.push(`${h}小时`)
  if (m > 0) parts.push(`${m}分`)
  if (s > 0 || parts.length === 0) parts.push(`${s}秒`)
  return parts.join('')
}

/**
 * 文件大小格式化
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
