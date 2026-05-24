<template>
  <div class="breadcrumb-bar">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">
        <el-icon style="vertical-align: middle; margin-right: 4px"><HomeFilled /></el-icon>
        首页
      </el-breadcrumb-item>
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbs"
        :key="item.path"
        :to="index < breadcrumbs.length - 1 ? { path: item.path } : undefined"
      >
        {{ item.label }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
import { HomeFilled } from '@element-plus/icons-vue'

const route = useRoute()

const breadcrumbs = computed(() => {
  // Skip breadcrumb on dashboard itself (home = dashboard)
  if (route.path === '/dashboard' || route.path === '/') return []

  // Use matched routes filtered by having a title in meta
  return route.matched
    .filter(r => r.meta?.title)
    .map(r => ({
      path: r.path,
      label: r.meta.title,
    }))
})
</script>

<style scoped>
.breadcrumb-bar {
  height: var(--layout-breadcrumb-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  background-color: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.breadcrumb-bar :deep(.el-breadcrumb__item) {
  font-size: 13px;
}

.breadcrumb-bar :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--color-text-primary);
  font-weight: 500;
}
</style>
