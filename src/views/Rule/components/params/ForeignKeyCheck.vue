<template>
  <div>
    <!-- Main table -->
    <div style="margin-bottom:16px;font-weight:600;color:#606266">主表</div>
    <el-form-item label="选择字段" prop="params.mainDatasetId" :rules="req('主数据集')">
      <DatasetElementSelector
        :model-value="{ datasetId: model.mainDatasetId, elementIds: model.mainFieldId ? [model.mainFieldId] : [] }"
        :datasets="datasets"
        data-set-label="数据集"
        element-label="字段"
        selection-label="已选字段"
        :multiple="false"
        @update:model-value="onMainChange"
      />
    </el-form-item>

    <el-divider style="margin:20px 0" />

    <!-- Referenced table -->
    <div style="margin-bottom:16px;font-weight:600;color:#606266">被引用表</div>
    <el-form-item label="选择字段" prop="params.refDatasetId" :rules="req('被引用数据集')">
      <DatasetElementSelector
        :model-value="{ datasetId: model.refDatasetId, elementIds: model.refFieldId ? [model.refFieldId] : [] }"
        :datasets="datasets"
        data-set-label="数据集"
        element-label="字段"
        selection-label="已选字段"
        :multiple="false"
        @update:model-value="onRefChange"
      />
    </el-form-item>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import DatasetElementSelector from './DatasetElementSelector.vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const req = (name) => [{ required: true, message: `${name}不能为空`, trigger: 'change' }]

const model = ref({ mainDatasetId: null, mainFieldId: null, refDatasetId: null, refFieldId: null, ...props.modelValue })

watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const onMainChange = (val) => {
  model.value.mainDatasetId = val.datasetId
  model.value.mainFieldId = val.elementIds?.[0] || null
}

const onRefChange = (val) => {
  model.value.refDatasetId = val.datasetId
  model.value.refFieldId = val.elementIds?.[0] || null
}
</script>
