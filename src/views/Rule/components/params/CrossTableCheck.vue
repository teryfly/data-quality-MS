<template>
  <div style="margin-bottom:4px;font-weight:600;color:#606266">源表</div>
  <el-form-item label="源数据集" prop="params.srcDatasetId" :rules="req('源数据集')">
    <el-select v-model="model.srcDatasetId" placeholder="选择数据集" filterable clearable style="width:100%" @change="onSrcDS">
      <el-option v-for="ds in datasets" :key="ds.id" :label="ds.datasetName" :value="ds.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="源字段" prop="params.srcFieldId" :rules="req('源字段')">
    <el-select v-model="model.srcFieldId" placeholder="选择字段" filterable clearable :loading="loadingSrc" :disabled="!model.srcDatasetId" style="width:100%">
      <el-option v-for="el in srcElements" :key="el.id" :label="elementLabel(el)" :value="el.id" />
    </el-select>
  </el-form-item>
  <el-divider />
  <div style="margin-bottom:4px;font-weight:600;color:#606266">目标表</div>
  <el-form-item label="目标数据集" prop="params.tgtDatasetId" :rules="req('目标数据集')">
    <el-select v-model="model.tgtDatasetId" placeholder="选择数据集" filterable clearable style="width:100%" @change="onTgtDS">
      <el-option v-for="ds in datasets" :key="ds.id" :label="ds.datasetName" :value="ds.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="目标字段" prop="params.tgtFieldId" :rules="req('目标字段')">
    <el-select v-model="model.tgtFieldId" placeholder="选择字段" filterable clearable :loading="loadingTgt" :disabled="!model.tgtDatasetId" style="width:100%">
      <el-option v-for="el in tgtElements" :key="el.id" :label="elementLabel(el)" :value="el.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="关联字段" prop="params.joinFieldId" :rules="req('关联字段')">
    <el-select v-model="model.joinFieldId" placeholder="选择关联字段（从源表）" filterable clearable :loading="loadingSrc" :disabled="!model.srcDatasetId" style="width:100%">
      <el-option v-for="el in srcElements" :key="el.id" :label="elementLabel(el)" :value="el.id" />
    </el-select>
  </el-form-item>
</template>
<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const req = (name) => [{ required: true, message: `${name}不能为空`, trigger: 'change' }]
const elementLabel = (el) => el ? `${el.element_name}（${el.element_code}）` : ''

const model = ref({ srcDatasetId: null, srcFieldId: null, tgtDatasetId: null, tgtFieldId: null, joinFieldId: null, ...props.modelValue })
const srcElements = ref([])
const tgtElements = ref([])
const loadingSrc = ref(false)
const loadingTgt = ref(false)

watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const fetchEls = async (dsId, target, loading) => {
  target.value = []; if (!dsId) return
  loading.value = true
  try { const { data } = await axios.get(`/api/dataset/${dsId}/elements`); target.value = data.data?.records || data.data || [] } finally { loading.value = false }
}
const onSrcDS = () => { model.value.srcFieldId = null; model.value.joinFieldId = null; fetchEls(model.value.srcDatasetId, srcElements, loadingSrc) }
const onTgtDS = () => { model.value.tgtFieldId = null; fetchEls(model.value.tgtDatasetId, tgtElements, loadingTgt) }

if (model.value.srcDatasetId) fetchEls(model.value.srcDatasetId, srcElements, loadingSrc)
if (model.value.tgtDatasetId) fetchEls(model.value.tgtDatasetId, tgtElements, loadingTgt)
</script>
