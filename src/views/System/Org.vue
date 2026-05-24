<template>
  <PageContainer title="机构管理">
    <template #actions>
      <el-button
        v-permission="'system:org'"
        type="primary"
        :icon="Plus"
        @click="handleAdd"
      >
        新增机构
      </el-button>
    </template>

    <!-- 搜索表单 -->
    <SearchForm :loading="tableLoading" @search="handleSearch" @reset="handleReset">
      <el-form-item label="机构名称">
        <el-input
          v-model="query.orgName"
          placeholder="请输入机构名称"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="所属区县">
        <el-select
          v-model="query.districtCode"
          placeholder="全部区县"
          clearable
          style="width: 160px"
        >
          <el-option
            v-for="d in districtOptions"
            :key="d.code"
            :label="d.name"
            :value="d.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="query.status"
          placeholder="全部状态"
          clearable
          style="width: 120px"
        >
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
    </SearchForm>

    <!-- 数据表格 -->
    <DataTable
      :data="tableData"
      :loading="tableLoading"
      :total="total"
      v-model:page="query.page"
      v-model:page-size="query.size"
      :columns="columns"
      @page-change="loadData"
      @size-change="loadData"
    >
      <!-- 状态列 -->
      <template #status="{ row }">
        <StatusTag :type="row.status === 1 ? 'enabled' : 'disabled'" />
      </template>
      <!-- 操作列 -->
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'system:org'"
            link
            type="primary"
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-divider direction="vertical" />
          <el-button
            v-permission="'system:org'"
            link
            :type="row.status === 1 ? 'warning' : 'success'"
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 新增/编辑弹窗 -->
    <OrgFormDialog ref="formDialogRef" @success="loadData" />
  </PageContainer>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getOrgList, updateOrg } from '@/api/system.js'
import OrgFormDialog from './components/OrgFormDialog.vue'

const districtOptions = [
  { code: '511700', name: '达州市' },
  { code: '511703', name: '通川区' },
  { code: '511721', name: '达川区' },
  { code: '511722', name: '宣汉县' },
  { code: '511723', name: '开江县' },
  { code: '511724', name: '大竹县' },
  { code: '511725', name: '渠县' },
  { code: '511781', name: '万源市' },
]

const columns = [
  { field: 'orgName', label: '机构名称', minWidth: 160 },
  { field: 'orgCode', label: '机构代码', width: 130 },
  { field: 'districtName', label: '所属区县', width: 100 },
  { field: 'orgType', label: '机构类型', width: 150 },
  { field: 'contactPerson', label: '联系人', width: 100 },
  { field: 'contactPhone', label: '联系电话', width: 130 },
  { field: 'status', label: '状态', width: 80, slot: 'status' },
]

const query = reactive({
  orgName: '',
  districtCode: '',
  status: null,
  page: 1,
  size: 20,
})

const tableData = ref([])
const total = ref(0)
const tableLoading = ref(false)
const formDialogRef = ref(null)

async function loadData() {
  tableLoading.value = true
  try {
    const params = {
      page: query.page,
      size: query.size,
    }
    if (query.orgName) params.orgName = query.orgName
    if (query.districtCode) params.districtCode = query.districtCode
    if (query.status !== null && query.status !== '') params.status = query.status

    const res = await getOrgList(params)
    tableData.value = res.records || res.list || []
    total.value = res.total || 0
  } catch (e) {
    // error handled by interceptor
  } finally {
    tableLoading.value = false
  }
}

function handleSearch() {
  query.page = 1
  loadData()
}

function handleReset() {
  query.orgName = ''
  query.districtCode = ''
  query.status = null
  query.page = 1
  loadData()
}

function handleAdd() {
  formDialogRef.value?.open()
}

function handleEdit(row) {
  formDialogRef.value?.open(row)
}

async function handleToggleStatus(row) {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}机构「${row.orgName}」吗？`,
      `确认${action}`,
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
    )
    await updateOrg(row.id, { ...row, status: row.status === 1 ? 0 : 1 })
    ElMessage.success(`${action}成功`)
    loadData()
  } catch {
    // cancelled
  }
}

onMounted(() => loadData())
</script>
