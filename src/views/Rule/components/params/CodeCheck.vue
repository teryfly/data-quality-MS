<template>
  <el-form-item label="数据集" prop="params.datasetId" :rules="req('数据集')">
    <el-select v-model="model.datasetId" placeholder="选择数据集" filterable clearable style="width:100%" @change="onDS">
      <el-option v-for="ds in datasets" :key="ds.id" :label="ds.datasetName" :value="ds.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="数据元" prop="params.elementId" :rules="req('数据元')">
    <el-select v-model="model.elementId" placeholder="选择数据元" filterable clearable :loading="loadingElements" :disabled="!model.datasetId" style="width:100%">
      <el-option v-for="el in elements" :key="el.id" :label="elementLabel(el)" :value="el.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="代码集" prop="params.codesetId" :rules="req('代码集')">
    <el-select v-model="model.codesetId" placeholder="选择代码集" filterable clearable :loading="loadingCodesets" style="width:100%">
      <el-option v-for="cs in codesets" :key="cs.id" :label="cs.codesetName" :value="cs.id" />
    </el-select>
  </el-form-item>
</template>
<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import { useDatasetElements } from './useDatasetElements.js'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const { elements, loadingElements, fetchElements, elementLabel } = useDatasetElements()
const req = (name) => [{ required: true, message: `${name}不能为空`, trigger: 'change' }]

const model = ref({ datasetId: null, elementId: null, codesetId: null, ...props.modelValue })
const codesets = ref([])
const loadingCodesets = ref(false)

watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const onDS = () => { model.value.elementId = null; fetchElements(model.value.datasetId) }
if (model.value.datasetId) fetchElements(model.value.datasetId)

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
</script>
