/**
 * 全局公共组件注册
 * 在 main.js 中引入此文件，所有页面无需显式 import 即可直接使用这些组件。
 */
import PageContainer from './PageContainer/index.vue'
import SearchForm from './SearchForm/index.vue'
import DataTable from './DataTable/index.vue'
import StatusTag from './StatusTag/index.vue'
import ElementSelector from './ElementSelector/index.vue'
import ExportLoading from './ExportLoading/index.vue'

const components = [
  PageContainer,
  SearchForm,
  DataTable,
  StatusTag,
  ElementSelector,
  ExportLoading,
]

/**
 * 插件方式安装：app.use(globalComponents)
 * 也可通过 registerGlobalComponents(app) 手动调用
 */
export function registerGlobalComponents(app) {
  components.forEach(component => {
    // 使用组件的 name 选项或文件名作为注册名
    const name = component.name || component.__name || 'Component'
    if (name && name !== 'Component') {
      app.component(name, component)
    }
  })
}

export default {
  install(app) {
    registerGlobalComponents(app)
  },
}

// 具名导出，供按需 import 使用
export {
  PageContainer,
  SearchForm,
  DataTable,
  StatusTag,
  ElementSelector,
  ExportLoading,
}
