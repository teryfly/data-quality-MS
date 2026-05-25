<template>
  <el-dialog v-model="visible" title="应用模板" width="720px" destroy-on-close @close="reset">
    <el-steps :active="step" align-center style="margin-bottom:24px">
      <el-step title="选择数据集" />
      <el-step title="确认规则" />
    </el-steps>

    <!-- Step 1: 选择数据集 -->
    <div v-if="step === 0">
      <el-form label-width="90px">
        <el-form-item label="目标数据集" required>
          <el-select
            v-model="form.datasetId"
            placeholder="请选择数据集"
            filterable
            style="width:100%"
          >
            <el-option v-for="d in datasets" :key="d.id" :label="d.datasetName" :value="d.id" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- Step 2: 规则明细 -->
    <div v-else>
      <div style="margin-bottom:8px;display:flex;gap:8px;align-items:center">
        <el-checkbox v-model="allChecked" :indeterminate="isIndeterminate" @change="toggleAll">全选</el-checkbox>
        <span style="color:#909399;font-size:13px">已选 {{ selectedRuleIds.length }} / {{ rules.length }} 条规则</span>
      </div>
      <el-table :data="rules" border stripe size="small">
        <el-table-column width="50" align="center">
          <template #default="{ row }">
            <el-checkbox v-model="row.checked" @change="updateAllCheck" />
          </template>
        </el-table-column>
        <el-table-column prop="ruleName" label="规则名称" min-width="200" />
        <el-table-column label="规则级别" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="levelType(row.ruleLevel)" size="small">{{ levelLabel(row.ruleLevel) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fieldType" label="涉及字段类型" min-width="140">
          <template #default="{ row }">{{ row.fieldType || '通用' }}</template>
        </el-table-column>
      </el-table>

      <div v-if="applySuccess" style="margin-top:16px;text-align:center">
        <el-result icon="success" :title="`成功生成 ${appliedCount} 条规则`" />
        <el-button type="primary" @click="goRuleList">前往规则列表</el-button>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button v-if="step === 0" type="primary" :disabled="!form.datasetId" @click="nextStep">下一步</el-button>
      <el-button v-if="step === 1 && !applySuccess" :loading="loading" type="primary" @click="handleApply">确认执行</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { mockDatasets } from '@/mocks/data/datasets.js'

const props = defineProps({
  modelValue: Boolean,
  template: Object
})
const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const visible = ref(false)
const step = ref(0)
const loading = ref(false)
const applySuccess = ref(false)
const appliedCount = ref(0)
const form = ref({ datasetId: null })
const rules = ref([])
const datasets = ref(mockDatasets)

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.template) loadRules()
})
watch(visible, (val) => emit('update:modelValue', val))

async function loadRules() {
  try {
    const res = await axios.get(`/api/template/${props.template.id}/items`)
    rules.value = (res.data.data || []).map(r => ({ ...r, checked: true }))
  } catch {
    rules.value = (props.template?.rules || []).map(r => ({ ...r, checked: true }))
  }
  updateAllCheck()
}

const allChecked = ref(true)
const isIndeterminate = ref(false)
const selectedRuleIds = computed(() => rules.value.filter(r => r.checked).map(r => r.id))

function updateAllCheck() {
  const checkedCount = rules.value.filter(r => r.checked).length
  allChecked.value = checkedCount === rules.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < rules.value.length
}

function toggleAll(val) {
  rules.value.forEach(r => r.checked = val)
  isIndeterminate.value = false
}

function nextStep() {
  if (!form.value.datasetId) return ElMessage.warning('请选择数据集')
  step.value = 1
}

async function handleApply() {
  if (!selectedRuleIds.value.length) return ElMessage.warning('请至少选择一条规则')
  loading.value = true
  try {
    const res = await axios.post(`/api/template/${props.template.id}/apply`, {
      datasetId: form.value.datasetId,
      ruleIds: selectedRuleIds.value
    })
    appliedCount.value = res.data.data?.appliedRuleCount || selectedRuleIds.value.length
    applySuccess.value = true
  } catch {
    ElMessage.error('应用失败，请重试')
  } finally {
    loading.value = false
  }
}

function goRuleList() {
  visible.value = false
  router.push('/rule/list')
}

function reset() {
  step.value = 0
  loading.value = false
  applySuccess.value = false
  appliedCount.value = 0
  form.value = { datasetId: null }
  rules.value = []
}

function levelType(level) {
  return { 1: 'danger', 2: 'warning', 3: 'info' }[level] || 'info'
}
function levelLabel(level) {
  return { 1: '严重', 2: '警告', 3: '提示' }[level] || '未知'
}
</script>
