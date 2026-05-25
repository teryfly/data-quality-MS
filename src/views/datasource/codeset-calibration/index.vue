<template>
  <PageContainer title="代码集校准" v-permission="'codeset:calibrate'">
    <SearchForm :loading="tableLoading" @search="handleSearch" @reset="handleReset">
      <el-form-item label="代码集名称">
        <el-input v-model="queryParams.name" placeholder="模糊搜索名称" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="来源">
        <el-select v-model="queryParams.source" placeholder="全部来源" clearable style="width: 140px">
          <el-option label="国家标准" value="national" />
          <el-option label="省级标准" value="province" />
          <el-option label="自定义" value="custom" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 140px">
          <el-option label="正常" value="normal" />
          <el-option label="误识别" value="excluded" />
        </el-select>
      </el-form-item>
      <template #actions>
        <el-button
          v-permission="'codeset:calibrate'"
          type="primary"
          :icon="Plus"
          @click="handleAdd"
        >
          添加代码集
        </el-button>
      </template>
    </SearchForm>

    <DataTable
      :data="tableData"
      :columns="columns"
      :loading="tableLoading"
      :is-init="isInit"
      :total="total"
      :page-size="queryParams.size"
      empty-text="暂无代码集数据"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @retry="fetchData"
    >
      <el-table-column label="代码项数量" width="110" align="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleViewItems(row)">
            {{ row.codeItemCount }}
          </el-button>
        </template>
      </el-table-column>

      <el-table-column label="来源" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="sourceTagType(row.source)" size="small">
            {{ sourceLabel(row.source) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="识别方式" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.recognitionMethod === 'auto' ? 'info' : 'warning'" size="small">
            {{ row.recognitionMethod === 'auto' ? '自动识别' : '手动添加' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleEdit(row)">
            编辑映射
          </el-button>
          <el-button
            size="small"
            type="warning"
            link
            :disabled="row.status === 'excluded'"
            @click="handleMarkExcluded(row)"
          >
            标记误识别
          </el-button>
          <el-button
            v-confirm-delete="() => handleDelete(row)"
            size="small"
            type="danger"
            link
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 编辑映射弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="currentCodeset ? `编辑映射 — ${currentCodeset.codesetName}` : '手动添加代码集'"
      width="560px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="handleEditBeforeClose"
      draggable
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="110px"
      >
        <el-form-item label="代码集名称" prop="codesetName">
          <el-input v-model="editForm.codesetName" placeholder="请输入代码集名称" />
        </el-form-item>
        <el-form-item label="对应表名" prop="tableName">
          <el-input v-model="editForm.tableName" placeholder="数据库实际表名" />
        </el-form-item>
        <el-form-item label="代码字段" prop="codeField">
          <el-input v-model="editForm.codeField" placeholder="代码值所在字段名" />
        </el-form-item>
        <el-form-item label="名称字段" prop="nameField">
          <el-input v-model="editForm.nameField" placeholder="代码名称所在字段名" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleEditCancel">取消</el-button>
          <el-button type="primary" :loading="editSaveLoading" @click="handleEditSave">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 代码项弹窗 -->
    <el-dialog
      v-model="itemsDialogVisible"
      :title="`代码项列表 — ${currentCodeset?.codesetName || ''}`"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-table :data="currentCodeset?.items || []" border stripe size="small" max-height="400">
        <el-table-column prop="code" label="代码值" width="120" />
        <el-table-column prop="name" label="代码名称" min-width="120" />
        <el-table-column prop="description" label="说明" min-width="140" />
      </el-table>
      <template #footer>
        <el-button @click="itemsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import axios from 'axios'

const tableData = ref([])
const tableLoading = ref(false)
const isInit = ref(true)
const total = ref(0)
const editDialogVisible = ref(false)
const itemsDialogVisible = ref(false)
const currentCodeset = ref(null)
const editFormRef = ref(null)
const editSaveLoading = ref(false)
const editDirty = ref(false)

const queryParams = reactive({
  name: '',
  source: '',
  status: '',
  page: 1,
  size: 20
})

const editForm = reactive({
  codesetName: '',
  tableName: '',
  codeField: '',
  nameField: ''
})

const editRules = {
  codesetName: [{ required: true, message: '请输入代码集名称', trigger: 'blur' }],
  tableName: [{ required: true, message: '请输入对应表名', trigger: 'blur' }],
  codeField: [{ required: true, message: '请输入代码字段', trigger: 'blur' }],
  nameField: [{ required: true, message: '请输入名称字段', trigger: 'blur' }]
}

const columns = [
  { prop: 'codesetCode', label: '代码集编码', width: 130 },
  { prop: 'codesetName', label: '代码集名称', minWidth: 140 },
  { prop: 'tableName', label: '对应表名', width: 160 },
  { prop: 'codeField', label: '代码字段', width: 120 },
  { prop: 'nameField', label: '名称字段', width: 120 }
]

async function fetchData() {
  tableLoading.value = true
  try {
    const params = { page: queryParams.page, size: queryParams.size }
    if (queryParams.source) params.source = queryParams.source
    if (queryParams.status) params.status = queryParams.status
    if (queryParams.name) params.name = queryParams.name
    const res = await axios.get('/api/codeset', { params })
    const data = res.data?.data
    tableData.value = data?.records || []
    total.value = data?.total || 0
  } catch {
    ElMessage.error('获取代码集列表失败')
  } finally {
    tableLoading.value = false
    isInit.value = false
  }
}

function handleSearch() {
  queryParams.page = 1
  fetchData()
}

function handleReset() {
  queryParams.name = ''
  queryParams.source = ''
  queryParams.status = ''
  queryParams.page = 1
  fetchData()
}

function handlePageChange(page) {
  queryParams.page = page
  fetchData()
}

function handleSizeChange(size) {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

function handleAdd() {
  currentCodeset.value = null
  Object.assign(editForm, { codesetName: '', tableName: '', codeField: '', nameField: '' })
  editDirty.value = false
  editDialogVisible.value = true
}

function handleEdit(row) {
  currentCodeset.value = row
  Object.assign(editForm, {
    codesetName: row.codesetName,
    tableName: row.tableName,
    codeField: row.codeField,
    nameField: row.nameField
  })
  editDirty.value = false
  editDialogVisible.value = true
}

function handleViewItems(row) {
  currentCodeset.value = row
  itemsDialogVisible.value = true
}

async function handleMarkExcluded(row) {
  try {
    await ElMessageBox.confirm(
      `确认将"${row.codesetName}"标记为误识别？后续自动同步将不再创建此代码集。`,
      '标记误识别',
      { confirmButtonText: '确认标记', cancelButtonText: '取消', type: 'warning' }
    )
    await axios.put(`/api/codeset/${row.id}/calibrate`, { status: 'excluded' })
    ElMessage.success('已标记为误识别')
    fetchData()
  } catch {}
}

async function handleDelete(row) {
  try {
    await axios.put(`/api/codeset/${row.id}/calibrate`, { deleted: true })
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    ElMessage.error('删除失败')
  }
}

async function handleEditSave() {
  try {
    await editFormRef.value.validate()
  } catch {
    return
  }
  editSaveLoading.value = true
  try {
    if (currentCodeset.value) {
      await axios.put(`/api/codeset/${currentCodeset.value.id}/calibrate`, { ...editForm })
    } else {
      await axios.put('/api/codeset/0/calibrate', { ...editForm, isNew: true })
    }
    ElMessage.success('保存成功')
    editDirty.value = false
    editDialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.error('保存失败')
  } finally {
    editSaveLoading.value = false
  }
}

function handleEditCancel() {
  if (editDirty.value) {
    ElMessageBox.confirm('有未保存的更改，确定要关闭吗？', '提示', {
      confirmButtonText: '确定关闭', cancelButtonText: '继续编辑', type: 'warning'
    }).then(() => { editDialogVisible.value = false }).catch(() => {})
  } else {
    editDialogVisible.value = false
  }
}

function handleEditBeforeClose(done) {
  if (editDirty.value) {
    ElMessageBox.confirm('有未保存的更改，确定要关闭吗？', '提示', {
      confirmButtonText: '确定关闭', cancelButtonText: '继续编辑', type: 'warning'
    }).then(() => done()).catch(() => {})
  } else {
    done()
  }
}

function sourceLabel(source) {
  const map = { national: '国家标准', province: '省级标准', custom: '自定义' }
  return map[source] || source
}

function sourceTagType(source) {
  const map = { national: 'primary', province: 'success', custom: 'warning' }
  return map[source] || 'info'
}

onMounted(fetchData)
</script>

<style scoped>
.table-toolbar {
  margin-bottom: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
