<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-icon">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="90" stroke="#ff4d4f" stroke-width="8" stroke-opacity="0.2"/>
          <circle cx="100" cy="100" r="70" fill="#fff1f0"/>
          <text x="100" y="80" text-anchor="middle" font-size="36" font-weight="bold" fill="#ff4d4f">403</text>
          <path d="M70 110 Q100 140 130 110" stroke="#ff4d4f" stroke-width="4" stroke-linecap="round" fill="none"/>
          <circle cx="82" cy="95" r="6" fill="#ff4d4f"/>
          <circle cx="118" cy="95" r="6" fill="#ff4d4f"/>
        </svg>
      </div>

      <div class="error-lock">
        <el-icon size="64" color="#ff4d4f"><Lock /></el-icon>
      </div>

      <h1 class="error-code">403</h1>
      <h2 class="error-title">抱歉，您没有访问该页面的权限</h2>
      <p class="error-desc">
        您的账号角色权限不足，无法访问此页面。<br>
        如需访问，请联系系统管理员申请相应权限。
      </p>

      <div class="error-actions">
        <el-button type="primary" size="large" @click="goHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button size="large" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Lock, HomeFilled, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => router.push('/dashboard')
const goBack = () => router.back()
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--color-bg-gray);
}

.error-content {
  text-align: center;
  padding: 48px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  max-width: 480px;
  width: 90%;
}

.error-icon {
  display: none;
}

.error-lock {
  margin-bottom: 16px;
}

.error-code {
  font-size: 80px;
  font-weight: 800;
  color: #ff4d4f;
  margin: 0 0 8px;
  line-height: 1;
  letter-spacing: -2px;
}

.error-title {
  font-size: 18px;
  color: var(--color-text-primary);
  margin: 0 0 16px;
  font-weight: 600;
}

.error-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 32px;
  line-height: 1.8;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
