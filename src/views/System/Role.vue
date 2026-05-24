<template>
  <PageContainer title="角色管理">
    <template #actions>
      <el-button
        v-permission="'system:role'"
        type="primary"
        :icon="Plus"
        @click="handleAdd"
      >
        新增角色
      </el-button>
    </template>

    <!-- 角色列表 -->
    <el-card shadow="never" :body-style="{ padding: '0' }">
      <el-table
        v-loading="tableLoading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="roleName" label="角色名称" min-width="140" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="数据权限范围" width="140">
          <template #default="{ row }">
            <el-tag :type="dataScopeTag(row.dataScope).type" size="small">
              {{ dataScopeTag(row.dataScope).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="权限数量" width="90" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ (row.permissions || []).length }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permission="'system:role'"
              link
              type="primary"
              @click="handleEditRole(row)"
            >
              编辑
            </el-button>
            <el-divider direction="vertical" />
            <el-button
              v-permission="'system:role'"
              link
              type="success"
              @click="handleEditPermission(row)"
            >
              编辑权限
            </el-button>
            <el-divider direction="vertical" />
            <el-button
              v-permission="'system:role'"
              link
              type="danger"
              :disabled="isSystemRole(row)"
              v-confirm-delete="() => handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑角色弹窗 -->
    <RoleFormDialog
      ref="roleFormDialogRef"
      @success="loadData"
      @configure-permissions="handleConfigurePermissions"
    />

    <!-- 权限配置弹窗 -->
    <PermissionDialog ref="permDialogRef" @success="loadData" />
  </PageContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getRoleList, deleteRole } from '@/api/system.js'
import RoleFormDialog from './components/RoleFormDialog.vue'
import PermissionDialog from './components/PermissionDialog.vue'

// 系统预置角色不允许删除
const SYSTEM_ROLE_IDS = [1, 2, 3, 4]

const dataScopeMap = {
  1: { label: '全部数据', type: '' },
  2: { label: '本区县数据', type: 'warning' },
  3: { label: '本机构数据', type: 'info' },
}

function dataScopeTag(scope) {
  return dataScopeMap[scope] || { label: '未知', type: 'danger' }
}

function isSystemRole(row) {
  return SYSTEM_ROLE_IDS.includes(row.id)
}

const tableData = ref([])
const tableLoading = ref(false)
const roleFormDialogRef = ref(null)
const permDialogRef = ref(null)

async function loadData() {
  tableLoading.value = true
  try {
    const res = await getRoleList()
    tableData.value = Array.isArray(res) ? res : (res.records || res.list || [])
  } catch {
    // handled
  } finally {
    tableLoading.value = false
  }
}

function handleAdd() {
  roleFormDialogRef.value?.open()
}

function handleEditRole(row) {
  roleFormDialogRef.value?.open(row)
}

function handleEditPermission(row) {
  permDialogRef.value?.open(row)
}

function handleConfigurePermissions(role) {
  // 新增角色后，提示并弹出权限配置
  if (role) {
    permDialogRef.value?.open(role)
  }
}

async function handleDelete(row) {
  if (isSystemRole(row)) {
    ElMessage.warning('系统预置角色不允许删除')
    return
  }
  try {
    await deleteRole(row.id)
    ElMessage.success('角色删除成功')
    loadData()
  } catch {
    // handled
  }
}

onMounted(() => loadData())
</script>
