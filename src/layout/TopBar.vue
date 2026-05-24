<template>
  <div class="topbar">
    <!-- Left: Logo + System name + Sidebar toggle -->
    <div class="topbar-left">
      <div class="logo-wrap">
        <!-- Medical cross SVG -->
        <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
          <rect x="9" y="2" width="6" height="20" rx="2"/>
          <rect x="2" y="9" width="20" height="6" rx="2"/>
        </svg>
      </div>
      <span class="system-name">医疗数据质控平台</span>
      <el-icon class="toggle-btn" @click="uiStore.toggleSidebar">
        <component :is="uiStore.sidebarCollapsed ? Expand : Fold" />
      </el-icon>
    </div>

    <!-- Right: Fullscreen + Notification + OrgTag + UserName + Avatar dropdown -->
    <div class="topbar-right">
      <!-- Fullscreen -->
      <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'" placement="bottom">
        <el-icon class="action-icon" @click="toggleFullscreen">
          <component :is="isFullscreen ? ZoomOut : FullScreen" />
        </el-icon>
      </el-tooltip>

      <!-- Notification bell with badge -->
      <el-tooltip content="通知消息" placement="bottom">
        <div class="notification-wrap" @click="handleNotification">
          <el-badge
            :value="uiStore.notificationCount > 99 ? '99+' : uiStore.notificationCount"
            :hidden="uiStore.notificationCount === 0"
            type="danger"
          >
            <el-icon class="action-icon"><Bell /></el-icon>
          </el-badge>
        </div>
      </el-tooltip>

      <!-- Org tag -->
      <el-tag
        v-if="authStore.orgName"
        class="org-tag"
        size="small"
        effect="light"
        type="primary"
      >
        {{ authStore.orgName }}
      </el-tag>

      <!-- Username -->
      <span class="username">{{ authStore.realName }}</span>

      <!-- Avatar + Dropdown -->
      <el-dropdown trigger="click" @command="handleCommand">
        <span class="avatar-wrap">
          <el-avatar :size="32" :style="{ background: '#1890ff', fontSize: '14px' }">
            {{ authStore.realName?.charAt(0) || 'U' }}
          </el-avatar>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile" :icon="UserFilled">
              个人信息
            </el-dropdown-item>
            <el-dropdown-item command="password" :icon="Key">
              修改密码
            </el-dropdown-item>
            <el-dropdown-item divided command="logout" :icon="SwitchButton">
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import {
  Expand, Fold, FullScreen, ZoomOut, Bell,
  UserFilled, Key, SwitchButton,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUiStore } from '@/store/ui'
import { useAuthStore } from '@/store/auth'

const uiStore = useUiStore()
const authStore = useAuthStore()
const router = useRouter()

const isFullscreen = ref(false)

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement
})

const handleNotification = () => {
  ElMessage.info('通知功能开发中')
}

const handleCommand = (command) => {
  if (command === 'logout') {
    authStore.logout()
    router.push('/login')
    ElMessage.success('已安全退出')
  } else if (command === 'profile') {
    ElMessage.info('个人信息功能开发中')
  } else if (command === 'password') {
    ElMessage.info('修改密码功能开发中')
  }
}
</script>

<style scoped>
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--layout-topbar-height);
  padding: 0 16px 0 20px;
  background-color: var(--color-bg-dark);
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

/* ── Left ─────────────────────────────────────── */
.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.system-name {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.toggle-btn {
  font-size: 20px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.75);
  transition: color 0.2s;
  margin-left: 4px;
}

.toggle-btn:hover {
  color: white;
}

/* ── Right ─────────────────────────────────────── */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-icon {
  font-size: 18px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.75);
  transition: color 0.2s;
}

.action-icon:hover {
  color: white;
}

.notification-wrap {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.notification-wrap .action-icon {
  font-size: 20px;
}

.org-tag {
  font-size: 12px;
  border-color: rgba(24, 144, 255, 0.5);
  background-color: rgba(24, 144, 255, 0.15);
  color: #69c0ff;
}

.username {
  font-size: 14px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.9);
}

.avatar-wrap {
  cursor: pointer;
  display: flex;
  align-items: center;
  outline: none;
}
</style>
