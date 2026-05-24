<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-animation">
        <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" width="280">
          <ellipse cx="160" cy="120" rx="110" ry="50" fill="#f0f2f5"/>
          <ellipse cx="110" cy="110" rx="60" ry="45" fill="#f0f2f5"/>
          <ellipse cx="210" cy="110" rx="60" ry="45" fill="#f0f2f5"/>
          <ellipse cx="160" cy="90" rx="75" ry="55" fill="#f0f2f5"/>
          <text x="160" y="112" text-anchor="middle" font-size="52" font-weight="900" fill="#bfbfbf">?</text>
        </svg>
      </div>

      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-desc">
        您访问的页面不存在或已被移除。<br>
        请检查访问地址是否正确。
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

      <div class="error-hint">如果问题持续存在，请联系系统管理员</div>
    </div>
  </div>
</template>

<script setup>
import { HomeFilled, ArrowLeft } from '@element-plus/icons-vue'

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

.error-animation {
  margin-bottom: 8px;
}

.error-code {
  font-size: 80px;
  font-weight: 800;
  margin: 0 0 8px;
  line-height: 1;
  letter-spacing: -2px;
  background: linear-gradient(135deg, #8c8c8c, #bfbfbf);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  margin-bottom: 24px;
}

.error-hint {
  font-size: 12px;
  color: var(--color-text-tertiary);
}
</style>
