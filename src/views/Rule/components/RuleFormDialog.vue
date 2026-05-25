<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑规则' : '新增规则'"
    width="860px"
    destroy-on-close
    :before-close="handleBeforeClose"
    class="rule-form-dialog"
  >
    <el-steps :active="step" align-center style="margin-bottom:28px">
      <el-step title="基本信息" />
      <el-step title="规则参数配置" />
      <el-step title="SQL预览与测试" />
    </el-steps>

    <!-- Step 1: Basic info -->
    <el-form
      v-show="step === 0"
      ref="step1Ref"
      :model="form"
      :rules="step1Rules"
      label-width="110px"
    >
      <el-form-item label="规则名称" prop="ruleName">
        <el-input v-model="form.ruleName" maxlength="200" show-word-limit placeholder="请输入规则名称" />
      </el-form-item>
      <el-form-item label="规则描述" prop="ruleDesc">
        <el-input v-model="form.ruleDesc" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="选填" />
      </el-form-item>
      <el-form-item label="规则分类" prop="categoryId">
        <el-select v-model="form.categoryId" placeholder="选择规则分类" filterable style="width:100%">
          <el-option v-for="cat in categories" :key="cat.id" :label="cat.categoryName" :value="cat.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="规则级别" prop="ruleLevel">
        <el-radio-group v-model="form.ruleLevel">
          <el-radio :value="1">严重</el-radio>
          <el-radio :value="2">警告</el-radio>
          <el-radio :value="3">提示</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="执行频率" prop="executeFrequency">
        <el-select v-model="form.executeFrequency" placeholder="选择执行频率" style="width:200px">
          <el-option label="每日" value="daily" />
          <el-option label="每周" value="weekly" />
          <el-option label="每月" value="monthly" />
          <el-option label="手动" value="manual" />
        </el-select>
      </el-form-item>
      <el-form-item label="适用范围" prop="applyScope">
        <el-radio-group v-model="form.applyScope">
          <el-radio :value="1">全机构</el-radio>
          <el-radio :value="2">指定机构</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.applyScope === 2" label="适用机构" prop="orgIds">
        <el-select v-model="form.orgIds" multiple filterable collapse-tags placeholder="选择机构" style="width:100%">
          <el-option v-for="org in orgs" :key="org.id" :label="org.orgName" :value="org.id" />
        </el-select>
      </el-form-item>
    </el-form>

    <!-- Step 2: Rule params -->
    <el-form
      v-show="step === 1"
      ref="step2Ref"
      :model="form"
      label-width="150px"
    >
      <el-alert v-if="!form.categoryId" type="warning" :closable="false" style="margin-bottom:16px">
        请先在第一步选择规则分类
      </el-alert>
      <template v-else>
        <component
          :is="currentParamComp"
          v-model="form.params"
          :datasets="allDatasets"
          @validate-result="onValidateResult"
        />
      </template>
    </el-form>

    <!-- Step 3: SQL preview & test -->
    <div v-show="step === 2">
      <div style="display:flex;align-items:center;margin-bottom:12px">
        <span style="font-size:14px;font-weight:600">SQL预览</span>
        <el-switch v-model="customSqlMode" active-text="自定义SQL" style="margin-left:16px" />
      </div>

      <template v-if="!customSqlMode">
        <pre v-if="previewSql" v-html="highlightedSql" style="background:#282c34;color:#abb2bf;padding:16px;border-radius:6px;font-family:monospace;font-size:13px;overflow:auto;max-height:300px;white-space:pre-wrap" />
        <el-skeleton v-else :rows="5" animated />
      </template>
      <template v-else>
        <el-input v-model="form.customSql" type="textarea" :rows="10" style="font-family:monospace;font-size:13px" placeholder="输入自定义SQL" />
      </template>

      <div style="margin-top:16px">
        <el-button
          v-permission="'rule:test'"
          type="primary"
          :loading="testing"
          @click="handleTest"
        >测试规则</el-button>
      </div>

      <template v-if="testing || testResult">
        <el-progress v-if="testing" :percentage="testProgress" style="margin-top:12px" />
        <template v-if="testResult">
          <div style="margin-top:12px;font-size:13px;color:#606266">
            共发现 <b style="color:#f56c6c">{{ testResult.problemCount }}</b> 条问题数据（最多展示100条）：
          </div>
          <el-table :data="testResult.problems" border size="small" style="margin-top:8px">
            <el-table-column prop="businessId" label="业务ID" width="160" />
            <el-table-column prop="problemValue" label="问题值" />
            <el-table-column prop="problemDesc" label="问题描述" show-overflow-tooltip />
            <el-table-column prop="createTime" label="时间" width="160" />
          </el-table>
        </template>
      </template>

      <el-alert type="warning" :closable="false" style="margin-top:12px">
        测试结果仅供预览，不计入正式统计
      </el-alert>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button v-if="step > 0" @click="step--">上一步</el-button>
      <el-button v-if="step < 2" type="primary" :loading="stepLoading" @click="handleNext">下一步</el-button>
      <el-button v-if="step === 2" type="primary" :loading="saving" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import hljs from 'highlight.js/lib/core'
