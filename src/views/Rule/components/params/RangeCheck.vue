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
  <el-form-item label="最小值" prop="params.minVal">
    <el-input-number v-model="model.minVal" style="width:180px" />
  </el-form-item>
  <el-form-item label="最大值" prop="params.maxVal" :rules="maxRule">
    <el-input-number v-model="model.maxVal" style="width:180px" @blur="validateRange" />
    <span v-if="rangeError" style="color:#f56c6c;margin-left:8px;font-size:12px">最大值不能小于最小值</span>
  </el-form-item>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useDatasetElements } from './useDatasetElements.js'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const { elements, loadingElements, fetchElements, elementLabel } = useDatasetElements()
const req = (name) => [{ required: true, message: `${name}不能为空`, trigger: 'change' }]

const model = ref({ datasetId: null, elementId: null, minVal: null, maxVal: null, ...props.modelValue })
const rangeError = ref(false)
const maxRule = [{ validator: (_, v, cb) => { if (v != null && model.value.minVal != null && v < model.value.minVal) cb('最大值不能小于最小值'); else cb() }, trigger: 'blur' }]

watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const onDS = () => { model.value.elementId = null; fetchElements(model.value.datasetId) }
const validateRange = () => { rangeError.value = model.value.maxVal != null && model.value.minVal != null && model.value.maxVal < model.value.minVal }
if (model.value.datasetId) fetchElements(model.value.datasetId)
</script>
