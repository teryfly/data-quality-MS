<template>
  <el-drawer
    v-model="visible"
    :title="title"
    direction="rtl"
    size="480px"
    :before-close="onBeforeClose"
    @open="loadData"
  >
    <div v-loading="loading" class="history-wrap">
      <el-timeline v-if="!loading && history.length">
        <el-timeline-item
          v-for="(item, idx) in history"
          :key="idx"
          :type="nodeType(item)"
          :color="nodeColor(item)"
          :icon="nodeIcon(item)"
          :hollow="item.operatorType === 'system'"
          size="large"
          placement="top"
        >
          <div class="node-header">
            <span class="node-time">{{ item.timestamp }}</span>
            <span class="node-operator" :class="`op-${item.operatorType}`">
              <el-icon size="13" style="margin-right: 2px">
                <component :is="item.operatorType === 'system' ? Setting : User" />
              </el-icon>
              {{ item.operator }}
            </span>
          </div>
          <div class="node-action" :class="actionClass(item)">{{ item.action }}</div>
          <div v-if="item.description" class="node-desc">{{ item.description }}</div>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else-if="!loading" description="暂无整改记录" />
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { User, Setting } from '@element-plus/icons-vue'
import { getFixHistory } from '@/api/result'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  detail: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const loading = ref(false)
const history = ref([])

const title = computed(() => {
  const bid = props.detail?.businessId || ''
  return `整改记录 - ${bid}`
})

async function loadData() {
  if (!props.detail?.id) return
  loading.value = true
  try {
    history.value = await getFixHistory(props.detail.id)
  } catch {
    history.value = []
  } finally {
    loading.value = false
  }
}

function onBeforeClose(done) {
  done()
}

function nodeType(item) {
  if (item.operatorType === 'system') {
    if (/通过|✓/.test(item.action)) return 'success'
    if (/未通过|失败|✗/.test(item.action)) return 'danger'
    return 'primary'
  }
  return 'primary'
}

function nodeColor(item) {
  if (item.operatorType === 'system') {
    if (/通过|✓/.test(item.action)) return '#52c41a'
    if (/未通过|失败|✗/.test(item.action)) return '#ff4d4f'
    return '#1890ff'  // 系统自动节点：蓝色
  }
  return '#909399'  // 人工操作节点：灰色
}

function nodeIcon(item) {
  return item.operatorType === 'system' ? Setting : User
}

function actionClass(item) {
  if (item.operatorType === 'system') {
    if (/通过|✓/.test(item.action)) return 'action-success'
    if (/未通过|失败|✗/.test(item.action)) return 'action-fail'
  }
  return ''
}
</script>

<style scoped>
.history-wrap {
  padding: 0 12px;
  min-height: 200px;
}

.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.node-time {
  font-size: 13px;
  color: var(--color-text-secondary, #606266);
  font-variant-numeric: tabular-nums;
}

.node-operator {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  color: var(--color-text-tertiary, #909399);
}

.op-system {
  color: #1890ff;
}

.node-action {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary, #303133);
  margin-bottom: 4px;
}

.action-success { color: #52c41a; }
.action-fail { color: #ff4d4f; }

.node-desc {
  font-size: 13px;
  color: var(--color-text-secondary, #606266);
  line-height: 1.5;
  padding: 6px 10px;
  background: #fafafa;
  border-radius: 4px;
  border-left: 3px solid #e8e8e8;
}
</style>
