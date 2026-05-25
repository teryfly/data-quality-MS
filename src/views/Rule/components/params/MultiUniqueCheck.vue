<template>
  <div>
    <el-form-item label="选择字段" prop="params.datasetId" :rules="req('数据集')">
      <DatasetElementSelector
        :model-value="{ datasetId: model.datasetId, elementIds: model.elementIds }"
        :datasets="datasets"
        data-set-label="数据集列表"
        element-label="字段列表"
        selection-label="已选字段"
        multiple
        @update:model-value="onSelectorChange"
      />
    </el-form-item>
    <el-form-item prop="params.elementIds" :rules="multiRule" style="margin-top: 16px">
      <template #label>&nbsp;</template>
      <div v-if="duplicateWarning" style="color:#f56c6c;font-size:12px">多字段联合唯一检查至少需要选择2个字段</div>
    </el-form-item>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import DatasetElementSelector from './DatasetElementSelector.vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const req = (name) => [{ required: true, message: `${name}不能为空`, trigger: 'change' }]
const multiRule = [{ validator: (_, v, cb) => { if (!v || v.length < 2) cb('多字段联合唯一检查至少需要选择2个字段'); else cb() }, trigger: 'change' }]

const model = ref({ datasetId: null, elementIds: [], ...props.modelValue })
const duplicateWarning = ref(false)

watch(model, (v) => { checkDuplicate(); emit('update:modelValue', { ...v }) }, { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const onSelectorChange = (val) => {
  model.value.datasetId = val.datasetId
  model.value.elementIds = val.elementIds
}
const checkDuplicate = () => { const s = new Set(model.value.elementIds); duplicateWarning.value = s.size !== model.value.elementIds.length }
if (model.value.datasetId) checkDuplicate()
</script>
