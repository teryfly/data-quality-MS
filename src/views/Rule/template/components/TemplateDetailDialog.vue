<template>
  <el-dialog v-model="visible" :title="`模板明细 — ${template?.templateName}`" width="720px" destroy-on-close>
    <el-table :data="rules" border stripe size="small">
      <el-table-column prop="ruleName" label="规则名称" min-width="200" />
      <el-table-column label="规则级别" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="levelType(row.ruleLevel)" size="small">{{ levelLabel(row.ruleLevel) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="fieldType" label="涉及字段类型" min-width="150">
        <template #default="{ row }">{{ row.fieldType || '通用' }}</template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  modelValue: Boolean,
  template: Object
})
const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const rules = ref([])

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.template) fetchRules()
})
watch(visible, (val) => emit('update:modelValue', val))

async function fetchRules() {
  try {
    const res = await axios.get(`/api/template/${props.template.id}/items`)
    rules.value = res.data.data || []
  } catch {
    rules.value = props.template?.rules || []
  }
}

function levelType(level) {
  return { 1: 'danger', 2: 'warning', 3: 'info' }[level] || 'info'
}
function levelLabel(level) {
  return { 1: '严重', 2: '警告', 3: '提示' }[level] || '未知'
}
</script>
