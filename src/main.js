import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { vPermission } from '@/directives/permission'
import { vConfirmDelete } from '@/directives/confirmDelete'
import globalComponents from '@/components/index.js'
import '@/styles/global.css'

const app = createApp(App)

app.use(ElementPlus, { locale: zhCn })
app.use(createPinia())
app.use(router)
app.use(globalComponents)

app.directive('permission', vPermission)
app.directive('confirm-delete', vConfirmDelete)

// Enable MSW in development
if (import.meta.env.VITE_MOCK === 'true') {
  import('./mocks/browser').then(({ worker }) => {
    worker.start({ onUnhandledRequest: 'bypass' }).then(() => {
      app.mount('#app')
    })
  })
} else {
  app.mount('#app')
}
