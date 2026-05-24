<template>
  <PageContainer title="质控规则管理">
    <!-- Search area -->
    <SearchForm :loading="loading" @search="fetchData" @reset="handleReset">
      <el-form-item label="规则名称">
        <el-input v-model="query.ruleName" placeholder="模糊搜索" clearable style="width:180px" />
      </el-form-item>
      <el-form-item label="规则分类">
        <el-select v-model="query.categoryId" placeholder="全部" clearable style="width:160px">
          <el-option v-for="cat in categories" :key="cat.id" :label="cat.categoryName" :value="cat.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="规则级别">
        <el-select v-model="query.ruleLevel" placeholder="全部" clearable style="width:120px">
          <el-option label="严重" :value="1" />
          <el-option label="警告" :value="2" />
          <el-option label="提示" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="执行频率">
        <el-select v-model="query.executeFrequency" placeholder="全部" clearable style="width:120px">
          <el-option label="每日" value="daily" />
          <el-option label="每周" value="weekly" />
          <el-option label="每月" value="monthly" />
          <el-option label="手动" value="manual" />
        </el-select>
      </el-form-item>
      <el-form-item label="启用状态">
        <el-select v-model="query.isEnabled" placeholder="全部" clearable style="width:120px">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
    </SearchForm>

    <!-- Action buttons -->
    <div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap">
      <el-button v-permission="'rule:add'" type="primary" :icon="Plus" @click="openAdd">新增规则</el-button>
      <el-button v-permission="'rule:batch-enable'" :disabled="!selectedIds.length" @click="handleBatchEnable(1)">批量启用</el-button>
      <el-button v-permission="'rule:batch-enable'" :disabled="!selectedIds.length" @click="handleBatchEnable(0)">批量禁用</el-button>
      <el-button v-permission="'rule:delete'" type="danger" plain :disabled="!selectedIds.length" @click="handleBatchDelete">批量删除</el-button>
      <el-button v-permission="'rule:import'" :icon="Upload" @click="importVisible = true">导入</el-button>
      <el-button v-permission="'rule:export'" :icon="Download" :loading="exporting" @click="handleExport">导出</el-button>
      <el-button v-if="selectedIds.length" type="success" :icon="CollectionTag" @click="saveTemplateVisible = true">保存为模板</el-button>
    </div>

    <!-- 保存为模板弹窗 -->
    <el-dialog v-model="saveTemplateVisible" title="保存为模板" width="440px" destroy-on-close>
      <el-form ref="saveTemplateFormRef" :model="saveTemplateForm" :rules="saveTemplateRules" label-width="80px">
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="saveTemplateForm.templateName" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板描述" prop="description">
          <el-input v-model="saveTemplateForm.description" type="textarea" :rows="3" placeholder="请输入模板描述" />
        </el-form-item>
        <el-form-item>
          <span style="color:#909399;font-size:13px">将保存已选 {{ selectedIds.length }} 条规则</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saveTemplateVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingTemplate" @click="handleSaveTemplate">保存</el-button>
      </template>
    </el-dialog>

    <!-- Table -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        row-key="id"
        @selection-change="selectedRows = $event"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column type="expand">
          <template #default="{ row }">
            <div style="padding:8px 32px;color:#606266;font-size:13px">{{ row.ruleDesc || '暂无描述' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="ruleName" label="规则名称" min-width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="expandRow(row)">{{ row.ruleName }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="规则分类" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.categoryName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="规则级别" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="levelType(row.ruleLevel)" size="small">{{ levelLabel(row.ruleLevel) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行频率" width="100" align="center">
          <template #default="{ row }">{{ freqLabel(row.executeFrequency) }}</template>
        </el-table-column>
        <el-table-column label="适用范围" width="110" align="center">
          <template #default="{ row }">{{ row.applyScope === 1 ? '全机构' : '指定机构' }}</template>
        </el-table-column>
        <el-table-column label="启用状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isEnabled"
              :active-value="1"
              :inactive-value="0"
              v-permission="'rule:edit'"
              @change="handleToggleEnable(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'rule:edit'" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-permission="'rule:add'" link type="primary" @click="handleCopy(row)">复制</el-button>
            <el-button v-permission="'rule:test'" link type="primary" @click="openTest(row)">测试</el-button>
            <el-button
              v-permission="'rule:delete'"
              link
              type="danger"
              v-confirm-delete="() => handleDelete(row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.size"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top:12px;justify-content:flex-end"
        @change="fetchData"
      />
    </el-card>

    <!-- Rule form dialog -->
    <RuleFormDialog
      v-model="formVisible"
      :edit-data="editingRule"
      :categories="categories"
      @saved="fetchData"
    />

    <!-- Import dialog -->
    <ImportDialog v-model="importVisible" @imported="fetchData" />
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Upload, Download, CollectionTag } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import RuleFormDialog from './components/RuleFormDialog.vue'
import ImportDialog from './components/ImportDialog.vue'

const loading = ref(false)
const exporting = ref(false)
const tableData = ref([])
const total = ref(0)
const categories = ref([])
const selectedRows = ref([])
const formVisible = ref(false)
const importVisible = ref(false)
const editingRule = ref(null)

const query = ref({ page: 1, size: 20, ruleName: '', categoryId: null, ruleLevel: null, executeFrequency: null, isEnabled: null })
const selectedIds = computed(() => selectedRows.value.map(r => r.id))

const tableRef = ref(null)

const saveTemplateVisible = ref(false)
const savingTemplate = ref(false)
const saveTemplateFormRef = ref(null)
const saveTemplateForm = ref({ templateName: '', description: '' })
const saveTemplateRules = {
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }]
}

async function handleSaveTemplate() {
  await saveTemplateFormRef.value?.validate()
  savingTemplate.value = true
  try {
    await axios.post('/api/template', {
      ...saveTemplateForm.value,
      ruleIds: selectedIds.value
    })
    ElMessage.success('模板保存成功')
    saveTemplateVisible.value = false
    saveTemplateForm.value = { templateName: '', description: '' }
  } catch {
    ElMessage.error('保存失败')
  } finally {
    savingTemplate.value = false
  }
}

const levelType = (l) => l === 1 ? 'danger' : l === 2 ? 'warning' : 'primary'
const levelLabel = (l) => l === 1 ? '严重' : l === 2 ? '警告' : '提示'
const freqLabel = (f) => ({ daily: '每日', weekly: '每周', monthly: '每月', manual: '手动' })[f] || f

const fetchCategories = async () => {
  const { data } = await axios.get('/api/rule/category')
  categories.value = data.data || []
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = { ...query.value }
    Object.keys(params).forEach(k => { if (params[k] === null || params[k] === '') delete params[k] })
    const { data } = await axios.get('/api/rule', { params })
    tableData.value = data.data?.records || []
    total.value = data.data?.total || 0
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  query.value = { page: 1, size: 20, ruleName: '', categoryId: null, ruleLevel: null, executeFrequency: null, isEnabled: null }
  fetchData()
}

const openAdd = () => { editingRule.value = null; formVisible.value = true }
const openEdit = (row) => { editingRule.value = { ...row }; formVisible.value = true }

const openTest = (row) => {
  editingRule.value = { ...row }
  formVisible.value = true
  // Jump to step 3 handled by dialog after open — we pass testMode flag via editData
  editingRule.value._testMode = true
}

const handleCopy = async (row) => {
  const { data } = await axios.post('/api/rule', { ...row, ruleName: `${row.ruleName}（副本）`, id: undefined })
  ElMessage.success('复制成功')
  fetchData()
}

const handleDelete = async (id) => {
  await axios.delete(`/api/rule/${id}`)
  ElMessage.success('删除成功')
  fetchData()
}

const handleToggleEnable = async (row) => {
  await axios.put(`/api/rule/${row.id}`, { isEnabled: row.isEnabled })
  ElMessage.success(row.isEnabled ? '已启用' : '已禁用')
}

const handleBatchEnable = async (enable) => {
  await axios.put('/api/rule/batch-enable', { ruleIds: selectedIds.value, isEnabled: enable })
  ElMessage.success(`批量${enable ? '启用' : '禁用'}成功`)
  fetchData()
}

const handleBatchDelete = async () => {
  await ElMessageBox.confirm(`确定批量删除选中的 ${selectedIds.value.length} 条规则吗？`, '警告', { type: 'warning' })
  await axios.delete('/api/rule/batch', { data: { ruleIds: selectedIds.value } })
  ElMessage.success('批量删除成功')
  fetchData()
}

const handleExport = async () => {
  exporting.value = true
  try {
    const res = await axios.get('/api/rule/export', { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url; a.download = '规则导出.xlsx'; a.click()
    URL.revokeObjectURL(url)
  } finally {
    exporting.value = false
  }
}

const expandRow = (row) => {
  // trigger expand toggle
  const table = document.querySelector('.el-table')
  if (!table) return
  const rows = table.querySelectorAll('.el-table__row')
  const idx = tableData.value.indexOf(row)
  if (rows[idx]) {
    const btn = rows[idx].querySelector('.el-table__expand-icon')
    if (btn) btn.click()
  }
}

onMounted(() => { fetchCategories(); fetchData() })
</script>
