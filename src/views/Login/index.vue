<template>
  <div class="login-page">
    <!-- ── Left panel: Medical theme SVG illustration ── -->
    <div class="login-left">
      <svg
        class="hero-bg"
        viewBox="0 0 700 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#001529"/>
            <stop offset="100%" stop-color="#003a8c"/>
          </linearGradient>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#1890ff" stop-opacity="0"/>
            <stop offset="30%" stop-color="#1890ff" stop-opacity="0.8"/>
            <stop offset="70%" stop-color="#1890ff" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#1890ff" stop-opacity="0"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Background -->
        <rect width="700" height="900" fill="url(#bgGrad)"/>

        <!-- Subtle grid -->
        <g stroke="rgba(255,255,255,0.04)" stroke-width="1">
          <line x1="0" y1="150" x2="700" y2="150"/>
          <line x1="0" y1="300" x2="700" y2="300"/>
          <line x1="0" y1="450" x2="700" y2="450"/>
          <line x1="0" y1="600" x2="700" y2="600"/>
          <line x1="0" y1="750" x2="700" y2="750"/>
          <line x1="100" y1="0" x2="100" y2="900"/>
          <line x1="200" y1="0" x2="200" y2="900"/>
          <line x1="350" y1="0" x2="350" y2="900"/>
          <line x1="500" y1="0" x2="500" y2="900"/>
          <line x1="600" y1="0" x2="600" y2="900"/>
        </g>

        <!-- ECG heartbeat line -->
        <polyline
          points="0,480 80,480 110,480 130,440 148,520 165,400 185,560 200,480 280,480 310,480 330,455 348,505 365,435 385,525 400,480 480,480 510,480 530,462 548,498 565,445 585,515 600,480 700,480"
          fill="none" stroke="url(#lineGrad)" stroke-width="2.5" filter="url(#glow)"
        />

        <!-- Central large medical cross -->
        <g transform="translate(300, 120)" opacity="0.12">
          <rect x="30" y="0" width="24" height="80" rx="6" fill="white"/>
          <rect x="0" y="28" width="84" height="24" rx="6" fill="white"/>
        </g>

        <!-- Data node network (upper area) -->
        <g opacity="0.5">
          <!-- Connection lines -->
          <line x1="120" y1="180" x2="280" y2="240" stroke="#1890ff" stroke-width="1" opacity="0.4"/>
          <line x1="280" y1="240" x2="440" y2="190" stroke="#1890ff" stroke-width="1" opacity="0.4"/>
          <line x1="440" y1="190" x2="580" y2="260" stroke="#52c41a" stroke-width="1" opacity="0.4"/>
          <line x1="120" y1="180" x2="200" y2="320" stroke="#1890ff" stroke-width="1" opacity="0.3"/>
          <line x1="280" y1="240" x2="350" y2="370" stroke="#faad14" stroke-width="1" opacity="0.3"/>
          <line x1="440" y1="190" x2="500" y2="340" stroke="#52c41a" stroke-width="1" opacity="0.3"/>
          <!-- Nodes -->
          <circle cx="120" cy="180" r="10" fill="#1890ff" filter="url(#glow)"/>
          <circle cx="280" cy="240" r="8"  fill="#1890ff"/>
          <circle cx="440" cy="190" r="10" fill="#52c41a" filter="url(#glow)"/>
          <circle cx="580" cy="260" r="7"  fill="#faad14"/>
          <circle cx="200" cy="320" r="6"  fill="#1890ff"/>
          <circle cx="350" cy="370" r="7"  fill="#faad14"/>
          <circle cx="500" cy="340" r="6"  fill="#52c41a"/>
        </g>

        <!-- Data node network (lower area) -->
        <g opacity="0.4">
          <line x1="100" y1="620" x2="260" y2="580" stroke="#1890ff" stroke-width="1"/>
          <line x1="260" y1="580" x2="420" y2="640" stroke="#52c41a" stroke-width="1"/>
          <line x1="420" y1="640" x2="580" y2="600" stroke="#1890ff" stroke-width="1"/>
          <circle cx="100" cy="620" r="7" fill="#1890ff"/>
          <circle cx="260" cy="580" r="9" fill="#52c41a" filter="url(#glow)"/>
          <circle cx="420" cy="640" r="7" fill="#1890ff"/>
          <circle cx="580" cy="600" r="8" fill="#faad14"/>
        </g>

        <!-- Mini bar chart (bottom left suggestion) -->
        <g transform="translate(60, 680)" opacity="0.2">
          <rect x="0"   y="70" width="22" height="30" rx="3" fill="#1890ff"/>
          <rect x="30"  y="50" width="22" height="50" rx="3" fill="#1890ff"/>
          <rect x="60"  y="25" width="22" height="75" rx="3" fill="#1890ff"/>
          <rect x="90"  y="40" width="22" height="60" rx="3" fill="#52c41a"/>
          <rect x="120" y="10" width="22" height="90" rx="3" fill="#52c41a"/>
          <rect x="150" y="30" width="22" height="70" rx="3" fill="#1890ff"/>
        </g>

        <!-- Floating card shapes -->
        <g opacity="0.07">
          <rect x="40"  y="750" width="140" height="90" rx="10" fill="white"/>
          <rect x="220" y="780" width="110" height="75" rx="10" fill="white"/>
          <rect x="400" y="760" width="130" height="85" rx="10" fill="white"/>
          <rect x="570" y="775" width="100" height="80" rx="10" fill="white"/>
        </g>

        <!-- Scattered small crosses -->
        <g fill="rgba(255,255,255,0.1)">
          <rect x="550" y="150" width="16" height="5" rx="2.5"/>
          <rect x="556" y="142" width="5"  height="21" rx="2.5"/>
          <rect x="80"  y="400" width="14" height="5" rx="2.5"/>
          <rect x="85"  y="393" width="5"  height="19" rx="2.5"/>
          <rect x="590" y="560" width="12" height="4" rx="2"/>
          <rect x="595" y="554" width="4"  height="16" rx="2"/>
          <rect x="170" y="700" width="14" height="5" rx="2.5"/>
          <rect x="175" y="693" width="5"  height="19" rx="2.5"/>
        </g>

        <!-- Title text in left panel -->
        <text x="350" y="860" text-anchor="middle" font-size="13" fill="rgba(255,255,255,0.35)" font-family="PingFang SC, Microsoft YaHei, sans-serif">
          区域医疗数据质量管控系统
        </text>
      </svg>

      <!-- Overlay text content -->
      <div class="left-overlay">
        <div class="hero-logo">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="56" height="56">
            <rect x="0" y="0" width="48" height="48" rx="12" fill="rgba(24,144,255,0.25)"/>
            <rect x="19" y="6" width="10" height="36" rx="4" fill="white"/>
            <rect x="6" y="19" width="36" height="10" rx="4" fill="white"/>
          </svg>
        </div>
        <h1 class="hero-title">医疗数据质控平台</h1>
        <p class="hero-desc">构建完善的数据质量体系，<br>守护每一份医疗数据的准确与完整</p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-val">99.8%</span>
            <span class="stat-label">数据准确率</span>
          </div>
          <div class="stat-divider"/>
          <div class="stat-item">
            <span class="stat-val">128+</span>
            <span class="stat-label">接入机构</span>
          </div>
          <div class="stat-divider"/>
          <div class="stat-item">
            <span class="stat-val">2400万</span>
            <span class="stat-label">累计质控记录</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Right panel: Login card ── -->
    <div class="login-right">
      <div class="login-card">
        <!-- Logo + System name -->
        <div class="card-header">
          <div class="card-logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
              <rect width="40" height="40" rx="10" fill="#1890ff"/>
              <rect x="16" y="6" width="8" height="28" rx="3" fill="white"/>
              <rect x="6" y="16" width="28" height="8" rx="3" fill="white"/>
            </svg>
          </div>
          <h2 class="card-title">医疗数据质控平台</h2>
          <p class="card-subtitle">区域医疗数据质量管控系统 v1.0</p>
        </div>

        <el-divider />

        <!-- Login Form -->
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          size="large"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              :prefix-icon="UserIcon"
              clearable
              autocomplete="username"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              placeholder="请输入密码"
              type="password"
              :prefix-icon="LockIcon"
              show-password
              autocomplete="current-password"
            />
          </el-form-item>

          <el-form-item>
            <div class="form-options">
              <el-checkbox v-model="form.rememberMe">记住我</el-checkbox>
              <span class="forgot-link" @click="handleForgot">忘记密码？</span>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              class="login-btn"
              type="primary"
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '立即登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- Demo hint -->
        <div class="demo-hint">
          <el-collapse>
            <el-collapse-item title="演示账号" name="demo">
              <div class="demo-accounts">
                <div
                  v-for="acc in demoAccounts"
                  :key="acc.username"
                  class="demo-account-item"
                  @click="fillDemo(acc)"
                >
                  <span class="demo-role">{{ acc.role }}</span>
                  <span class="demo-info">{{ acc.username }} / {{ acc.password }}</span>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>

        <!-- Copyright -->
        <div class="card-footer">
          © 2025 医疗数据中心 All Rights Reserved
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User as UserIcon, Lock as LockIcon } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// ── Form state ─────────────────────────────────────────────────────────────
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  rememberMe: false,
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
}

