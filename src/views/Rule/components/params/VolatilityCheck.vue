<template>
  <el-form-item label="数据集" prop="params.datasetId" :rules="req('数据集')">
    <el-select v-model="model.datasetId" placeholder="选择数据集" filterable clearable style="width:100%">
      <el-option v-for="ds in datasets" :key="ds.id" :label="ds.datasetName" :value="ds.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="数据元" prop="params.elementId" :rules="req('数据元')">
    <el-select v-model="model.elementId" placeholder="选择数据元" filterable clearable :loading="loadingElements" :disabled="!model.datasetId" style="width:100%" @change="onDS">
      <el-option v-for="el in elements" :key="el.id" :label="elementLabel(el)" :value="el.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="分布阈值" prop="params.threshold" :rules="req('分布阈值')">
    <el-input-number v-model="model.threshold" :min="1" :max="100" style="width:180px" />
    <span style="margin-left:8px;color:#909399;font-size:12px">%</span>
  </el-form-item>
  <el-alert type="info" :closable="false" style="margin-top:8px">
    检查逻辑：统计本月该字段各取值的占比分布，与历史6个月均值对比，若任一取值占比变化超过 {{ model.threshold || '?' }}%，则标记为异常。
  </el-alert>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useDatasetElements } from './useDatasetElements.js'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const { elements, loadingElements, fetchElements, elementLabel } = useDatasetElements()
const req = (name) => [{ required: true, message: `${name}不能为空`, trigger: 'change' }]

const model = ref({ datasetId: null, elementId: null, threshold: 30, ...props.modelValue })
watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const onDS = () => { model.value.elementId = null; fetchElements(model.value.datasetId) }
watch(() => model.value.datasetId, (dsId) => { model.value.elementId = null; fetchElements(dsId) })
if (model.value.datasetId) fetchElements(model.value.datasetId)
</script>
