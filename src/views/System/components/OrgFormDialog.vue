<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑机构' : '新增机构'"
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
      label-width="100px"
      v-loading="saving"
    >
      <!-- 机构名称 -->
      <el-form-item label="机构名称" prop="orgName">
        <el-input
          v-model="form.orgName"
          maxlength="100"
          show-word-limit
          placeholder="请输入机构名称"
        />
      </el-form-item>

      <!-- 机构代码 -->
      <el-form-item label="机构代码" prop="orgCode">
        <div style="display: flex; align-items: center; width: 100%; gap: 8px;">
          <el-input
            v-model="form.orgCode"
            maxlength="50"
            placeholder="请输入机构代码"
            style="flex: 1;"
          />
          <el-tooltip
            content="机构代码必须与业务数据中的医疗机构代码字段值完全一致，否则将导致数据过滤错误。"
            placement="top"
            :max-width="280"
          >
            <el-icon style="color: #409EFF; cursor: pointer; font-size: 16px; flex-shrink: 0;">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </el-form-item>

      <!-- 所属区县 -->
      <el-form-item label="所属区县" prop="districtCode">
        <el-select
          v-model="form.districtCode"
          placeholder="请选择所属区县"
          style="width: 100%"
          @change="onDistrictChange"
        >
          <el-option
            v-for="d in districtOptions"
            :key="d.code"
            :label="d.name"
            :value="d.code"
          />
        </el-select>
      </el-form-item>

      <!-- 机构类型 -->
      <el-form-item label="机构类型" prop="orgType">
        <el-select
          v-model="form.orgType"
          placeholder="请选择机构类型"
          style="width: 100%"
        >
          <el-option label="三级甲等医院" value="三级甲等医院" />
          <el-option label="三级乙等医院" value="三级乙等医院" />
          <el-option label="二级甲等医院" value="二级甲等医院" />
          <el-option label="二级乙等医院" value="二级乙等医院" />
          <el-option label="二级甲等中医院" value="二级甲等中医院" />
          <el-option label="社区卫生服务中心" value="社区卫生服务中心" />
          <el-option label="卫生院" value="卫生院" />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>

      <!-- 联系人 -->
      <el-form-item label="联系人" prop="contactPerson">
        <el-input v-model="form.contactPerson" maxlength="50" placeholder="请输入联系人姓名" />
      </el-form-item>

      <!-- 联系电话 -->
      <el-form-item label="联系电话" prop="contactPhone">
        <el-input v-model="form.contactPhone" maxlength="20" placeholder="请输入联系电话" />
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
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import { createOrg, updateOrg } from '@/api/system.js'

const emit = defineEmits(['success'])

// 区县选项
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

const visible = ref(false)
const saving = ref(false)
const formRef = ref(null)
const editRow = ref(null)

const isEdit = computed(() => !!editRow.value)

const defaultForm = () => ({
  orgName: '',
  orgCode: '',
  districtCode: '',
  districtName: '',
  orgType: '',
  contactPerson: '',
  contactPhone: '',
})

const form = reactive(defaultForm())

const rules = {
  orgName: [
    { required: true, message: '机构名称不能为空', trigger: 'blur' },
    { max: 100, message: '机构名称不能超过100个字符', trigger: 'input' },
  ],
  orgCode: [
    { required: true, message: '机构代码不能为空', trigger: 'blur' },
    {
      pattern: /^[A-Za-z0-9]{2,50}$/,
      message: '机构代码只能包含数字和字母，长度2-50位',
      trigger: 'blur',
    },
  ],
  districtCode: [
    { required: true, message: '所属区县不能为空', trigger: 'change' },
  ],
  contactPhone: [
    {
      pattern: /^(1[3-9]\d{9}|0\d{2,3}-?\d{7,8})$/,
      message: '请输入有效的联系电话',
      trigger: 'blur',
    },
  ],
}

function onDistrictChange(code) {
  const found = districtOptions.find(d => d.code === code)
  form.districtName = found ? found.name : ''
}

function open(row = null) {
  editRow.value = row
  Object.assign(form, defaultForm())
  if (row) {
    Object.assign(form, {
      orgName: row.orgName || '',
      orgCode: row.orgCode || '',
      districtCode: row.districtCode || '',
      districtName: row.districtName || '',
      orgType: row.orgType || '',
      contactPerson: row.contactPerson || '',
      contactPhone: row.contactPhone || '',
    })
  }
  visible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (isEdit.value) {
      await updateOrg(editRow.value.id, { ...form })
      ElMessage.success('机构更新成功')
    } else {
      await createOrg({ ...form })
      ElMessage.success('机构创建成功')
    }
    visible.value = false
    emit('success')
  } catch (e) {
    // error handled by request interceptor
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
