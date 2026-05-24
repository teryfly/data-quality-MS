<template>
  <el-form-item label="数据集" prop="params.datasetId" :rules="req('数据集')">
    <el-select v-model="model.datasetId" placeholder="选择数据集" filterable clearable style="width:100%" @change="onDS">
      <el-option v-for="ds in datasets" :key="ds.id" :label="ds.datasetName" :value="ds.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="数据元（被检查字段）" prop="params.elementId" :rules="req('数据元')">
    <el-select v-model="model.elementId" placeholder="选择字段" filterable clearable :loading="loadingElements" :disabled="!model.datasetId" style="width:100%">
      <el-option v-for="el in elements" :key="el.id" :label="elementLabel(el)" :value="el.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="业务时间字段" prop="params.bizTimeFieldId" :rules="req('业务时间字段')">
    <el-select v-model="model.bizTimeFieldId" placeholder="选择业务时间字段" filterable clearable :loading="loadingElements" :disabled="!model.datasetId" style="width:100%">
      <el-option v-for="el in elements" :key="el.id" :label="elementLabel(el)" :value="el.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="允许延迟天数" prop="params.maxDelayDays" :rules="req('允许延迟天数')">
    <el-input-number v-model="model.maxDelayDays" :min="0" :max="365" style="width:200px" />
    <span style="margin-left:8px;color:#909399;font-size:12px">天</span>
  </el-form-item>
  <el-alert v-if="model.bizTimeFieldId && model.maxDelayDays != null" type="info" :closable="false" style="margin-bottom:8px">
    检查逻辑：业务时间字段 距今超过 {{ model.maxDelayDays }} 天但 数据元 仍为空
  </el-alert>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useDatasetElements } from './useDatasetElements.js'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const { elements, loadingElements, fetchElements, elementLabel } = useDatasetElements()
const req = (name) => [{ required: true, message: `${name}不能为空`, trigger: 'change' }]

const model = ref({ datasetId: null, elementId: null, bizTimeFieldId: null, maxDelayDays: 7, ...props.modelValue })
watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const onDS = () => { model.value.elementId = null; model.value.bizTimeFieldId = null; fetchElements(model.value.datasetId) }
if (model.value.datasetId) fetchElements(model.value.datasetId)
</script>
