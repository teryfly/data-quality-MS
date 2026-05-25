<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="800px"
    :close-on-click-modal="false"
    @open="loadData"
  >
    <div v-loading="loading" style="min-height: 240px">
      <el-descriptions
        v-if="!loading && businessData"
        :column="2"
        border
        size="default"
      >
        <el-descriptions-item
          v-for="(value, key) in businessData.data"
          :key="key"
          :label="key"
          :class-name="isProblemField(key) ? 'problem-cell' : ''"
        >
          <span :class="{ 'problem-value': isProblemField(key) }">
            {{ formatDisplayValue(value) }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
      <el-empty v-else-if="!loading" description="暂无数据" />
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getBusinessData } from '@/api/result'

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
const businessData = ref(null)

const title = computed(() => {
  const ds = props.detail?.datasetName || '数据集'
  return `${ds} - 数据详情`
})

async function loadData() {
  if (!props.detail?.id) return
  loading.value = true
  businessData.value = null
  try {
    businessData.value = await getBusinessData(props.detail.id)
  } catch {
    businessData.value = null
  } finally {
    loading.value = false
  }
}

function isProblemField(key) {
  const code = props.detail?.elementCode || businessData.value?.problemElementCode
  return code && key === code
}

function formatDisplayValue(v) {
  if (v === null || v === undefined || v === '') return '（空值）'
  return String(v)
}
</script>

<style scoped>
:deep(.el-descriptions__cell.problem-cell) {
  background-color: #fff1f0 !important;
}

.problem-value {
  color: #ff4d4f;
  font-weight: 600;
}
</style>
