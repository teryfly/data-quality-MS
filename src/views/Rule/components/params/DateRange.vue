<template>
  <el-form-item label="数据集" prop="params.datasetId" :rules="req('数据集')">
    <el-select v-model="model.datasetId" placeholder="选择数据集" filterable clearable style="width:100%" @change="onDS">
      <el-option v-for="ds in datasets" :key="ds.id" :label="ds.datasetName" :value="ds.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="当前日期字段" prop="params.currentFieldId" :rules="req('当前日期字段')">
    <el-select v-model="model.currentFieldId" placeholder="选择字段" filterable clearable :loading="loadingElements" :disabled="!model.datasetId" style="width:100%">
      <el-option v-for="el in elements" :key="el.id" :label="elementLabel(el)" :value="el.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="开始日期字段" prop="params.startFieldId" :rules="req('开始日期字段')">
    <el-select v-model="model.startFieldId" placeholder="选择字段" filterable clearable :loading="loadingElements" :disabled="!model.datasetId" style="width:100%">
      <el-option v-for="el in elements" :key="el.id" :label="elementLabel(el)" :value="el.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="结束日期字段" prop="params.endFieldId" :rules="req('结束日期字段')">
    <el-select v-model="model.endFieldId" placeholder="选择字段" filterable clearable :loading="loadingElements" :disabled="!model.datasetId" style="width:100%">
      <el-option v-for="el in elements" :key="el.id" :label="elementLabel(el)" :value="el.id" />
    </el-select>
  </el-form-item>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useDatasetElements } from './useDatasetElements.js'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const { elements, loadingElements, fetchElements, elementLabel } = useDatasetElements()
const req = (name) => [{ required: true, message: `${name}不能为空`, trigger: 'change' }]

const model = ref({ datasetId: null, currentFieldId: null, startFieldId: null, endFieldId: null, ...props.modelValue })
watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const onDS = () => { model.value.currentFieldId = null; model.value.startFieldId = null; model.value.endFieldId = null; fetchElements(model.value.datasetId) }
if (model.value.datasetId) fetchElements(model.value.datasetId)
</script>