// ── Demo accounts hint ─────────────────────────────────────────────────────
const demoAccounts = [
  { role: '超级管理员', username: 'admin',        password: 'Admin@123' },
  { role: '区域管理员', username: 'region_admin', password: 'Admin@123' },
  { role: '机构管理员', username: 'org_admin',    password: 'Admin@123' },
  { role: '普通用户',   username: 'user',         password: 'Admin@123' },
]

const fillDemo = (acc) => {
  form.username = acc.username
  form.password = acc.password
}

// ── Login handler ──────────────────────────────────────────────────────────
const handleLogin = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    // request interceptor returns data directly on code=200
    // For code=401/403 it shows error message and rejects
    const data = await request.post('/api/user/login', {
      username: form.username,
      password: form.password,
    })
    authStore.setAuth(data, form.rememberMe)
    ElMessage.success(`欢迎回来，${data.realName}！`)
    const redirect = route.query.redirect
    router.push(redirect ? String(redirect) : '/dashboard')
  } catch {
    // Error message already displayed by the request interceptor
  } finally {
    loading.value = false
  }
}

const handleForgot = () => {
  ElMessage.info('请联系系统管理员重置密码')
}
</script>

<style scoped>
/* ── Page container ─────────────────────────────────────────────────────── */
.login-page {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

/* ── Left panel ─────────────────────────────────────────────────────────── */
.login-left {
  position: relative;
  flex: 0 0 60%;
  overflow: hidden;
  background-color: #001529;
}

.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.left-overlay {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 48px;
  color: white;
  text-align: center;
}

.hero-logo {
  margin-bottom: 24px;
}

.hero-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.hero-desc {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.9;
  margin: 0 0 48px;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-val {
  font-size: 22px;
  font-weight: 700;
  color: #69c0ff;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
}

/* ── Right panel ─────────────────────────────────────────────────────────── */
.login-right {
  flex: 0 0 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 32px;
}

.login-card {
  width: 100%;
  max-width: 380px;
}

/* ── Card header ─────────────────────────────────────────────────────────── */
.card-header {
  text-align: center;
  margin-bottom: 4px;
}

.card-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}

.card-subtitle {
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin: 0;
}

/* ── Form ─────────────────────────────────────────────────────────────────── */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.forgot-link {
  font-size: 13px;
  color: var(--color-primary);
  cursor: pointer;
  transition: opacity 0.2s;
}

.forgot-link:hover {
  opacity: 0.75;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 1px;
}

/* ── Demo hint ─────────────────────────────────────────────────────────────── */
.demo-hint {
  margin-top: 8px;
  margin-bottom: 16px;
}

.demo-hint :deep(.el-collapse) {
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.demo-hint :deep(.el-collapse-item__header) {
  padding: 0 16px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.demo-hint :deep(.el-collapse-item__content) {
  padding-bottom: 8px;
}

.demo-accounts {
  padding: 0 12px;
}

.demo-account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.demo-account-item:hover {
  background: #f0f7ff;
}

.demo-role {
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 500;
  flex-shrink: 0;
  width: 80px;
}

.demo-info {
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-family: var(--font-family-mono);
}

/* ── Footer ─────────────────────────────────────────────────────────────────── */
.card-footer {
  text-align: center;
  font-size: 12px;
  color: var(--color-text-tertiary);
  padding-top: 8px;
}
</style>
