<template>
  <!-- 铃铛 + Popover 面板 -->
  <el-popover
    v-model:visible="popoverVisible"
    placement="bottom-end"
    :width="360"
    trigger="click"
    popper-class="notification-popover"
    :show-arrow="true"
  >
    <!-- 触发器：铃铛图标 + 未读徽标 -->
    <template #reference>
      <div class="bell-wrap">
        <el-badge
          :value="badgeValue"
          :hidden="notificationStore.unreadCount === 0"
          type="danger"
          class="bell-badge"
        >
          <el-icon class="bell-icon"><Bell /></el-icon>
        </el-badge>
      </div>
    </template>

    <!-- 面板内容 -->
    <div class="noti-panel">
      <!-- 标题行 -->
      <div class="noti-header">
        <span class="noti-title">通知消息</span>
        <el-button
          type="primary"
          link
          size="small"
          :disabled="notificationStore.unreadCount === 0"
          @click="handleMarkAllRead"
        >
          全部标为已读
        </el-button>
      </div>

      <!-- 通知列表 -->
      <el-scrollbar max-height="360px" class="noti-scrollbar">
        <div v-if="notificationStore.latestList.length === 0" class="noti-empty">
          <el-empty description="暂无通知消息" :image-size="48" />
        </div>

        <div
          v-for="item in notificationStore.latestList"
          :key="item.id"
          class="noti-item"
          :class="{ 'is-unread': item.isRead === 0 }"
          @click="handleItemClick(item)"
        >
          <!-- 左侧彩色圆点 -->
          <span
            class="noti-dot"
            :style="{ background: getTypeColor(item.type) }"
          />

          <!-- 内容区 -->
          <div class="noti-body">
            <div class="noti-item-title">{{ item.title }}</div>
            <div class="noti-content">{{ item.content }}</div>
            <div class="noti-meta">
              <span class="noti-time">{{ item.createTime }}</span>
              <el-tag
                v-if="item.isRead === 0"
                type="danger"
                size="small"
                effect="plain"
                class="noti-unread-tag"
              >未读</el-tag>
              <span v-else class="noti-read-text">已读</span>
            </div>
          </div>
        </div>
      </el-scrollbar>

      <!-- 底部按钮 -->
      <div class="noti-footer">
        <el-button type="primary" link @click="goToAllNotifications">
          查看全部通知 →
        </el-button>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/store/notification'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const { notificationStore } = useNotification()

const popoverVisible = ref(false)

/** 99+ 截断 */
const badgeValue = computed(() => {
  const cnt = notificationStore.unreadCount
  return cnt > 99 ? '99+' : cnt
})

// ── 通知类型 → 颜色映射（SRS_Supply.md 9.3）─────────────────────────────
const TYPE_COLOR_MAP = {
  recheck_pass:          '#52c41a', // 绿色
  recheck_fail:          '#ff4d4f', // 红色
  execute_done:          '#1890ff', // 蓝色
  execute_partial_fail:  '#faad14', // 橙色
  sync_done:             '#52c41a', // 绿色
  sync_fail:             '#ff4d4f', // 红色
  report_ready:          '#1890ff', // 蓝色
}

const getTypeColor = (type) => TYPE_COLOR_MAP[type] ?? '#909399'

// ── 通知类型 → 跳转路由（SRS_Supply.md 9.3）──────────────────────────────
const getTargetRoute = (item) => {
  switch (item.type) {
    case 'recheck_pass':
    case 'recheck_fail':
      return '/result/detail'
    case 'execute_done':
    case 'execute_partial_fail':
      return '/rule/execute'
    case 'sync_done':
      return '/datasource/codeset-calibration'
    case 'sync_fail':
      return '/datasource'
    case 'report_ready':
      return '/report'
    default:
      return null
  }
}

// ── 事件处理 ──────────────────────────────────────────────────────────────
const handleItemClick = async (item) => {
  if (item.isRead === 0) {
    await notificationStore.markRead(item.id)
  }
  const route = getTargetRoute(item)
  if (route) {
    popoverVisible.value = false
    router.push(route)
  }
}

const handleMarkAllRead = async () => {
  await notificationStore.markAllRead()
}

const goToAllNotifications = () => {
  popoverVisible.value = false
  router.push('/notification')
}
</script>

<style scoped>
.bell-wrap {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.bell-badge :deep(.el-badge__content) {
  font-size: 11px;
  padding: 0 4px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
}

.bell-icon {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.75);
  transition: color 0.2s;
}

.bell-wrap:hover .bell-icon {
  color: white;
}

/* ── Panel ────────────────────────────────────────────────────── */
.noti-panel {
  padding: 0;
}

.noti-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 10px;
  border-bottom: 1px solid var(--el-border-color-lighter, #f0f0f0);
}

.noti-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
}

.noti-scrollbar {
  min-height: 48px;
}

.noti-empty {
  padding: 24px 0;
}

/* ── Notification item ─────────────────────────────────────────── */
.noti-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter, #f0f0f0);
  cursor: pointer;
  transition: background 0.15s;
}

.noti-item:last-child {
  border-bottom: none;
}

.noti-item:hover {
  background: #f5f7fa;
}

.noti-item.is-unread {
  background: #fafcff;
}

.noti-item.is-unread:hover {
  background: #f0f5ff;
}

.noti-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
}

.noti-body {
  flex: 1;
  min-width: 0;
}

.noti-item-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary, #303133);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 3px;
}

.noti-content {
  font-size: 12px;
  color: var(--el-text-color-secondary, #606266);
  line-height: 1.5;
  /* 最多2行截断 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
}

.noti-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.noti-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder, #909399);
}

.noti-unread-tag {
  font-size: 10px;
  padding: 0 4px;
  height: 16px;
  line-height: 14px;
}

.noti-read-text {
  font-size: 11px;
  color: var(--el-text-color-placeholder, #909399);
}

/* ── Footer ───────────────────────────────────────────────────── */
.noti-footer {
  text-align: center;
  padding: 10px 16px;
  border-top: 1px solid var(--el-border-color-lighter, #f0f0f0);
}
</style>

<style>
/* 全局样式：让 el-popover 的 box-shadow 更现代 */
.notification-popover {
  padding: 0 !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12) !important;
}
</style>
