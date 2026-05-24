<template>
  <el-dialog
    v-model="visible"
    :title="`角色权限配置 — ${role?.roleName || ''}`"
    width="640px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleBeforeClose"
    draggable
  >
    <div v-loading="treeLoading" class="permission-container">
      <!-- 全选/反选操作栏 -->
      <div class="perm-toolbar">
        <el-checkbox
          v-model="isAllChecked"
          :indeterminate="isIndeterminate"
          @change="handleCheckAll"
        >
          全选
        </el-checkbox>
        <el-button link type="primary" size="small" style="margin-left: 16px" @click="handleInverse">
          反选
        </el-button>
        <span class="perm-count">
          已选 {{ checkedCount }} / {{ totalCount }} 项
        </span>
      </div>

      <!-- 权限树 -->
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-checked-keys="defaultChecked"
        :default-expand-all="true"
        check-strictly
        class="perm-tree"
        @check="handleTreeCheck"
      >
        <template #default="{ node, data }">
          <span class="tree-node-label">
            <el-icon v-if="!data.children" size="12" style="margin-right: 4px; color: #909399">
              <Key />
            </el-icon>
            {{ node.label }}
            <span v-if="data.id && data.id.includes(':')" class="perm-id">{{ data.id }}</span>
          </span>
        </template>
      </el-tree>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">
        {{ saving ? '保存中...' : '保存权限' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Key } from '@element-plus/icons-vue'
import { getPermissionTree, updateRole } from '@/api/system.js'

const emit = defineEmits(['success'])

const visible = ref(false)
const saving = ref(false)
const treeLoading = ref(false)
const treeRef = ref(null)
const role = ref(null)
const treeData = ref([])
const defaultChecked = ref([])

const treeProps = {
  label: 'label',
  children: 'children',
}

// 所有叶子权限 id 列表
const allLeafIds = computed(() => {
  const ids = []
  function collect(nodes) {
    for (const node of nodes) {
      if (node.children?.length) {
        collect(node.children)
      } else {
        ids.push(node.id)
      }
    }
  }
  collect(treeData.value)
  return ids
})

// 当前选中的叶子权限 id 列表（不含父节点）
function getCheckedLeafIds() {
  if (!treeRef.value) return []
  const checked = treeRef.value.getCheckedKeys(false)
  return checked.filter(id => allLeafIds.value.includes(id))
}

const checkedCount = computed(() => {
  // 响应式：依赖 visible & treeData（tree ref 本身不是响应式）
  if (!visible.value || !treeRef.value) return 0
  return getCheckedLeafIds().length
})

const totalCount = computed(() => allLeafIds.value.length)

const isAllChecked = computed({
  get: () => totalCount.value > 0 && checkedCount.value === totalCount.value,
  set: () => {},
})

const isIndeterminate = computed(() => {
  const c = checkedCount.value
  return c > 0 && c < totalCount.value
})

// 全选/全不选
function handleCheckAll(checked) {
  if (checked) {
    treeRef.value?.setCheckedKeys(allLeafIds.value)
    // 同时选中所有父节点
    treeData.value.forEach(node => {
      if (node.children?.length) {
        treeRef.value?.setChecked(node.id, true)
      }
    })
  } else {
    treeRef.value?.setCheckedKeys([])
  }
}

// 反选
function handleInverse() {
  const current = new Set(treeRef.value?.getCheckedKeys(false) || [])
  const newKeys = allLeafIds.value.filter(id => !current.has(id))
  treeRef.value?.setCheckedKeys([])
  newKeys.forEach(id => treeRef.value?.setChecked(id, true))
  // 同步父节点
  syncParentChecks()
}

// 处理子节点选中时同步父节点
function handleTreeCheck(data, state) {
  // 当叶子节点变化时，自动联动父节点
  if (!data.children?.length) {
    // 找到父节点，检查是否所有子节点都选中
    treeData.value.forEach(parent => {
      if (parent.children?.some(c => c.id === data.id)) {
        const allChecked = parent.children.every(c =>
          state.checkedKeys.includes(c.id)
        )
        const anyChecked = parent.children.some(c =>
          state.checkedKeys.includes(c.id)
        )
        if (allChecked) {
          treeRef.value?.setChecked(parent.id, true)
        } else if (!anyChecked) {
          treeRef.value?.setChecked(parent.id, false)
        } else {
          treeRef.value?.setChecked(parent.id, false)
        }
      }
    })
  } else {
    // 父节点被点击：联动所有子节点
    const parentChecked = state.checkedKeys.includes(data.id)
    data.children.forEach(child => {
      treeRef.value?.setChecked(child.id, parentChecked)
    })
  }
}

function syncParentChecks() {
  const checkedLeafs = new Set(treeRef.value?.getCheckedKeys(false).filter(id => allLeafIds.value.includes(id)) || [])
  treeData.value.forEach(parent => {
    if (parent.children?.length) {
      const allChildChecked = parent.children.every(c => checkedLeafs.has(c.id))
      treeRef.value?.setChecked(parent.id, allChildChecked)
    }
  })
}

async function loadPermissionTree() {
  treeLoading.value = true
  try {
    const res = await getPermissionTree()
    treeData.value = Array.isArray(res) ? res : []
  } catch {
    // ignore
  } finally {
    treeLoading.value = false
  }
}

function open(roleRow) {
  role.value = roleRow
  visible.value = true
  loadPermissionTree().then(() => {
    nextTick(() => {
      const perms = roleRow.permissions || []
      // 只设置叶子节点（真实权限标识）为 checked
      const leafPerms = perms.filter(p => p.includes(':'))
      treeRef.value?.setCheckedKeys([])
      leafPerms.forEach(id => {
        treeRef.value?.setChecked(id, true)
      })
      // 同步父节点
      nextTick(() => syncParentChecks())
    })
  })
}

async function handleSubmit() {
  const selectedPerms = getCheckedLeafIds()
  saving.value = true
  try {
    await updateRole(role.value.id, {
      ...role.value,
      permissions: selectedPerms,
    })
    ElMessage.success('权限保存成功')
    visible.value = false
    emit('success')
  } catch {
    // handled
  } finally {
    saving.value = false
  }
}

function handleBeforeClose(done) {
  done()
}

function handleCancel() {
  visible.value = false
}

defineExpose({ open })
</script>

<style scoped>
.permission-container {
  min-height: 200px;
}

.perm-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 12px;
}

.perm-count {
  margin-left: auto;
  font-size: 13px;
  color: #909399;
}

.perm-tree {
  max-height: 420px;
  overflow-y: auto;
}

.tree-node-label {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.perm-id {
  margin-left: 8px;
  font-size: 11px;
  color: #c0c4cc;
  font-family: monospace;
}
</style>
