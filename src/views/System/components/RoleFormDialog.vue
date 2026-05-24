<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑角色' : '新增角色'"
    width="440px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleBeforeClose"
    draggable
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      v-loading="saving"
    >
      <!-- 角色名称 -->
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="form.roleName"
          maxlength="50"
          show-word-limit
          placeholder="请输入角色名称"
        />
      </el-form-item>

      <!-- 角色描述 -->
      <el-form-item label="角色描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          placeholder="请输入角色描述（选填）"
        />
      </el-form-item>

      <!-- 数据权限范围 -->
      <el-form-item label="数据权限" prop="dataScope">
        <el-radio-group v-model="form.dataScope">
          <el-radio :label="1">全部数据</el-radio>
          <el-radio :label="2">本区县数据</el-radio>
          <el-radio :label="3">本机构数据</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">
        {{ saving ? '保存中...' : '确定' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { createRole, updateRole } from '@/api/system.js'

const emit = defineEmits(['success', 'configure-permissions'])

const visible = ref(false)
const saving = ref(false)
const formRef = ref(null)
const editRow = ref(null)

const isEdit = computed(() => !!editRow.value)

const defaultForm = () => ({
  roleName: '',
  description: '',
  dataScope: 3,
})

const form = reactive(defaultForm())

const rules = {
  roleName: [
    { required: true, message: '角色名称不能为空', trigger: 'blur' },
    { max: 50, message: '角色名称不能超过50个字符', trigger: 'input' },
  ],
  dataScope: [
    { required: true, message: '请选择数据权限范围', trigger: 'change' },
  ],
}

function open(row = null) {
  editRow.value = row
  Object.assign(form, defaultForm())
  if (row) {
    Object.assign(form, {
      roleName: row.roleName || '',
      description: row.description || '',
      dataScope: row.dataScope || 3,
    })
  }
  visible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    let savedRole
    if (isEdit.value) {
      savedRole = await updateRole(editRow.value.id, { ...form, permissions: editRow.value.permissions || [] })
      ElMessage.success('角色更新成功')
    } else {
      savedRole = await createRole({ ...form, permissions: [] })
      ElMessage.success('角色创建成功。请继续配置该角色的权限')
    }
    visible.value = false
    emit('success', savedRole)

    // 新增后跳转到权限配置
    if (!isEdit.value && savedRole) {
      emit('configure-permissions', savedRole)
    }
  } catch (e) {
    // handled by interceptor
  } finally {
    saving.value = false
  }
}

function handleBeforeClose(done) {
  formRef.value?.resetFields()
  done()
}

function handleCancel() {
  formRef.value?.resetFields()
  visible.value = false
}

defineExpose({ open })
</script>
