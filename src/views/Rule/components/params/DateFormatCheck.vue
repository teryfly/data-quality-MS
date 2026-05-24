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
  <el-form-item label="日期格式" prop="params.dateFormat" :rules="req('日期格式')">
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
</template>
<script setup>
import { ref, watch } from 'vue'
import { useDatasetElements } from './useDatasetElements.js'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const { elements, loadingElements, fetchElements, elementLabel } = useDatasetElements()
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

const onDS = () => { model.value.elementId = null; fetchElements(model.value.datasetId) }
const onFormatChange = () => { if (model.value.dateFormat !== '自定义') model.value.customFormat = '' }
if (model.value.datasetId) fetchElements(model.value.datasetId)
</script>
