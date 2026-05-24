import { ref, createApp, defineComponent, h } from 'vue'
import ExportLoadingComponent from './index.vue'

/**
 * 全局导出Loading单例
 * 用法:
 *   const exportLoading = useExportLoading()
 *   exportLoading.show()
 *   // ... 等待导出完成
 *   exportLoading.hide()
 */

let instance = null

function createInstance() {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const app = createApp(ExportLoadingComponent)
  const vm = app.mount(container)

  return {
    show: () => vm.show(),
    hide: () => vm.hide(),
    destroy: () => {
      app.unmount()
      document.body.removeChild(container)
      instance = null
    },
  }
}

export function useExportLoading() {
  if (!instance) {
    instance = createInstance()
  }
  return instance
}
