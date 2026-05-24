<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑数据源' : '新增数据源'"
    width="560px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleBeforeClose"
    draggable
  >
    <div style="max-height: calc(80vh - 130px); overflow-y: auto; padding-right: 4px;">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="110px"
        v-loading="formLoading"
      >
        <el-form-item label="数据源名称" prop="sourceName">
          <el-input v-model="form.sourceName" maxlength="100" show-word-limit placeholder="请输入数据源名称" />
        </el-form-item>

        <el-form-item label="数据源类型" prop="sourceType">
          <el-select
            v-model="form.sourceType"
            :disabled="isEdit"
            placeholder="请选择数据源类型"
            style="width: 100%"
          >
            <el-option label="业务中心库" value="business" />
            <el-option label="值域代码库" value="code" />
          </el-select>
          <div v-if="isEdit" class="field-tip">数据源类型创建后不可修改</div>
        </el-form-item>

        <el-form-item label="数据库类型" prop="dbType">
          <el-select v-model="form.dbType" placeholder="请选择数据库类型" style="width: 100%">
            <el-option label="MySQL" value="MySQL" />
            <el-option label="PostgreSQL" value="PostgreSQL" />
            <el-option label="Oracle" value="Oracle" />
            <el-option label="DM（达梦）" value="DM" />
          </el-select>
        </el-form-item>

        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="form.ip" placeholder="如：192.168.1.100" />
        </el-form-item>

        <el-form-item label="端口" prop="port">
          <el-input-number
            v-model="form.port"
            :min="1"
            :max="65535"
            :controls="false"
            style="width: 100%"
            placeholder="如：3306"
          />
        </el-form-item>

        <el-form-item label="数据库名" prop="dbName">
          <el-input v-model="form.dbName" placeholder="请输入数据库名" />
        </el-form-item>

        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="isEdit ? '●●●●●●（已配置，不填则不修改）' : '请输入密码'"
          />
        </el-form-item>

        <el-form-item v-if="form.sourceType === 'code'" label="同步频率" prop="syncFrequency">
          <el-select v-model="form.syncFrequency" placeholder="请选择同步频率" style="width: 100%">
            <el-option label="每日" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
      </el-form>

      <div v-if="testResult" class="test-result" :class="testResult.success ? 'test-success' : 'test-error'">
        <el-icon><component :is="testResult.success ? CircleCheck : CircleClose" /></el-icon>
        <span>{{ testResult.message }}</span>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button :loading="testLoading" @click="handleTest">
          {{ testLoading ? '测试中...' : '测试连接' }}
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          :disabled="!testPassed"
          :loading="saveLoading"
          @click="handleSave"
        >
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CircleCheck, CircleClose } from '@element-plus/icons-vue'
import axios from 'axios'

