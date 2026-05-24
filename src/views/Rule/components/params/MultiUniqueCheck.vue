<template>
  <el-form-item label="数据集" prop="params.datasetId" :rules="req('数据集')">
    <el-select v-model="model.datasetId" placeholder="选择数据集" filterable clearable style="width:100%" @change="onDS">
      <el-option v-for="ds in datasets" :key="ds.id" :label="ds.datasetName" :value="ds.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="数据元（多选）" prop="params.elementIds" :rules="multiRule">
    <el-select
      v-model="model.elementIds"
      multiple
      filterable
      clearable
      collapse-tags
      :loading="loadingElements"
      :disabled="!model.datasetId"
      placeholder="选择至少2个字段"
      style="width:100%"
    >
      <el-option v-for="el in elements" :key="el.id" :label="elementLabel(el)" :value="el.id" />
    </el-select>
  </el-form-item>
  <div v-if="model.elementIds && model.elementIds.length >= 2" style="margin-bottom:16px">
    <div style="font-size:12px;color:#909399;margin-bottom:8px">拖拽调整顺序：</div>
    <draggable v-model="model.elementIds" item-key="item" handle=".drag-tag" animation="150" @end="checkDuplicate">
      <template #item="{ element }">
        <el-tag class="drag-tag" style="cursor:grab;margin-right:6px;margin-bottom:4px" closable @close="removeField(element)">
          {{ elementLabel(elements.find(e => e.id === element) || { element_name: element, element_code: '' }) }}
        </el-tag>
      </template>
    </draggable>
  </div>
  <div v-if="duplicateWarning" style="color:#f56c6c;font-size:12px">多字段联合唯一检查至少需要选择2个字段</div>
</template>
<script setup>
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { useDatasetElements } from './useDatasetElements.js'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, datasets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const { elements, loadingElements, fetchElements, elementLabel } = useDatasetElements()
const req = (name) => [{ required: true, message: `${name}不能为空`, trigger: 'change' }]
const multiRule = [{ validator: (_, v, cb) => { if (!v || v.length < 2) cb('多字段联合唯一检查至少需要选择2个字段'); else cb() }, trigger: 'change' }]

const model = ref({ datasetId: null, elementIds: [], ...props.modelValue })
const duplicateWarning = ref(false)

watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const onDS = () => { model.value.elementIds = []; fetchElements(model.value.datasetId) }
const removeField = (id) => { model.value.elementIds = model.value.elementIds.filter(i => i !== id) }
const checkDuplicate = () => { const s = new Set(model.value.elementIds); duplicateWarning.value = s.size !== model.value.elementIds.length }
if (model.value.datasetId) fetchElements(model.value.datasetId)
</script>
