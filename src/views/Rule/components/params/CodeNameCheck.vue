<template>
  <div>
    <div style="margin-bottom:16px;font-weight:600;color:#606266">选择字段</div>
    <div class="selector-wrapper">
      <!-- Left: Dataset and Elements List -->
      <div class="left-panel">
        <div class="dataset-section">
          <div class="section-header">数据集</div>
          <div class="dataset-list">
            <div
              v-for="ds in datasets"
              :key="ds.id"
              class="dataset-item"
              :class="{ active: model.datasetId === ds.id }"
              @click="selectDataset(ds.id)"
            >
              {{ ds.datasetName }}
            </div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="element-section">
          <div class="section-header">字段列表</div>
          <el-loading :active="loadingElements" class="element-list">
            <div v-if="!model.datasetId" class="empty-state">请先选择数据集</div>
            <div v-else-if="elements.length === 0" class="empty-state">暂无字段</div>
            <div v-else class="element-scroll">
              <div
                v-for="el in elements"
                :key="el.id"
                class="element-item"
                @click="copyElement(el)"
              >
                {{ formatElementLabel(el) }}
              </div>
            </div>
          </el-loading>
        </div>
      </div>

      <!-- Right: Field Selection -->
      <div class="right-panel">
        <el-form-item label="代码字段" prop="params.codeFieldId" :rules="req('代码字段')" style="margin-bottom:12px">
          <el-select v-model="model.codeFieldId" placeholder="选择代码字段" filterable clearable :disabled="!model.datasetId" style="width:100%">
            <el-option v-for="el in elements" :key="el.id" :label="formatElementLabel(el)" :value="el.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称字段" prop="params.nameFieldId" :rules="req('名称字段')" style="margin-bottom:12px">
          <el-select v-model="model.nameFieldId" placeholder="选择名称字段" filterable clearable :disabled="!model.datasetId" style="width:100%">
            <el-option v-for="el in elements" :key="el.id" :label="formatElementLabel(el)" :value="el.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="值域代码集" prop="params.codesetId" :rules="req('值域代码集')">
          <el-select v-model="model.codesetId" placeholder="选择代码集" filterable clearable :loading="loadingCodesets" style="width:100%">
            <el-option v-for="cs in codesets" :key="cs.id" :label="cs.codesetName" :value="cs.id" />
          </el-select>
        </el-form-item>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import { ElLoading } from 'element-plus'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const req = (name) => [{ required: true, message: `${name}不能为空`, trigger: 'change' }]

const model = ref({ datasetId: null, codeFieldId: null, nameFieldId: null, codesetId: null, ...props.modelValue })
const elements = ref([])
const loadingElements = ref(false)
const codesets = ref([])
const loadingCodesets = ref(false)

watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const formatElementLabel = (el) => {
  const name = el.elementName || el.element_name || ''
  const code = el.elementCode || el.element_code || ''
  return code ? `${name}（${code}）` : name
}

const selectDataset = (dsId) => {
  model.value.datasetId = dsId
  model.value.codeFieldId = null
  model.value.nameFieldId = null
  fetchElements(dsId)
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

const copyElement = (el) => {
  // Show a tooltip or just highlight - for now just a convenience
}

const fetchCodesets = async () => {
  loadingCodesets.value = true
  try {
    const { data } = await axios.get('/api/codeset', { params: { page: 1, size: 200 } })
    codesets.value = data.data?.records || []
  } finally {
    loadingCodesets.value = false
  }
}

fetchCodesets()
if (model.value.datasetId) fetchElements(model.value.datasetId)
</script>

<style scoped>
.selector-wrapper {
  display: flex;
  gap: 16px;
  height: 350px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-right: 1px solid #dcdfe6;
}

.right-panel {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background-color: #fafbfc;
}

.dataset-section,
.element-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.section-header {
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  font-weight: 600;
  color: #606266;
  font-size: 12px;
}

.divider {
  height: 1px;
  background-color: #dcdfe6;
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
  font-size: 13px;
}

.dataset-item:hover {
  background-color: #f5f7fa;
}

.dataset-item.active {
  background-color: #e6f7ff;
  border-left: 3px solid #409eff;
  padding-left: 9px;
  font-weight: 500;
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
  transition: background-color 0.2s;
  font-size: 13px;
}

.element-item:hover {
  background-color: #f5f7fa;
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
