<template>
  <PageContainer title="数据集配置">
    <template #actions>
      <el-button
        v-permission="'dataset:edit'"
        type="primary"
        @click="handleAdd"
      >
        <el-icon><Plus /></el-icon>新增数据集
      </el-button>
    </template>

    <SearchForm :loading="tableLoading" @search="handleSearch" @reset="handleReset">
      <el-form-item label="数据集编码">
        <el-input v-model="queryParams.datasetCode" placeholder="请输入数据集编码" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="数据集名称">
        <el-input v-model="queryParams.datasetName" placeholder="请输入数据集名称" clearable style="width: 180px" />
      </el-form-item>
    </SearchForm>

    <DataTable
      :data="tableData"
      :columns="columns"
      :loading="tableLoading"
      :is-init="isInit"
      :total="total"
      :page-size="queryParams.size"
      empty-text="暂无数据集，请先配置业务中心库并同步"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @retry="fetchData"
    >
      <el-table-column label="是否必选" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isRequired ? 'danger' : 'info'" size="small">
            {{ row.isRequired ? '必选' : '可选' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="记录数" width="120" align="right">
        <template #default="{ row }">
          {{ row.recordCount?.toLocaleString() ?? '-' }}
        </template>
      </el-table-column>

      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="val => handleStatusChange(row, val)"
          />
        </template>
      </el-table-column>

      <el-table-column label="操作" width="240" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
            v-permission="'dataset:view'"
            size="small"
            type="info"
            link
            @click="handleManageElements(row)"
          >
            数据元
          </el-button>
          <el-button
            v-permission="'dataset:edit'"
            size="small"
            type="primary"
            link
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'dataset:sync'"
            size="small"
            type="success"
            link
            @click="handleSyncFields(row)"
          >
            同步字段
          </el-button>
          <el-button
            v-permission="'dataset:edit'"
            size="small"
            type="danger"
            link
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </DataTable>

    <!-- Add/Edit Dialog -->
    <DatasetFormDialog
      v-model="editDialogVisible"
      :dataset="currentDataset"
      @saved="fetchData"
    />

    <!-- Sync Preview Dialog -->
    <SyncPreviewDialog
      v-model="syncDialogVisible"
      :dataset="currentDataset"
    />

    <!-- Element Management Dialog -->
    <ElementManageDialog
      v-model="elementDialogVisible"
      :dataset="currentDataset"
    />
  </PageContainer>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import axios from 'axios'
import { showDeleteConfirm } from '@/utils/dialog'
import DatasetFormDialog from './components/DatasetFormDialog.vue'
import SyncPreviewDialog from './components/SyncPreviewDialog.vue'
import ElementManageDialog from './components/ElementManageDialog.vue'

const tableData = ref([])
const tableLoading = ref(false)
const isInit = ref(true)
const total = ref(0)
const editDialogVisible = ref(false)
const syncDialogVisible = ref(false)
const elementDialogVisible = ref(false)
const currentDataset = ref(null)

const queryParams = reactive({
  datasetCode: '',
  datasetName: '',
  page: 1,
  size: 20
})

const columns = [
  { prop: 'datasetCode', label: '数据集编码', width: 150 },
  { prop: 'datasetName', label: '数据集名称', minWidth: 160 },
  { prop: 'orgCodeField', label: '机构代码字段', width: 140 },
  { prop: 'businessKeyField', label: '业务主键字段', width: 160 }
]

async function fetchData() {
  tableLoading.value = true
  try {
    const res = await axios.get('/api/dataset', { params: queryParams })
    const data = res.data?.data
    tableData.value = data?.records || []
    total.value = data?.total || 0
  } catch {
    ElMessage.error('获取数据集列表失败')
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
  queryParams.datasetCode = ''
  queryParams.datasetName = ''
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
  currentDataset.value = null
  editDialogVisible.value = true
}

function handleEdit(row) {
  currentDataset.value = row
  editDialogVisible.value = true
}

function handleManageElements(row) {
  currentDataset.value = row
  elementDialogVisible.value = true
}

function handleSyncFields(row) {
  currentDataset.value = row
  syncDialogVisible.value = true
}

async function handleStatusChange(row, val) {
  try {
    await axios.put(`/api/dataset/${row.id}`, { status: val })
    ElMessage.success(val ? '已启用' : '已禁用')
  } catch {
    row.status = val ? 0 : 1
    ElMessage.error('状态修改失败')
  }
}

async function handleDelete(row) {
  try {
    await showDeleteConfirm(
      `确定要删除数据集「${row.datasetName}」？删除后该数据集下的所有数据元也将被移除，且已引用该数据集的质控规则可能失效。`
    )
  } catch {
    return
  }
  try {
    await axios.delete(`/api/dataset/${row.id}`)
    ElMessage.success('数据集已删除')
    fetchData()
  } catch {
    ElMessage.error('删除失败')
  }
}

onMounted(fetchData)
</script>
