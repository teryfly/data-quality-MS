<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="export-loading-mask">
        <div class="export-loading-content">
          <el-icon class="loading-spin" size="36" color="#409eff">
            <Loading />
          </el-icon>
          <p class="loading-text">正在生成文件，请稍候...</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { Loading } from '@element-plus/icons-vue'

const visible = ref(false)

function show() {
  visible.value = true
}

function hide() {
  visible.value = false
}

defineExpose({ show, hide })
</script>

<style scoped>
.export-loading-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.export-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 8px;
  padding: 36px 48px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
}

.loading-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.loading-text {
  margin: 0;
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
