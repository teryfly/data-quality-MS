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
    <el-form-item label="日期格式" prop="params.dateFormat" :rules="req('日期格式')" style="margin-top:16px">
      <el-select v-model="model.dateFormat" placeholder="选择日期格式" style="width:100%" @change="onFormatChange">
        <el-option v-for="opt in formatOptions" :key="opt.value" :value="opt.value">
          <span>{{ opt.value }}</span>
          <span style="color:#999;font-size:12px;margin-left:8px">示例：{{ opt.example }}</span>
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item v-if="model.dateFormat === '自定义'" label="自定义格式" prop="params.customFormat" :rules="req('自定义格式')">
      <el-input v-model="model.customFormat" placeholder="如: yyyy/MM/dd HH:mm" style="width:100%" />
    </el-form-item>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import DatasetElementSelector from './DatasetElementSelector.vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const req = (name) => [{ required: true, message: `${name}不能为空`, trigger: 'change' }]

const formatOptions = [
  { value: 'yyyy-MM-dd', example: '2026-05-24' },
  { value: 'yyyyMMdd', example: '20260524' },
  { value: 'yyyy/MM/dd', example: '2026/05/24' },
  { value: 'yyyy-MM-dd HH:mm:ss', example: '2026-05-24 14:30:00' },
  { value: 'yyyyMMddHHmmss', example: '20260524143000' },
  { value: 'HH:mm:ss', example: '14:30:00' },
  { value: '自定义', example: '用户填写' },
]

const model = ref({ datasetId: null, elementId: null, dateFormat: null, customFormat: '', ...props.modelValue })
watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const onSelectorChange = (val) => {
  model.value.datasetId = val.datasetId
  model.value.elementId = val.elementIds?.[0] || null
}
const onFormatChange = () => { if (model.value.dateFormat !== '自定义') model.value.customFormat = '' }
</script>
