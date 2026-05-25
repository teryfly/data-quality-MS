import { ElMessageBox } from 'element-plus'

const defaultOptions = {
  center: true,
  draggable: false,
  confirmButtonText: '确定',
  cancelButtonText: '取消',
}

export const showConfirm = (message, title = '提示', options = {}) => {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  }
  return ElMessageBox.confirm(message, title, mergedOptions)
}

export const showWarningConfirm = (message, title = '确认', options = {}) => {
  const mergedOptions = {
    ...defaultOptions,
    type: 'warning',
    ...options,
  }
  return ElMessageBox.confirm(message, title, mergedOptions)
}

export const showDeleteConfirm = (message, title = '删除确认', options = {}) => {
  const mergedOptions = {
    ...defaultOptions,
    type: 'warning',
    confirmButtonText: '确定删除',
    ...options,
  }
  return ElMessageBox.confirm(message, title, mergedOptions)
}

export const showInfoConfirm = (message, title = '提示', options = {}) => {
  const mergedOptions = {
    ...defaultOptions,
    type: 'info',
    ...options,
  }
  return ElMessageBox.confirm(message, title, mergedOptions)
}
