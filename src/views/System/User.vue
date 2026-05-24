<template>
  <PageContainer title="用户管理">
    <template #actions>
      <el-button
        v-permission="'system:user'"
        type="primary"
        :icon="Plus"
        @click="handleAdd"
      >
        新增用户
      </el-button>
    </template>

    <!-- 搜索表单 -->
    <SearchForm :loading="tableLoading" @search="handleSearch" @reset="handleReset">
      <el-form-item label="用户名">
        <el-input
          v-model="query.username"
          placeholder="请输入用户名"
          clearable
          style="width: 160px"
        />
      </el-form-item>
      <el-form-item label="真实姓名">
        <el-input
          v-model="query.realName"
          placeholder="请输入真实姓名"
          clearable
          style="width: 160px"
        />
      </el-form-item>
      <el-form-item label="所属机构">
        <el-select
          v-model="query.orgId"
          placeholder="全部机构"
          clearable
          filterable
          style="width: 180px"
        >
          <el-option
            v-for="org in orgOptions"
            :key="org.id"
            :label="org.orgName"
            :value="org.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="角色">
        <el-select
          v-model="query.roleId"
          placeholder="全部角色"
          clearable
          style="width: 150px"
        >
          <el-option
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.roleName"
            :value="role.id"
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
      <!-- 创建时间列 -->
      <template #createdAt="{ row }">
        {{ row.createdAt || '—' }}
      </template>
      <!-- 操作列 -->
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'system:user'"
            link
            type="primary"
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-divider direction="vertical" />
          <el-button
            v-permission="'system:user'"
            link
            type="warning"
            @click="handleResetPassword(row)"
          >
            重置密码
          </el-button>
          <el-divider direction="vertical" />
          <el-button
            v-permission="'system:user'"
            link
            :type="row.status === 1 ? 'info' : 'success'"
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 新增/编辑弹窗 -->
    <UserFormDialog ref="formDialogRef" @success="loadData" />
    <!-- 重置密码弹窗 -->
    <ResetPasswordDialog ref="resetPwdDialogRef" @success="handlePwdResetSuccess" />
  </PageContainer>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getUserList, updateUser, getOrgList, getRoleList } from '@/api/system.js'
import UserFormDialog from './components/UserFormDialog.vue'
import ResetPasswordDialog from './components/ResetPasswordDialog.vue'

const columns = [
  { field: 'username', label: '用户名', width: 130 },
  { field: 'realName', label: '真实姓名', width: 100 },
  { field: 'orgName', label: '所属机构', minWidth: 150 },
  { field: 'roleName', label: '角色', width: 120 },
  { field: 'phone', label: '联系电话', width: 130 },
  { field: 'status', label: '状态', width: 80, slot: 'status' },
  { field: 'createdAt', label: '创建时间', width: 160, slot: 'createdAt' },
]

const query = reactive({
  username: '',
  realName: '',
  orgId: null,
  roleId: null,
  status: null,
  page: 1,
  size: 20,
})

const tableData = ref([])
const total = ref(0)
const tableLoading = ref(false)
const orgOptions = ref([])
const roleOptions = ref([])
const formDialogRef = ref(null)
const resetPwdDialogRef = ref(null)

async function loadData() {
  tableLoading.value = true
  try {
    const params = { page: query.page, size: query.size }
    if (query.username) params.username = query.username
    if (query.realName) params.realName = query.realName
    if (query.orgId !== null && query.orgId !== '') params.orgId = query.orgId
    if (query.roleId !== null && query.roleId !== '') params.roleId = query.roleId
    if (query.status !== null && query.status !== '') params.status = query.status

    const res = await getUserList(params)
    tableData.value = res.records || res.list || []
    total.value = res.total || 0
  } catch {
    // handled
  } finally {
    tableLoading.value = false
  }
}

async function loadFilterOptions() {
  try {
    const [orgRes, roleRes] = await Promise.all([
      getOrgList({ page: 1, size: 200 }),
      getRoleList(),
    ])
    orgOptions.value = orgRes.records || orgRes.list || []
    roleOptions.value = Array.isArray(roleRes) ? roleRes : (roleRes.records || roleRes.list || [])
  } catch {
    // ignore
  }
}

function handleSearch() {
  query.page = 1
  loadData()
}

function handleReset() {
  query.username = ''
  query.realName = ''
  query.orgId = null
  query.roleId = null
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

function handleResetPassword(row) {
  resetPwdDialogRef.value?.open(row)
}

function handlePwdResetSuccess() {
  // no table reload needed for password reset
}

async function handleToggleStatus(row) {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户「${row.realName}（${row.username}）」吗？`,
      `确认${action}`,
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
    )
    await updateUser(row.id, { ...row, status: row.status === 1 ? 0 : 1 })
    ElMessage.success(`${action}成功`)
    loadData()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  loadData()
  loadFilterOptions()
})
</script>