const props = defineProps({
  modelValue: Boolean,
  editData: { type: Object, default: null },
  initType: { type: String, default: 'business' }
})
const emit = defineEmits(['update:modelValue', 'saved', 'sync-now'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.editData)
const formRef = ref(null)
const formLoading = ref(false)
const testLoading = ref(false)
const saveLoading = ref(false)
const testPassed = ref(false)
const testResult = ref(null)
const isDirty = ref(false)

const defaultForm = () => ({
  sourceName: '',
  sourceType: props.initType || 'business',
  dbType: 'MySQL',
  ip: '',
  port: 3306,
  dbName: '',
  username: '',
  password: '',
  syncFrequency: 'weekly'
})

const form = reactive(defaultForm())

const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/

const rules = {
  sourceName: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }, { max: 100, message: '最多100个字符', trigger: 'blur' }],
  sourceType: [{ required: true, message: '请选择数据源类型', trigger: 'change' }],
  dbType: [{ required: true, message: '请选择数据库类型', trigger: 'change' }],
  ip: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    { pattern: ipRegex, message: 'IP地址格式不正确', trigger: 'blur' }
  ],
  port: [{ required: true, message: '请输入端口号', trigger: 'blur' }],
  dbName: [{ required: true, message: '请输入数据库名', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    {
      validator: (rule, value, callback) => {
        if (!isEdit.value && !value) {
          callback(new Error('请输入密码'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  syncFrequency: [
    {
      validator: (rule, value, callback) => {
        if (form.sourceType === 'code' && !value) {
          callback(new Error('请选择同步频率'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

watch(visible, val => {
  if (val) {
    testPassed.value = false
    testResult.value = null
    isDirty.value = false
    if (props.editData) {
      Object.assign(form, {
        sourceName: props.editData.sourceName || '',
        sourceType: props.editData.sourceType || 'business',
        dbType: props.editData.dbType || 'MySQL',
        ip: props.editData.ip || '',
        port: props.editData.port || 3306,
        dbName: props.editData.dbName || '',
        username: props.editData.username || '',
        password: '',
        syncFrequency: props.editData.syncFrequency || 'weekly'
      })
    } else {
      Object.assign(form, defaultForm())
      form.sourceType = props.initType || 'business'
    }
  }
})

watch(form, () => { isDirty.value = true; testPassed.value = false; testResult.value = null }, { deep: true })

async function handleTest() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  testLoading.value = true
  testResult.value = null
  try {
    let res
    if (isEdit.value && props.editData?.id) {
      res = await axios.post(`/api/datasource/${props.editData.id}/test`)
    } else {
      // For new datasource, save first then test — or just mock a test with form data
      res = await axios.post('/api/datasource/0/test', form)
    }
    const ok = res.data?.data?.connected
    testPassed.value = ok
    testResult.value = { success: ok, message: ok ? '连接测试成功！' : (res.data?.message || '连接失败') }
  } catch {
    testPassed.value = false
    testResult.value = { success: false, message: '连接测试失败，请检查配置' }
  } finally {
    testLoading.value = false
  }
}

async function handleSave() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  if (!testPassed.value) {
    ElMessage.warning('请先通过连接测试')
    return
  }
  saveLoading.value = true
  try {
    const payload = { ...form }
    if (isEdit.value && !payload.password) delete payload.password
    let savedId = props.editData?.id
    if (isEdit.value) {
      await axios.put(`/api/datasource/${props.editData.id}`, payload)
      ElMessage.success('数据源更新成功')
    } else {
      const res = await axios.post('/api/datasource', payload)
      savedId = res.data?.data?.id
      ElMessage.success('数据源添加成功')
    }
    isDirty.value = false
    visible.value = false
    emit('saved')

    if (form.sourceType === 'code') {
      ElMessageBox.confirm(
        '是否立即触发代码库初始同步？',
        '触发同步',
        { confirmButtonText: '立即同步', cancelButtonText: '稍后再说', type: 'info' }
      ).then(() => {
        emit('sync-now', savedId)
      }).catch(() => {})
    }
  } catch {
    ElMessage.error('保存失败，请重试')
  } finally {
    saveLoading.value = false
  }
}

function handleCancel() {
  if (isDirty.value) {
    ElMessageBox.confirm('有未保存的更改，确定要关闭吗？', '提示', {
      confirmButtonText: '确定关闭',
      cancelButtonText: '继续编辑',
      type: 'warning'
    }).then(() => {
      visible.value = false
    }).catch(() => {})
  } else {
    visible.value = false
  }
}

function handleBeforeClose(done) {
  if (isDirty.value) {
    ElMessageBox.confirm('有未保存的更改，确定要关闭吗？', '提示', {
      confirmButtonText: '确定关闭',
      cancelButtonText: '继续编辑',
      type: 'warning'
    }).then(() => done()).catch(() => {})
  } else {
    done()
  }
}
</script>

<style scoped>
.field-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.test-result {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  margin-top: 12px;
}

.test-success {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #c2e7b0;
}

.test-error {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
