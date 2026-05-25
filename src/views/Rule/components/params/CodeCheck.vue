<template>
  <div>
    <DatasetElementSelector
      :model-value="{ datasetId: model.datasetId, elementIds: model.elementId ? [model.elementId] : [] }"
      :datasets="datasets"
      data-set-label="数据集"
      element-label="数据元"
      selection-label="已选数据元"
      :multiple="false"
      @update:model-value="onSelectorChange"
    />
    <el-form-item label="代码集" prop="params.codesetId" :rules="req('代码集')" style="margin-top:16px">
      <el-select v-model="model.codesetId" placeholder="选择代码集" filterable clearable :loading="loadingCodesets" style="width:100%">
        <el-option v-for="cs in codesets" :key="cs.id" :label="cs.codesetName" :value="cs.id" />
      </el-select>
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

const model = ref({ datasetId: null, elementId: null, codesetId: null, ...props.modelValue })
const codesets = ref([])
const loadingCodesets = ref(false)

watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const onSelectorChange = (val) => {
  model.value.datasetId = val.datasetId
  model.value.elementId = val.elementIds?.[0] || null
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
</script>
