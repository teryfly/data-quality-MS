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
    <el-form-item label="最小长度" prop="params.minLength" style="margin-top:16px">
      <el-input-number v-model="model.minLength" :min="0" :max="model.maxLength || 9999" style="width:180px" @change="validateRange" />
    </el-form-item>
    <el-form-item label="最大长度" prop="params.maxLength" :rules="maxRule">
      <el-input-number v-model="model.maxLength" :min="model.minLength || 0" style="width:180px" @change="validateRange" />
      <span v-if="rangeError" style="color:#f56c6c;margin-left:8px;font-size:12px">最大值不能小于最小值</span>
    </el-form-item>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import DatasetElementSelector from './DatasetElementSelector.vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const req = (name) => [{ required: true, message: `${name}不能为空`, trigger: 'change' }]

const model = ref({ datasetId: null, elementId: null, minLength: 0, maxLength: 100, ...props.modelValue })
const rangeError = ref(false)
const maxRule = [{ validator: (_, v, cb) => { if (v != null && model.value.minLength != null && v < model.value.minLength) { cb('最大值不能小于最小值') } else cb() }, trigger: 'blur' }]

watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const onSelectorChange = (val) => {
  model.value.datasetId = val.datasetId
  model.value.elementId = val.elementIds?.[0] || null
}
const validateRange = () => { rangeError.value = model.value.maxLength < model.value.minLength }
</script>
