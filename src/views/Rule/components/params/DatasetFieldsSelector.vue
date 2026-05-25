<template>
  <div class="dataset-fields-selector">
    <div class="selector-wrapper">
      <!-- Left: Dataset List -->
      <div class="dataset-column">
        <div class="column-header">数据集</div>
        <div class="dataset-list">
          <div
            v-for="ds in datasets"
            :key="ds.id"
            class="dataset-item"
            :class="{ active: selectedDatasetId === ds.id }"
            @click="selectDataset(ds.id)"
          >
            {{ ds.datasetName }}
          </div>
        </div>
      </div>

      <!-- Right: Element List -->
      <div class="element-column">
        <div class="column-header">字段列表</div>
        <el-loading :active="loadingElements" class="element-list">
          <div v-if="selectedDatasetId && elements.length === 0" class="empty-state">
            暂无字段
          </div>
          <div v-else class="element-scroll">
            <div
              v-for="el in elements"
              :key="el.id"
              class="element-item"
              @click="selectElement(el.id)"
            >
              <span class="element-name">{{ formatElementLabel(el) }}</span>
            </div>
          </div>
        </el-loading>
      </div>
    </div>

    <!-- Selected field display -->
    <slot name="fields" :dataset-id="selectedDatasetId" :elements="elements" :element-label="formatElementLabel" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import { ElLoading } from 'element-plus'

const props = defineProps({
  datasets: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({ datasetId: null }) },
})

const emit = defineEmits(['update:model-value', 'dataset-changed'])

const selectedDatasetId = ref(props.modelValue.datasetId)
const elements = ref([])
const loadingElements = ref(false)

const formatElementLabel = (el) => {
  const name = el.elementName || el.element_name || ''
  const code = el.elementCode || el.element_code || ''
  return code ? `${name}（${code}）` : name
}

const selectDataset = (dsId) => {
  selectedDatasetId.value = dsId
  fetchElements(dsId)
  emit('dataset-changed', dsId)
  emit('update:model-value', { datasetId: dsId })
}

const selectElement = (id) => {
  emit('element-selected', id)
}

const fetchElements = async (datasetId) => {
  elements.value = []
  if (!datasetId) return
  loadingElements.value = true
  try {
    const { data } = await axios.get(`/api/dataset/${datasetId}/elements`)
    elements.value = data.data?.records || data.data || []
  } finally {
    loadingElements.value = false
  }
}

watch(() => props.modelValue, (v) => {
  if (v?.datasetId && v.datasetId !== selectedDatasetId.value) {
    selectedDatasetId.value = v.datasetId
    fetchElements(v.datasetId)
  }
}, { deep: true })

if (selectedDatasetId.value) {
  fetchElements(selectedDatasetId.value)
}
</script>

<style scoped>
.dataset-fields-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selector-wrapper {
  display: flex;
  gap: 16px;
  height: 300px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.dataset-column,
.element-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dataset-column {
  border-right: 1px solid #dcdfe6;
}

.column-header {
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  font-weight: 600;
  color: #606266;
  font-size: 12px;
}

.dataset-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.dataset-item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dataset-item:hover {
  background-color: #f5f7fa;
}

.dataset-item.active {
  background-color: #e6f7ff;
  border-left: 3px solid #409eff;
  padding-left: 9px;
}

.element-column {
  position: relative;
}

.element-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.element-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.element-item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.element-item:hover {
  background-color: #f5f7fa;
}

.element-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 12px;
}
</style>
