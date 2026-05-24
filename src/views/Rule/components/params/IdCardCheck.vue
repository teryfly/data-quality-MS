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
  <el-form-item label="证件类型" prop="params.idType" :rules="req('证件类型')">
    <el-select v-model="model.idType" placeholder="选择证件类型" style="width:100%">
      <el-option v-for="t in idTypes" :key="t.value" :label="t.label" :value="t.value" />
    </el-select>
  </el-form-item>
  <el-alert v-if="model.idType === 'resident_id'" type="info" :closable="false" style="margin-bottom:8px">
    将执行18位身份证格式、出生日期有效性、校验位验证
  </el-alert>
  <el-alert v-else-if="model.idType" type="info" :closable="false" style="margin-bottom:8px">
    将执行对应证件的格式规范校验
  </el-alert>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useDatasetElements } from './useDatasetElements.js'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const { elements, loadingElements, fetchElements, elementLabel } = useDatasetElements()
const req = (name) => [{ required: true, message: `${name}不能为空`, trigger: 'change' }]

const idTypes = [
  { value: 'resident_id', label: '居民身份证' },
  { value: 'military', label: '军官证' },
  { value: 'passport', label: '护照' },
  { value: 'social_security', label: '社保卡' },
  { value: 'birth_cert', label: '出生医学证明' },
  { value: 'hk_macao', label: '港澳居民来往内地通行证' },
  { value: 'taiwan', label: '台湾居民来往内地通行证' },
  { value: 'foreign_permanent', label: '外国人永久居留身份证' },
  { value: 'other', label: '其他' },
]

const model = ref({ datasetId: null, elementId: null, idType: null, ...props.modelValue })
watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const onDS = () => { model.value.elementId = null; fetchElements(model.value.datasetId) }
if (model.value.datasetId) fetchElements(model.value.datasetId)
</script>
