<template>
  <div class="page-container">
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/" class="page-breadcrumb">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item
        v-for="(item, idx) in resolvedBreadcrumb"
        :key="idx"
        :to="item.path ? { path: item.path } : undefined"
      >
        {{ item.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Page header: title + actions -->
    <div class="page-header">
      <h2 class="page-title">{{ title }}</h2>
      <div class="page-actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- Content -->
    <div class="page-body">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  /** 页面标题 */
  title: {
    type: String,
    required: true,
  },
  /** 可选：手动覆盖面包屑，格式 [{title, path?}] */
  breadcrumb: {
    type: Array,
    default: null,
  },
})

const route = useRoute()

/** 优先使用 props.breadcrumb，否则从 route.meta.breadcrumb 读取，最后自动生成 */
const resolvedBreadcrumb = computed(() => {
  if (props.breadcrumb) return props.breadcrumb
  if (route.meta?.breadcrumb) return route.meta.breadcrumb
  // 自动生成：从匹配的路由层级提取
  return route.matched
    .filter(r => r.meta?.title)
    .map(r => ({ title: r.meta.title, path: r.path }))
    .slice(0, -1) // 最后一级即当前页，不重复
})
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.page-breadcrumb {
  font-size: 13px;
  color: var(--color-text-secondary, #909399);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary, #303133);
  line-height: 1.4;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.page-body {
  flex: 1;
  min-height: 0;
}
</style>
