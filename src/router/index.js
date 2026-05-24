import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/index.vue'),
        meta: { title: '首页概览' },
      },
      {
        path: 'datasource',
        name: 'DataSource',
        component: () => import('@/views/datasource/index.vue'),
        meta: { title: '数据源管理' },
      },
      {
        path: 'datasource/dataset',
        name: 'DataSet',
        component: () => import('@/views/datasource/dataset/index.vue'),
        meta: { title: '数据集配置' },
      },
      {
        path: 'datasource/codeset-calibration',
        name: 'CodesetCalibration',
        component: () => import('@/views/datasource/codeset-calibration/index.vue'),
        meta: { title: '代码集校准' },
      },
      {
        path: 'upload-monitor',
        name: 'UploadMonitor',
        component: () => import('@/views/upload-monitor/index.vue'),
        meta: { title: '数据上传监控' },
      },
      {
        path: 'rule/category',
        name: 'RuleCategory',
        component: () => import('@/views/Rule/Category.vue'),
        meta: { title: '规则分类' },
      },
      {
        path: 'rule/list',
        name: 'RuleList',
        component: () => import('@/views/Rule/List.vue'),
        meta: { title: '规则列表' },
      },
      {
        path: 'rule/template',
        name: 'RuleTemplate',
        component: () => import('@/views/Rule/Template.vue'),
        meta: { title: '规则模板' },
      },
      {
        path: 'rule/execute',
        name: 'RuleExecute',
        component: () => import('@/views/Rule/Execute.vue'),
        meta: { title: '手动执行' },
      },
      {
        path: 'result/overview',
        name: 'ResultOverview',
        component: () => import('@/views/result/overview/index.vue'),
        meta: { title: '全局统计', permission: 'result:view' },
      },
      {
        path: 'result/by-rule',
        name: 'ResultByRule',
        component: () => import('@/views/result/by-rule/index.vue'),
        meta: { title: '按规则统计', permission: 'result:view' },
      },
      {
        path: 'result/detail',
        name: 'ResultDetail',
        component: () => import('@/views/result/detail/index.vue'),
        meta: { title: '问题明细', permission: 'result:view' },
      },
      {
        path: 'report',
        name: 'Report',
        component: () => import('@/views/Report/index.vue'),
        meta: { title: '数据质量报告' },
      },
      {
        path: 'system/org',
        name: 'SystemOrg',
        component: () => import('@/views/System/Org.vue'),
        meta: { title: '机构管理' },
      },
      {
        path: 'system/user',
        name: 'SystemUser',
        component: () => import('@/views/System/User.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'system/role',
        name: 'SystemRole',
        component: () => import('@/views/System/Role.vue'),
        meta: { title: '角色管理' },
      },
      {
        path: 'notification',
        name: 'Notification',
        component: () => import('@/views/Notification/index.vue'),
        meta: { title: '通知消息' },
      },
    ],
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/Error/403.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/Error/404.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth === false) {
    // 已登录用户访问 /login，重定向到 redirect 参数或首页
    if (to.path === '/login' && authStore.token) {
      const redirect = to.query.redirect
      next(redirect && redirect !== '/login' ? redirect : '/dashboard')
      return
    }
    next()
    return
  }

  if (!authStore.token) {
    // 保存目标路径，登录后跳回
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  next()
})

// Recover from Vite "Outdated Optimize Dep" / chunk load failures, which surface as
// "Failed to fetch dynamically imported module" during route navigation. Without this,
// router.push silently cancels and the user appears stuck on the previous page.
const isChunkLoadError = (err) => {
  const msg = err?.message || ''
  return (
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Outdated Optimize Dep/i.test(msg)
  )
}

router.onError((err, to) => {
  if (isChunkLoadError(err)) {
    const target = to?.fullPath || window.location.pathname + window.location.search
    window.location.replace(target)
  }
})

export default router
