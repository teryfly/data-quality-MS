<template>
  <div>
    <div style="margin-bottom:16px;font-weight:600;color:#606266">源表</div>
    <el-form-item label="选择字段" prop="params.srcDatasetId" :rules="req('源数据集')">
      <DatasetElementSelector
        :model-value="{ datasetId: model.srcDatasetId, elementIds: model.srcFieldId ? [model.srcFieldId] : [] }"
        :datasets="datasets"
        data-set-label="数据集"
        element-label="字段"
        selection-label="已选字段"
        :multiple="false"
        @update:model-value="onSrcChange"
      />
    </el-form-item>
    <el-form-item label="关联字段" prop="params.joinFieldId" :rules="req('关联字段')">
      <el-select v-model="model.joinFieldId" placeholder="选择关联字段（从源表）" filterable clearable :disabled="!model.srcDatasetId" style="width:100%">
        <el-option v-for="el in srcElements" :key="el.id" :label="elementLabel(el)" :value="el.id" />
      </el-select>
    </el-form-item>

    <el-divider style="margin:20px 0" />

    <div style="margin-bottom:16px;font-weight:600;color:#606266">目标表</div>
    <el-form-item label="选择字段" prop="params.tgtDatasetId" :rules="req('目标数据集')">
      <DatasetElementSelector
        :model-value="{ datasetId: model.tgtDatasetId, elementIds: model.tgtFieldId ? [model.tgtFieldId] : [] }"
        :datasets="datasets"
        data-set-label="数据集"
        element-label="字段"
        selection-label="已选字段"
        :multiple="false"
        @update:model-value="onTgtChange"
      />
    </el-form-item>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import DatasetElementSelector from './DatasetElementSelector.vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const req = (name) => [{ required: true, message: `${name}不能为空`, trigger: 'change' }]
const elementLabel = (el) => el ? `${el.element_name}（${el.element_code}）` : ''

const model = ref({ srcDatasetId: null, srcFieldId: null, tgtDatasetId: null, tgtFieldId: null, joinFieldId: null, ...props.modelValue })
const srcElements = ref([])
const tgtElements = ref([])

watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const fetchEls = async (dsId, target) => {
  target.value = []
  if (!dsId) return
  try {
    const { data } = await axios.get(`/api/dataset/${dsId}/elements`)
    target.value = data.data?.records || data.data || []
  } catch (e) {
    console.error('Failed to fetch elements:', e)
  }
}

const onSrcChange = (val) => {
  model.value.srcDatasetId = val.datasetId
  model.value.srcFieldId = val.elementIds?.[0] || null
  model.value.joinFieldId = null
  fetchEls(val.datasetId, srcElements)
}

const onTgtChange = (val) => {
  model.value.tgtDatasetId = val.datasetId
  model.value.tgtFieldId = val.elementIds?.[0] || null
  fetchEls(val.datasetId, tgtElements)
}

if (model.value.srcDatasetId) fetchEls(model.value.srcDatasetId, srcElements)
if (model.value.tgtDatasetId) fetchEls(model.value.tgtDatasetId, tgtElements)
</script>
