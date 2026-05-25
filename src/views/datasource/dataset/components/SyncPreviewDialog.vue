<template>
  <el-dialog
    v-model="visible"
    :title="`字段同步预览 — ${dataset?.datasetName || ''}`"
    width="720px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    draggable
  >
    <div v-loading="previewLoading" style="max-height: calc(80vh - 160px); overflow-y: auto;">
      <template v-if="!previewLoading && previewData">
        <el-alert
          v-if="hasChanges"
          type="info"
          :closable="false"
          class="preview-tip"
        >
          共发现 <strong>{{ totalChanges }}</strong> 处变更（新增 {{ previewData.added.length }}，更新 {{ previewData.modified.length }}，删除 {{ previewData.deleted.length }}），确认后提交同步。
        </el-alert>
        <el-alert v-else type="success" :closable="false" class="preview-tip">
          字段结构与数据库一致，无需同步。
        </el-alert>

        <el-table
          :data="allRows"
          border
          stripe
          style="width: 100%"
          :row-class-name="getRowClass"
        >
          <el-table-column label="字段名" prop="fieldName" min-width="140" />
          <el-table-column label="字段类型" prop="fieldType" width="120" />
          <el-table-column label="原类型" prop="oldType" width="120">
            <template #default="{ row }">
              <span v-if="row.changeType === 'modified'" class="old-type">{{ row.oldType }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="变更状态" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="changeTagType(row.changeType)" size="small">
                {{ changeLabel(row.changeType) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!hasChanges || confirmLoading"
          :loading="confirmLoading"
          @click="handleConfirm"
        >
          确认同步
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const props = defineProps({
  modelValue: Boolean,
  dataset: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const previewLoading = ref(false)
const confirmLoading = ref(false)
const previewData = ref(null)

const allRows = computed(() => {
  if (!previewData.value) return []
  const added = (previewData.value.added || []).map(r => ({ ...r, fieldType: r.elementType, fieldName: r.elementName, changeType: 'added' }))
  const deleted = (previewData.value.deleted || []).map(r => ({ ...r, fieldType: r.elementType, fieldName: r.elementName, changeType: 'deleted' }))
  const modified = (previewData.value.modified || []).map(r => ({ ...r, fieldType: r.newType, fieldName: r.elementName, changeType: 'modified' }))
  return [...added, ...modified, ...deleted]
})

const hasChanges = computed(() => allRows.value.length > 0)
const totalChanges = computed(() => allRows.value.length)

watch(visible, async val => {
  if (val && props.dataset) {
    previewData.value = null
    previewLoading.value = true
    try {
      const res = await axios.post(`/api/dataset/${props.dataset.id}/elements/sync-preview`)
      previewData.value = res.data?.data || { added: [], deleted: [], modified: [] }
    } catch {
      ElMessage.error('获取同步预览失败')
      visible.value = false
    } finally {
      previewLoading.value = false
    }
  }
})

function getRowClass({ row }) {
  if (row.changeType === 'added') return 'row-added'
  if (row.changeType === 'deleted') return 'row-deleted'
  if (row.changeType === 'modified') return 'row-modified'
  return ''
}

function changeTagType(type) {
  if (type === 'added') return 'success'
  if (type === 'deleted') return 'danger'
  if (type === 'modified') return 'warning'
  return 'info'
}

function changeLabel(type) {
  if (type === 'added') return '新增'
  if (type === 'deleted') return '删除'
  if (type === 'modified') return '修改'
  return '-'
}

async function handleConfirm() {
  confirmLoading.value = true
  try {
    await axios.put(`/api/dataset/${props.dataset.id}/elements/sync-confirm`, { confirmed: true })
    ElMessage.success('字段同步成功')
    visible.value = false
  } catch {
    ElMessage.error('同步确认失败，请重试')
  } finally {
    confirmLoading.value = false
  }
}
</script>

<style>
.el-table .row-added td {
  background-color: #f0f9eb !important;
}

.el-table .row-deleted td {
  background-color: #fef0f0 !important;
}

.el-table .row-modified td {
  background-color: #fdf6ec !important;
}
</style>

<style scoped>
.preview-tip {
  margin-bottom: 12px;
}

.old-type {
  text-decoration: line-through;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