import sql from 'highlight.js/lib/languages/sql'
import 'highlight.js/styles/atom-one-dark.css'

hljs.registerLanguage('sql', sql)

// Param components
import NullCheck from './params/NullCheck.vue'
import CodeCheck from './params/CodeCheck.vue'
import LengthCheck from './params/LengthCheck.vue'
import RangeCheck from './params/RangeCheck.vue'
import DateFormatCheck from './params/DateFormatCheck.vue'
import DateCompare from './params/DateCompare.vue'
import DateRange from './params/DateRange.vue'
import UniqueCheck from './params/UniqueCheck.vue'
import MultiUniqueCheck from './params/MultiUniqueCheck.vue'
import ForeignKeyCheck from './params/ForeignKeyCheck.vue'
import CrossTableCheck from './params/CrossTableCheck.vue'
import CodeNameCheck from './params/CodeNameCheck.vue'
import TimelinessCheck from './params/TimelinessCheck.vue'
import VolatilityCheck from './params/VolatilityCheck.vue'
import ConditionalCheck from './params/ConditionalCheck.vue'
import IdCardCheck from './params/IdCardCheck.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editData: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
const isEdit = computed(() => !!props.editData)

const step = ref(0)
const step1Ref = ref(null)
const step2Ref = ref(null)
const stepLoading = ref(false)
const saving = ref(false)
const testing = ref(false)
const testProgress = ref(0)
const testResult = ref(null)
const previewSql = ref('')
const customSqlMode = ref(false)
const allDatasets = ref([])
const orgs = ref([])
const conditionalValid = ref(true)

const defaultForm = () => ({
  ruleName: '', ruleDesc: '', categoryId: null, ruleLevel: null,
  executeFrequency: null, applyScope: 1, orgIds: [], params: {}, customSql: ''
})
const form = ref(defaultForm())
const isDirty = ref(false)

watch(form, () => { isDirty.value = true }, { deep: true })

const step1Rules = {
  ruleName: [{ required: true, message: '规则名称不能为空', trigger: 'blur' }, { max: 200, message: '规则名称不能超过200个字符', trigger: 'input' }],
  categoryId: [{ required: true, message: '规则分类不能为空', trigger: 'change' }],
  ruleLevel: [{ required: true, message: '规则级别不能为空', trigger: 'change' }],
  executeFrequency: [{ required: true, message: '执行频率不能为空', trigger: 'change' }],
}

// Map category to param component
const CATEGORY_COMP_MAP = {
  '空值检查': NullCheck,
  '值域检查': CodeCheck,
  '规范检查': IdCardCheck,
  '逻辑检查': ConditionalCheck,
  '关联性检查': ForeignKeyCheck,
  '完整性检查': CrossTableCheck,
  '一致性检查': CodeNameCheck,
  '及时性检查': TimelinessCheck,
  '稳定性检查': VolatilityCheck,
  '唯一性检查': UniqueCheck,
}

// Also allow by ID using a secondary map
const CAT_ID_COMP_MAP = {
  1: NullCheck,
  2: CodeCheck,
  3: IdCardCheck,
  4: ConditionalCheck,
  5: ForeignKeyCheck,
  6: CrossTableCheck,
  7: CodeNameCheck,
  8: TimelinessCheck,
  9: VolatilityCheck,
  10: UniqueCheck,
}

