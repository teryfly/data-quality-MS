/**
 * 文件下载工具函数
 * 遵循 SRS_Frontend.md §10.4 文件下载处理规范
 */

/**
 * 从 axios 响应（文件流）触发浏览器下载
 * @param {import('axios').AxiosResponse} response - axios 响应对象（responseType: 'blob'）
 * @param {string} [fallbackName='download'] - 当响应头无法解析文件名时的备用名
 */
export function downloadFile(response, fallbackName = 'download') {
  // 从 Content-Disposition 解析文件名
  let fileName = fallbackName
  const disposition = response.headers?.['content-disposition'] || ''
  if (disposition) {
    // 兼容 filename*=UTF-8''xxx 和 filename=xxx 两种格式
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
    if (utf8Match) {
      fileName = decodeURIComponent(utf8Match[1])
    } else {
      const plainMatch = disposition.match(/filename=["']?([^"';]+)["']?/i)
      if (plainMatch) {
        try {
          fileName = decodeURIComponent(plainMatch[1])
        } catch {
          fileName = plainMatch[1]
        }
      }
    }
  }

  triggerDownload(response.data, fileName)
}

/**
 * 通过 Blob 触发浏览器下载并释放对象 URL
 * @param {Blob|ArrayBuffer} data - 文件数据
 * @param {string} fileName - 下载文件名
 */
export function triggerDownload(data, fileName) {
  const blob = data instanceof Blob ? data : new Blob([data])
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()

  // 释放资源
  requestAnimationFrame(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  })
}

/**
 * 通过 URL 直接触发下载（适合后端直接返回下载链接的场景）
 * @param {string} url - 文件 URL
 * @param {string} [filename] - 下载文件名（浏览器可能忽略跨域场景）
 */
export function downloadByUrl(url, filename) {
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  if (filename) link.download = filename
  document.body.appendChild(link)
  link.click()
  requestAnimationFrame(() => {
    document.body.removeChild(link)
  })
}
