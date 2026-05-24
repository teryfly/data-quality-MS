<template>
  <div
    class="sidebar-wrapper"
    :class="{ 'is-collapsed': uiStore.sidebarCollapsed }"
  >
    <el-scrollbar>
      <el-menu
        :default-active="activeRoute"
        :collapse="uiStore.sidebarCollapsed"
        :collapse-transition="true"
        background-color="#001529"
        text-color="rgba(255,255,255,0.75)"
        active-text-color="#ffffff"
        router
        unique-opened
        class="sidebar-menu"
      >
        <!-- Dashboard -->
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>首页概览</template>
        </el-menu-item>

        <!-- 数据源管理 — 仅超级管理员 -->
        <el-menu-item
          v-if="hasPermission('datasource:view')"
          index="/datasource"
        >
          <el-icon><DataLine /></el-icon>
          <template #title>数据源管理</template>
        </el-menu-item>

        <!-- 数据集配置 — 仅超级管理员 -->
        <el-menu-item
          v-if="hasPermission('dataset:view')"
          index="/datasource/dataset"
        >
          <el-icon><Grid /></el-icon>
          <template #title>数据集配置</template>
        </el-menu-item>

        <!-- 代码集校准 — 仅超级管理员 -->
        <el-menu-item
          v-if="hasPermission('codeset:calibrate')"
          index="/datasource/codeset-calibration"
        >
          <el-icon><EditPen /></el-icon>
          <template #title>代码集校准</template>
        </el-menu-item>

        <!-- 数据上传监控 — 全部角色 -->
        <el-menu-item
          v-if="hasPermission('upload:view')"
          index="/upload-monitor"
        >
          <el-icon><Upload /></el-icon>
          <template #title>数据上传监控</template>
        </el-menu-item>

        <!-- 质控规则管理 — rule:view -->
        <el-sub-menu
          v-if="hasPermission('rule:view')"
          index="sub-rule"
        >
          <template #title>
            <el-icon><DocumentCopy /></el-icon>
            <span>质控规则管理</span>
          </template>
          <!-- 规则分类 — 仅超级管理员 -->
          <el-menu-item
            v-if="hasPermission('rule:delete')"
            index="/rule/category"
          >
            <el-icon><Tickets /></el-icon>
            规则分类
          </el-menu-item>
          <!-- 规则列表 -->
          <el-menu-item index="/rule/list">
            <el-icon><Document /></el-icon>
            规则列表
          </el-menu-item>
          <!-- 规则模板 -->
          <el-menu-item index="/rule/template">
            <el-icon><CopyDocument /></el-icon>
            规则模板
          </el-menu-item>
          <!-- 手动执行 -->
          <el-menu-item
            v-if="hasPermission('rule:execute')"
            index="/rule/execute"
          >
            <el-icon><VideoPlay /></el-icon>
            手动执行
          </el-menu-item>
        </el-sub-menu>

        <!-- 质控结果 — result:view -->
        <el-sub-menu
          v-if="hasPermission('result:view')"
          index="sub-result"
        >
          <template #title>
            <el-icon><Monitor /></el-icon>
            <span>质控结果</span>
          </template>
          <el-menu-item index="/result/overview">
            <el-icon><TrendCharts /></el-icon>
            全局统计
          </el-menu-item>
          <el-menu-item index="/result/by-rule">
            <el-icon><Histogram /></el-icon>
            按规则统计
          </el-menu-item>
          <el-menu-item index="/result/detail">
            <el-icon><Warning /></el-icon>
            问题明细
          </el-menu-item>
        </el-sub-menu>

        <!-- 数据质量报告 — report:view -->
        <el-menu-item
          v-if="hasPermission('report:view')"
          index="/report"
        >
          <el-icon><Memo /></el-icon>
          <template #title>数据质量报告</template>
        </el-menu-item>

        <!-- 通知消息 — 全部登录用户可见 -->
        <el-menu-item index="/notification">
          <el-icon><Bell /></el-icon>
          <template #title>通知消息</template>
        </el-menu-item>

        <!-- 系统管理 -->
        <el-sub-menu
          v-if="hasSystemMenu"
          index="sub-system"
        >
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item
            v-if="hasPermission('system:org')"
            index="/system/org"
          >
            <el-icon><OfficeBuilding /></el-icon>
            机构管理
          </el-menu-item>
          <el-menu-item
            v-if="hasPermission('system:user')"
            index="/system/user"
          >
            <el-icon><User /></el-icon>
            用户管理
          </el-menu-item>
          <el-menu-item
            v-if="hasPermission('system:role')"
            index="/system/role"
          >
            <el-icon><UserFilled /></el-icon>
            角色管理
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import {
  DataBoard, DataLine, Grid, EditPen, Upload,
  DocumentCopy, Tickets, Document, CopyDocument, VideoPlay,
  Monitor, TrendCharts, Histogram, Warning,
  Memo, Setting, OfficeBuilding, User, UserFilled, Bell,
} from '@element-plus/icons-vue'
import { useUiStore } from '@/store/ui'
import { useAuthStore } from '@/store/auth'

const route = useRoute()
const uiStore = useUiStore()
const authStore = useAuthStore()

const activeRoute = computed(() => route.path)

const hasPermission = (key) => authStore.hasPermission(key)

const hasSystemMenu = computed(() =>
  hasPermission('system:org') ||
  hasPermission('system:user') ||
  hasPermission('system:role')
)
</script>

<style scoped>
.sidebar-wrapper {
  width: var(--layout-sidebar-width);
  height: calc(100vh - var(--layout-topbar-height));
  background-color: #001529;
  transition: width 0.3s ease;
  flex-shrink: 0;
  overflow: hidden;
}

.sidebar-wrapper.is-collapsed {
  width: var(--layout-sidebar-collapsed-width);
}

.sidebar-menu {
  border-right: none !important;
  height: 100%;
}

/* Active item: blue background, white text */
.sidebar-wrapper :deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
  color: #ffffff !important;
}

/* Hover state */
.sidebar-wrapper :deep(.el-menu-item:hover),
.sidebar-wrapper :deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
}

/* Sub-menu background */
.sidebar-wrapper :deep(.el-sub-menu .el-menu) {
  background-color: #000c17 !important;
}

/* Sub-menu item height */
.sidebar-wrapper :deep(.el-menu-item),
.sidebar-wrapper :deep(.el-sub-menu__title) {
  height: 46px;
  line-height: 46px;
}

/* Parent title when child is active */
.sidebar-wrapper :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: #1890ff !important;
}

/* Scrollbar style */
.sidebar-wrapper :deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}
</style>