const currentParamComp = computed(() => {
  const cat = props.categories.find(c => c.id === form.value.categoryId)
  if (!cat) return null
  return CATEGORY_COMP_MAP[cat.categoryName] || CAT_ID_COMP_MAP[cat.id] || NullCheck
})

const highlightedSql = computed(() => {
  if (!previewSql.value) return ''
  try { return hljs.highlight(previewSql.value, { language: 'sql' }).value } catch { return previewSql.value }
})

const fetchDatasets = async () => {
  const { data } = await axios.get('/api/dataset', { params: { page: 1, size: 200 } })
  allDatasets.value = data.data?.records || []
}

const fetchOrgs = async () => {
  const { data } = await axios.get('/api/system/org', { params: { page: 1, size: 200 } })
  orgs.value = data.data?.records || []
}

const loadSqlPreview = async () => {
  if (previewSql.value) return
  const ruleId = props.editData?.id || 1
  try {
    const { data } = await axios.get(`/api/rule/${ruleId}/preview-sql`)
    previewSql.value = data.data?.sql || '-- SQL将在保存后生成'
  } catch {
    previewSql.value = '-- SQL预览加载失败'
  }
}

watch(() => step.value, (s) => { if (s === 2) loadSqlPreview() })

watch(visible, (v) => {
  if (v) {
    step.value = 0
    isDirty.value = false
    testResult.value = null
    previewSql.value = ''
    customSqlMode.value = false
    form.value = props.editData ? { ...defaultForm(), ...props.editData, orgIds: props.editData.orgIds || [] } : defaultForm()
    fetchDatasets()
    fetchOrgs()
  }
})

const onValidateResult = (valid) => { conditionalValid.value = valid }

const handleNext = async () => {
  stepLoading.value = true
  try {
    if (step.value === 0) {
      await step1Ref.value.validate()
    } else if (step.value === 1) {
      // For conditional check, validate SQL first
      const cat = props.categories.find(c => c.id === form.value.categoryId)
      if (cat?.categoryName === '逻辑检查' && !conditionalValid.value) {
        ElMessage.warning('请先完成表达式校验')
        return
      }
    }
    step.value++
  } catch {
    // validation error handled by form
  } finally {
    stepLoading.value = false
  }
}

const handleTest = async () => {
  testing.value = true
  testProgress.value = 0
  testResult.value = null
  const timer = setInterval(() => {
    testProgress.value = Math.min(testProgress.value + 10, 90)
  }, 600)
  try {
    const ruleId = props.editData?.id || 0
    const { data } = await axios.post(`/api/rule/${ruleId || 1}/test`)
    testProgress.value = 100
    testResult.value = data.data
  } finally {
    clearInterval(timer)
    testing.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    const payload = { ...form.value }
    if (isEdit.value) {
      await axios.put(`/api/rule/${props.editData.id}`, payload)
    } else {
      await axios.post('/api/rule', payload)
    }
    ElMessage.success(isEdit.value ? '规则更新成功' : '规则创建成功')
    isDirty.value = false
    visible.value = false
    emit('saved')
  } finally {
    saving.value = false
  }
}

const handleBeforeClose = async (done) => {
  if (!isDirty.value) { done(); return }
  try {
    await ElMessageBox.confirm('有未保存的修改，确定关闭吗？', '提示', { type: 'warning' })
    done()
  } catch { /* cancelled */ }
}

const handleCancel = async () => {
  if (!isDirty.value) { visible.value = false; return }
  try {
    await ElMessageBox.confirm('有未保存的修改，确定关闭吗？', '提示', { type: 'warning' })
    visible.value = false
  } catch { /* cancelled */ }
}
</script>

<style>
/* 规则表单弹窗：限高 + 内容区可滚动，使确认框能正常显示在弹窗上方 */
.rule-form-dialog .el-dialog__body {
  max-height: calc(85vh - 140px);
  overflow-y: auto;
  padding: 16px 24px;
}
.rule-form-dialog .el-dialog {
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}
.rule-form-dialog .el-dialog__header {
  flex-shrink: 0;
}
.rule-form-dialog .el-dialog__footer {
  flex-shrink: 0;
  border-top: 1px solid #f0f0f0;
  padding: 12px 24px;
}
</style>
