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
    <el-form-item label="证件类型" prop="params.idType" :rules="req('证件类型')" style="margin-top:16px">
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
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import DatasetElementSelector from './DatasetElementSelector.vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
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

const onSelectorChange = (val) => {
  model.value.datasetId = val.datasetId
  model.value.elementId = val.elementIds?.[0] || null
}
</script>
