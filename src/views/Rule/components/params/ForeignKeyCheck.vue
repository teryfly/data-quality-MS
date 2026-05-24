<template>
  <!-- Main table -->
  <div style="margin-bottom:4px;font-weight:600;color:#606266">主表</div>
  <el-form-item label="主数据集" prop="params.mainDatasetId" :rules="req('主数据集')">
    <el-select v-model="model.mainDatasetId" placeholder="选择数据集" filterable clearable style="width:100%" @change="onMainDS">
      <el-option v-for="ds in datasets" :key="ds.id" :label="ds.datasetName" :value="ds.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="主字段" prop="params.mainFieldId" :rules="req('主字段')">
    <el-select v-model="model.mainFieldId" placeholder="选择字段" filterable clearable :loading="loadingMain" :disabled="!model.mainDatasetId" style="width:100%">
      <el-option v-for="el in mainElements" :key="el.id" :label="elementLabel(el)" :value="el.id" />
    </el-select>
  </el-form-item>

  <el-divider />

  <!-- Referenced table -->
  <div style="margin-bottom:4px;font-weight:600;color:#606266">被引用表</div>
  <el-form-item label="被引用数据集" prop="params.refDatasetId" :rules="req('被引用数据集')">
    <el-select v-model="model.refDatasetId" placeholder="选择数据集" filterable clearable style="width:100%" @change="onRefDS">
      <el-option v-for="ds in datasets" :key="ds.id" :label="ds.datasetName" :value="ds.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="被引用字段" prop="params.refFieldId" :rules="req('被引用字段')">
    <el-select v-model="model.refFieldId" placeholder="选择字段" filterable clearable :loading="loadingRef" :disabled="!model.refDatasetId" style="width:100%">
      <el-option v-for="el in refElements" :key="el.id" :label="elementLabel(el)" :value="el.id" />
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

const model = ref({ mainDatasetId: null, mainFieldId: null, refDatasetId: null, refFieldId: null, ...props.modelValue })
const mainElements = ref([])
const refElements = ref([])
const loadingMain = ref(false)
const loadingRef = ref(false)

watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const fetchEls = async (dsId, target, loading) => {
  target.value = []; if (!dsId) return
  loading.value = true
  try { const { data } = await axios.get(`/api/dataset/${dsId}/elements`); target.value = data.data?.records || data.data || [] } finally { loading.value = false }
}
const onMainDS = () => { model.value.mainFieldId = null; fetchEls(model.value.mainDatasetId, mainElements, loadingMain) }
const onRefDS = () => { model.value.refFieldId = null; fetchEls(model.value.refDatasetId, refElements, loadingRef) }

if (model.value.mainDatasetId) fetchEls(model.value.mainDatasetId, mainElements, loadingMain)
if (model.value.refDatasetId) fetchEls(model.value.refDatasetId, refElements, loadingRef)
</script>
