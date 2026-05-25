<template>
  <DatasetElementSelector
    :model-value="{ datasetId: model.datasetId, elementIds: model.elementId ? [model.elementId] : [] }"
    :datasets="datasets"
    data-set-label="数据集"
    element-label="数据元"
    selection-label="已选数据元"
    :multiple="false"
    @update:model-value="onSelectorChange"
  />
</template>
<script setup>
import { ref, watch } from 'vue'
import DatasetElementSelector from './DatasetElementSelector.vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])

const model = ref({ datasetId: null, elementId: null, ...props.modelValue })
watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const onSelectorChange = (val) => {
  model.value.datasetId = val.datasetId
  model.value.elementId = val.elementIds?.[0] || null
}
</script>
