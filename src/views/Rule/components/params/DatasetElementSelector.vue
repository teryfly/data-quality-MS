<template>
  <div class="dataset-element-selector">
    <div class="selector-wrapper">
      <!-- Left: Dataset List -->
      <div class="dataset-column">
        <div class="column-header">{{ datasetLabel }}</div>
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
        <div class="column-header">{{ elementLabel }}</div>
        <div class="element-list">
          <template v-if="!selectedDatasetId">
            <div class="empty-state">请先选择数据集</div>
          </template>
          <template v-else-if="loadingElements">
            <div class="empty-state">加载中...</div>
          </template>
          <template v-else-if="elements.length === 0">
            <div class="empty-state">暂无数据元</div>
          </template>
          <template v-else>
            <div class="element-scroll">
              <div
                v-for="el in elements"
                :key="el.id"
                class="element-item"
                :class="{ selected: isElementSelected(el.id) }"
                @click="toggleElement(el.id)"
              >
                <el-checkbox :model-value="isElementSelected(el.id)" />
                <span class="element-name">{{ formatElementLabel(el) }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Selected Elements Display -->
    <div v-if="selectedElements.length > 0" class="selected-elements">
      <div style="font-size:12px;color:#909399;margin-bottom:8px">{{ selectionLabel }}：</div>
      <draggable v-model="selectedElements" item-key="item" handle=".drag-tag" animation="150">
        <template #item="{ element }">
          <el-tag class="drag-tag" style="cursor:grab;margin-right:6px;margin-bottom:4px" closable @close="removeElement(element.id)">
            {{ formatElementLabel(element) }}
          </el-tag>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import axios from 'axios'
import draggable from 'vuedraggable'
import { ElCheckbox, ElLoading, ElTag } from 'element-plus'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ datasetId: null, elementIds: [] }) },
  datasets: { type: Array, default: () => [] },
  datasetLabel: { type: String, default: '数据集' },
  elementLabel: { type: String, default: '数据元' },
  selectionLabel: { type: String, default: '已选数据元' },
  multiple: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue'])

const selectedDatasetId = ref(props.modelValue.datasetId)
const selectedElementIds = ref(props.modelValue.elementIds || [])
const elements = ref([])
const loadingElements = ref(false)

const selectedElements = computed({
  get: () => elements.value.filter(e => selectedElementIds.value.includes(e.id)),
  set: (val) => {
    selectedElementIds.value = val.map(e => e.id)
    emitUpdate()
  },
})

const formatElementLabel = (el) => {
  const name = el.elementName || el.element_name || ''
  const code = el.elementCode || el.element_code || ''
  return code ? `${name}（${code}）` : name
}

const isElementSelected = (id) => selectedElementIds.value.includes(id)

const selectDataset = (dsId) => {
  console.log('selectDataset called with:', dsId)
  selectedDatasetId.value = dsId
  selectedElementIds.value = []
  console.log('selectedDatasetId updated to:', selectedDatasetId.value)
  fetchElements(dsId)
  emitUpdate()
}

const toggleElement = (id) => {
  const idx = selectedElementIds.value.indexOf(id)
  if (idx > -1) {
    selectedElementIds.value.splice(idx, 1)
  } else {
    if (props.multiple) {
      selectedElementIds.value.push(id)
    } else {
      selectedElementIds.value = [id]
    }
  }
  emitUpdate()
}

const removeElement = (id) => {
  selectedElementIds.value = selectedElementIds.value.filter(i => i !== id)
  emitUpdate()
}

const fetchElements = async (datasetId) => {
  elements.value = []
  if (!datasetId) return
  loadingElements.value = true
  try {
    const { data } = await axios.get(`/api/dataset/${datasetId}/elements`)
    elements.value = data.data?.records || data.data || []
    console.log('Elements loaded:', elements.value)
  } catch (e) {
    console.error('Failed to fetch elements:', e)
    elements.value = []
  } finally {
    loadingElements.value = false
  }
}

const emitUpdate = () => {
  emit('update:modelValue', {
    datasetId: selectedDatasetId.value,
    elementIds: selectedElementIds.value,
  })
}

watch(() => props.modelValue, (v) => {
  if (v?.datasetId && v.datasetId !== selectedDatasetId.value) {
    selectedDatasetId.value = v.datasetId
    selectedElementIds.value = v.elementIds || []
    fetchElements(v.datasetId)
  }
}, { deep: true })

if (selectedDatasetId.value) {
  fetchElements(selectedDatasetId.value)
}
</script>

<style scoped>
.dataset-element-selector {
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
  gap: 8px;
  transition: background-color 0.2s;
}

.element-item:hover {
  background-color: #f5f7fa;
}

.element-item.selected {
  background-color: #f0f9ff;
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

.selected-elements {
  margin-top: 8px;
}

.drag-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}
</style>
