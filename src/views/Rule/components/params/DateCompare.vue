<template>
  <el-form-item label="数据集" prop="params.datasetId" :rules="req('数据集')">
    <el-select v-model="model.datasetId" placeholder="选择数据集" filterable clearable style="width:100%" @change="onDS">
      <el-option v-for="ds in datasets" :key="ds.id" :label="ds.datasetName" :value="ds.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="当前日期字段" prop="params.currentFieldId" :rules="req('当前日期字段')">
    <el-select v-model="model.currentFieldId" placeholder="选择字段" filterable clearable :loading="loadingElements" :disabled="!model.datasetId" style="width:100%" @change="checkSameField">
      <el-option v-for="el in elements" :key="el.id" :label="elementLabel(el)" :value="el.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="比较运算符" prop="params.operator" :rules="req('比较运算符')">
    <el-select v-model="model.operator" style="width:160px">
      <el-option v-for="op in operators" :key="op.value" :label="op.label" :value="op.value" />
    </el-select>
  </el-form-item>
  <el-form-item label="关联日期字段" prop="params.relatedFieldId" :rules="req('关联日期字段')">
    <el-select v-model="model.relatedFieldId" placeholder="选择字段" filterable clearable :loading="loadingElements" :disabled="!model.datasetId" style="width:100%" @change="checkSameField">
      <el-option v-for="el in elements" :key="el.id" :label="elementLabel(el)" :value="el.id" />
    </el-select>
    <div v-if="sameFieldWarning" style="color:#e6a23c;font-size:12px;margin-top:4px">当前日期字段与关联日期字段不能相同</div>
  </el-form-item>
</template>
<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useDatasetElements } from './useDatasetElements.js'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const { elements, loadingElements, fetchElements, elementLabel } = useDatasetElements()
const req = (name) => [{ required: true, message: `${name}不能为空`, trigger: 'change' }]

const operators = [
  { value: '>=', label: '>= (大于等于)' },
  { value: '<=', label: '<= (小于等于)' },
  { value: '=', label: '= (等于)' },
  { value: '>', label: '> (大于)' },
  { value: '<', label: '< (小于)' },
]

const model = ref({ datasetId: null, currentFieldId: null, operator: '>=', relatedFieldId: null, ...props.modelValue })
const sameFieldWarning = ref(false)

watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const onDS = () => { model.value.currentFieldId = null; model.value.relatedFieldId = null; fetchElements(model.value.datasetId) }
const checkSameField = () => {
  sameFieldWarning.value = model.value.currentFieldId && model.value.relatedFieldId && model.value.currentFieldId === model.value.relatedFieldId
  if (sameFieldWarning.value) ElMessage.warning('当前日期字段与关联日期字段不能相同')
}
if (model.value.datasetId) fetchElements(model.value.datasetId)
</script>
