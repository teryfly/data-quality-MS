<template>
  <div class="ds-card">
    <div class="ds-card-header">
      <div class="ds-name-row">
        <span class="ds-name">{{ source.sourceName }}</span>
        <el-tag size="small" class="db-type-tag">{{ source.dbType }}</el-tag>
      </div>
      <div class="ds-connect-info">
        {{ source.ip }}:{{ source.port }}/{{ source.dbName }}
      </div>
    </div>

    <div class="ds-card-body">
      <div class="ds-status-row">
        <span class="ds-status-label">连接状态：</span>
        <el-tag
          :type="connectStatusTag.type"
          size="small"
          :style="connectStatusTag.style"
        >
          {{ connectStatusTag.text }}
        </el-tag>
      </div>

      <template v-if="source.sourceType === 'code'">
        <div class="ds-meta-row">
          <span class="ds-meta-label">同步频率：</span>
          <span>{{ syncFreqLabel }}</span>
        </div>
        <div class="ds-meta-row">
          <span class="ds-meta-label">上次同步：</span>
          <span>{{ source.lastSyncTime || '从未同步' }}</span>
        </div>
      </template>
    </div>

    <div class="ds-card-actions">
      <el-button size="small" @click="emit('test', source)">测试连接</el-button>
      <el-button
        v-permission="'datasource:edit'"
        size="small"
        type="primary"
        @click="emit('edit', source)"
      >
        编辑
      </el-button>
      <el-button
        v-permission="'datasource:delete'"
        v-confirm-delete="() => emit('delete', source)"
        size="small"
        type="danger"
      >
        删除
      </el-button>
      <el-button
        v-if="source.sourceType === 'code'"
        v-permission="'datasource:sync'"
        size="small"
        type="warning"
        @click="emit('sync', source)"
      >
        立即同步
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  source: { type: Object, required: true }
})
const emit = defineEmits(['test', 'edit', 'delete', 'sync'])

const connectStatusTag = computed(() => {
  const s = props.source.connectStatus
  if (s === 1) return { type: 'success', text: '连通', style: {} }
  if (s === 0) return { type: 'danger', text: '断开', style: {} }
  return { type: 'info', text: '未验证', style: { color: '#909399' } }
})

const syncFreqLabel = computed(() => {
  const map = { daily: '每日', weekly: '每周', monthly: '每月' }
  return map[props.source.syncFrequency] || props.source.syncFrequency || '-'
})
</script>

<style scoped>
.ds-card {
  width: 320px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s;
}

.ds-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.ds-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.ds-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.db-type-tag {
  font-size: 11px;
}

.ds-connect-info {
  font-size: 12px;
  color: #909399;
  margin-bottom: 12px;
}

.ds-card-body {
  margin-bottom: 12px;
}

.ds-status-row,
.ds-meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 13px;
}

.ds-status-label,
.ds-meta-label {
  color: #909399;
  flex-shrink: 0;
}

.ds-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid #f2f3f5;
}
</style>
