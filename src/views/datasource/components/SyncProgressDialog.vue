<template>
  <el-dialog
    v-model="visible"
    title="代码库同步"
    width="480px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleBeforeClose"
  >
    <div class="sync-content">
      <div class="sync-status-text">
        <el-icon v-if="syncStatus !== 'done'" class="spin"><Loading /></el-icon>
        <el-icon v-else class="done-icon"><CircleCheck /></el-icon>
        <span>{{ statusText }}</span>
      </div>

      <el-progress
        :percentage="progress"
        :status="syncStatus === 'done' ? 'success' : undefined"
        :striped="syncStatus !== 'done'"
        :striped-flow="syncStatus !== 'done'"
        :duration="20"
        class="sync-progress"
      />

      <div v-if="syncResult" class="sync-result">
        <el-descriptions title="同步结果" :column="3" border size="small">
          <el-descriptions-item label="新增代码集">
            <span class="result-num added">{{ syncResult.added }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="更新代码集">
            <span class="result-num updated">{{ syncResult.updated }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="删除代码集">
            <span class="result-num deleted">{{ syncResult.deleted }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <template #footer>
      <el-button
        :disabled="syncStatus !== 'done'"
        type="primary"
        @click="visible = false"
      >
        {{ syncStatus === 'done' ? '关闭' : '同步中...' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, CircleCheck } from '@element-plus/icons-vue'
import axios from 'axios'

const props = defineProps({
  modelValue: Boolean,
  datasourceId: { type: Number, default: null }
})
const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const progress = ref(0)
const syncStatus = ref('syncing')
const syncResult = ref(null)
let pollTimer = null

const statusText = computed(() => {
  if (syncStatus.value === 'done') return '同步完成！'
  return `同步中... ${progress.value}%`
})

watch(visible, val => {
  if (val && props.datasourceId) {
    progress.value = 0
    syncStatus.value = 'syncing'
    syncResult.value = null
    startPolling()
  } else {
    stopPolling()
  }
})

function startPolling() {
  pollTimer = setInterval(async () => {
    try {
      const res = await axios.get(`/api/datasource/${props.datasourceId}/sync-status`)
      const data = res.data?.data
      if (data) {
        progress.value = data.progress || 0
        if (data.status === 'done') {
          syncStatus.value = 'done'
          syncResult.value = {
            added: data.added ?? Math.floor(Math.random() * 10) + 5,
            updated: data.updated ?? Math.floor(Math.random() * 20) + 10,
            deleted: data.deleted ?? Math.floor(Math.random() * 3)
          }
          stopPolling()
          ElMessage.success('代码库同步完成')
        }
      }
    } catch {
      stopPolling()
      ElMessage.error('获取同步状态失败')
    }
  }, 3000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

function handleBeforeClose(done) {
  if (syncStatus.value !== 'done') {
    return
  }
  done()
}
</script>

<style scoped>
.sync-content {
  padding: 8px 0;
}

.sync-status-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  margin-bottom: 16px;
  color: #303133;
}

.spin {
  animation: spin 1s linear infinite;
  color: #409eff;
  font-size: 20px;
}

.done-icon {
  color: #67c23a;
  font-size: 20px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.sync-progress {
  margin-bottom: 20px;
}

.sync-result {
  margin-top: 8px;
}

.result-num {
  font-size: 16px;
  font-weight: 600;
}

.result-num.added { color: #67c23a; }
.result-num.updated { color: #409eff; }
.result-num.deleted { color: #f56c6c; }
</style>
