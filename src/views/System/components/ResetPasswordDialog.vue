<template>
  <el-dialog
    v-model="visible"
    :title="`重置密码 — ${targetUser?.username || ''}`"
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
      label-width="90px"
      v-loading="saving"
    >
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          show-password
          maxlength="64"
          placeholder="请输入新密码"
        />
        <div class="field-tip">密码需包含大写字母、小写字母和数字，长度至少8位</div>
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          show-password
          maxlength="64"
          placeholder="请再次输入新密码"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">
        {{ saving ? '提交中...' : '确定重置' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { resetUserPassword } from '@/api/system.js'

const emit = defineEmits(['success'])

const visible = ref(false)
const saving = ref(false)
const formRef = ref(null)
const targetUser = ref(null)

const form = reactive({
  newPassword: '',
  confirmPassword: '',
})

const passwordStrengthValidator = (rule, value, callback) => {
  if (!value) return callback(new Error('新密码不能为空'))
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  if (!strongRegex.test(value)) {
    return callback(new Error('密码需包含大写字母、小写字母和数字，长度至少8位'))
  }
  callback()
}

const confirmPasswordValidator = (rule, value, callback) => {
  if (!value) return callback(new Error('确认密码不能为空'))
  if (value !== form.newPassword) {
    return callback(new Error('两次输入的密码不一致'))
  }
  callback()
}

const rules = {
  newPassword: [
    { validator: passwordStrengthValidator, trigger: 'blur' },
  ],
  confirmPassword: [
    { validator: confirmPasswordValidator, trigger: 'blur' },
  ],
}

function open(user) {
  targetUser.value = user
  form.newPassword = ''
  form.confirmPassword = ''
  visible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    await resetUserPassword(targetUser.value.id, { newPassword: form.newPassword })
    ElMessage.success('密码重置成功')
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
  color: #E6A23C;
  line-height: 1.4;
  margin-top: 4px;
}
</style>
