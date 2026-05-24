<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="480px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleBeforeClose"
    draggable
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      v-loading="saving"
    >
      <!-- 用户名 -->
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="form.username"
          maxlength="50"
          :disabled="isEdit"
          placeholder="请输入用户名"
        />
        <div v-if="isEdit" class="field-tip">用户名创建后不可修改</div>
      </el-form-item>

      <!-- 密码 -->
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          show-password
          maxlength="64"
          :placeholder="isEdit ? '不填则不修改密码' : '请输入密码'"
        />
        <div class="field-tip password-tip">
          密码需包含大写字母、小写字母和数字，长度至少8位
        </div>
      </el-form-item>

      <!-- 真实姓名 -->
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="form.realName" maxlength="50" placeholder="请输入真实姓名" />
      </el-form-item>

      <!-- 所属机构 -->
      <el-form-item label="所属机构" prop="orgId">
        <el-select
          v-model="form.orgId"
          placeholder="请选择所属机构"
          style="width: 100%"
          clearable
          filterable
          @change="onOrgChange"
        >
          <el-option
            v-for="org in orgOptions"
            :key="org.id"
            :label="org.orgName"
            :value="org.id"
          />
        </el-select>
      </el-form-item>

      <!-- 角色 -->
      <el-form-item label="角色" prop="roleId">
        <el-select
          v-model="form.roleId"
          placeholder="请选择角色"
          style="width: 100%"
          @change="onRoleChange"
        >
          <el-option
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.roleName"
            :value="role.id"
          />
        </el-select>
      </el-form-item>

      <!-- 联系电话 -->
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="form.phone" maxlength="20" placeholder="请输入联系电话" />
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
import { createUser, updateUser, getOrgList, getRoleList } from '@/api/system.js'

const emit = defineEmits(['success'])

const visible = ref(false)
const saving = ref(false)
const formRef = ref(null)
const editRow = ref(null)
const orgOptions = ref([])
const roleOptions = ref([])

const isEdit = computed(() => !!editRow.value)

const defaultForm = () => ({
  username: '',
  password: '',
  realName: '',
  orgId: null,
  orgName: '',
  orgCode: '',
  roleId: null,
  roleName: '',
  phone: '',
})

const form = reactive(defaultForm())

// 密码强度校验（新增必填，编辑选填）
const passwordValidator = (rule, value, callback) => {
  if (!isEdit.value && !value) {
    return callback(new Error('密码不能为空'))
  }
  if (value) {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!strongRegex.test(value)) {
      return callback(new Error('密码需包含大写字母、小写字母和数字，长度至少8位'))
    }
  }
  callback()
}

const rules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { max: 50, message: '用户名不能超过50个字符', trigger: 'input' },
    { pattern: /^[A-Za-z0-9_]{3,50}$/, message: '用户名只能包含字母、数字和下划线，长度3-50位', trigger: 'blur' },
  ],
  password: [
    { validator: passwordValidator, trigger: 'blur' },
  ],
  realName: [
    { required: true, message: '真实姓名不能为空', trigger: 'blur' },
    { max: 50, message: '真实姓名不能超过50个字符', trigger: 'input' },
  ],
  phone: [
    {
      pattern: /^(1[3-9]\d{9}|0\d{2,3}-?\d{7,8})$/,
      message: '请输入有效的联系电话',
      trigger: 'blur',
    },
  ],
}

function onOrgChange(orgId) {
  const org = orgOptions.value.find(o => o.id === orgId)
  form.orgName = org ? org.orgName : ''
  form.orgCode = org ? org.orgCode : ''
}

function onRoleChange(roleId) {
  const role = roleOptions.value.find(r => r.id === roleId)
  form.roleName = role ? role.roleName : ''
}

async function loadOptions() {
  try {
    const [orgRes, roleRes] = await Promise.all([
      getOrgList({ page: 1, size: 200 }),
      getRoleList(),
    ])
    orgOptions.value = orgRes.records || orgRes.list || orgRes || []
    roleOptions.value = Array.isArray(roleRes) ? roleRes : (roleRes.records || roleRes.list || [])
  } catch {
    // ignore
  }
}

function open(row = null) {
  editRow.value = row
  Object.assign(form, defaultForm())
  if (row) {
    Object.assign(form, {
      username: row.username || '',
      password: '',
      realName: row.realName || '',
      orgId: row.orgId || null,
      orgName: row.orgName || '',
      orgCode: row.orgCode || '',
      roleId: row.roleId || null,
      roleName: row.roleName || '',
      phone: row.phone || '',
    })
  }
  visible.value = true
  loadOptions()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const payload = { ...form }
    // 编辑时若密码为空则不提交密码
    if (isEdit.value && !payload.password) {
      delete payload.password
    }

    if (isEdit.value) {
      await updateUser(editRow.value.id, payload)
      ElMessage.success('用户更新成功')
    } else {
      await createUser(payload)
      ElMessage.success('用户创建成功')
    }
    visible.value = false
    emit('success')
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

<style scoped>
.field-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  margin-top: 4px;
}
.password-tip {
  color: #E6A23C;
}
</style>
