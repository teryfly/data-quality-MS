<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑数据集' : '新增数据集'"
    width="520px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleBeforeClose"
    draggable
  >
    <div style="max-height: calc(70vh - 130px); overflow-y: auto;">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        v-loading="formLoading"
      >
        <!-- 新增时才显示编码和名称 -->
        <template v-if="!isEdit">
          <el-form-item label="数据集编码" prop="datasetCode">
            <el-input
              v-model="form.datasetCode"
              placeholder="如：mz_jzjl（英文+下划线）"
              maxlength="50"
            />
            <div class="form-tip">编码在系统中唯一，创建后不可修改</div>
          </el-form-item>
          <el-form-item label="数据集名称" prop="datasetName">
            <el-input v-model="form.datasetName" placeholder="如：门诊就诊记录" maxlength="100" />
          </el-form-item>
          <el-form-item label="所属数据源" prop="dataSourceId">
            <el-select v-model="form.dataSourceId" style="width:100%">
              <el-option label="业务中心库（主数据源）" :value="1" />
            </el-select>
          </el-form-item>
        </template>

        <!-- 编辑时显示只读信息 -->
        <template v-else>
          <el-form-item label="数据集编码">
            <span class="readonly-text">{{ props.dataset?.datasetCode }}</span>
          </el-form-item>
          <el-form-item label="数据集名称">
            <span class="readonly-text">{{ props.dataset?.datasetName }}</span>
          </el-form-item>
        </template>

        <el-form-item label="机构代码字段" prop="orgCodeField">
          <el-select
            v-if="isEdit && elements.length > 0"
            v-model="form.orgCodeField"
            placeholder="请从已同步字段中选择"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="el in elements"
              :key="el.elementCode"
              :label="`${el.elementName}（${el.elementCode}）`"
              :value="el.elementCode"
            />
          </el-select>
          <el-input
            v-else
            v-model="form.orgCodeField"
            placeholder="如：YLJGDM"
          />
          <div class="form-tip">该字段用于区分机构来源，需与业务数据中的机构代码字段一致</div>
        </el-form-item>

        <el-form-item label="业务主键字段" prop="businessKeyField">
          <el-input
            v-model="form.businessKeyField"
            placeholder="多字段用英文逗号分隔，如：CFID,MXXH"
          />
        </el-form-item>

        <el-form-item label="是否必选">
          <el-switch v-model="form.isRequired" :active-value="1" :inactive-value="0" />
          <span class="switch-tip">{{ form.isRequired ? '质控时必须上传' : '质控时可选择性上传' }}</span>
        </el-form-item>

        <el-form-item label="排序号">
          <el-input-number
            v-model="form.sortNo"
            :min="0"
            :max="9999"
            :controls="false"
            style="width: 120px"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="saveLoading" @click="handleSave">
        {{ isEdit ? '保存' : '创建数据集' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { showWarningConfirm } from '@/utils/dialog'

const props = defineProps({
  modelValue: Boolean,
  dataset: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.dataset)

const formRef = ref(null)
const formLoading = ref(false)
const saveLoading = ref(false)
const isDirty = ref(false)
const elements = ref([])

const form = reactive({
  datasetCode: '',
  datasetName: '',
  dataSourceId: 1,
  orgCodeField: 'YLJGDM',
  businessKeyField: '',
  isRequired: 1,
  sortNo: 0,
})

const rules = computed(() => ({
  datasetCode: isEdit.value ? [] : [
    { required: true, message: '数据集编码不能为空', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '编码只能以字母开头，包含字母、数字和下划线', trigger: 'blur' },
  ],
  datasetName: isEdit.value ? [] : [
    { required: true, message: '数据集名称不能为空', trigger: 'blur' },
  ],
  orgCodeField: [{ required: true, message: '请填写机构代码字段名', trigger: 'blur' }],
  businessKeyField: [{ required: true, message: '请输入业务主键字段', trigger: 'blur' }],
}))

watch(visible, async val => {
  if (val) {
    isDirty.value = false
    formRef.value?.clearValidate()
    if (isEdit.value && props.dataset) {
      form.datasetCode = props.dataset.datasetCode || ''
      form.datasetName = props.dataset.datasetName || ''
      form.dataSourceId = props.dataset.dataSourceId || 1
      form.orgCodeField = props.dataset.orgCodeField || ''
      form.businessKeyField = props.dataset.businessKeyField || ''
      form.isRequired = props.dataset.isRequired ?? 1
      form.sortNo = props.dataset.sortNo ?? 0
      await loadElements()
    } else {
      Object.assign(form, {
        datasetCode: '', datasetName: '', dataSourceId: 1,
        orgCodeField: 'YLJGDM', businessKeyField: '', isRequired: 1, sortNo: 0,
      })
      elements.value = []
    }
  }
})

watch(() => [form.orgCodeField, form.businessKeyField, form.isRequired, form.sortNo, form.datasetCode, form.datasetName], () => {
  isDirty.value = true
})

async function loadElements() {
  if (!props.dataset?.id) return
  formLoading.value = true
  try {
    const res = await axios.get(`/api/dataset/${props.dataset.id}/elements`, { params: { size: 500 } })
    elements.value = res.data?.data?.records || []
  } catch {
    elements.value = []
  } finally {
    formLoading.value = false
  }
}

async function handleSave() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  saveLoading.value = true
  try {
    if (isEdit.value) {
      await axios.put(`/api/dataset/${props.dataset.id}`, {
        orgCodeField: form.orgCodeField,
        businessKeyField: form.businessKeyField,
        isRequired: form.isRequired,
        sortNo: form.sortNo,
      })
      ElMessage.success('数据集更新成功')
    } else {
      await axios.post('/api/dataset', { ...form })
      ElMessage.success('数据集创建成功')
    }
    isDirty.value = false
    visible.value = false
    emit('saved')
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || '保存失败，请重试')
  } finally {
    saveLoading.value = false
  }
}

function handleCancel() {
  if (isDirty.value) {
    showWarningConfirm('有未保存的更改，确定要关闭吗？', '提示', {
      confirmButtonText: '确定关闭',
      cancelButtonText: '继续编辑'
    }).then(() => { visible.value = false }).catch(() => {})
  } else {
    visible.value = false
  }
}

function handleBeforeClose(done) {
  if (isDirty.value) {
    showWarningConfirm('有未保存的更改，确定要关闭吗？', '提示', {
      confirmButtonText: '确定关闭',
      cancelButtonText: '继续编辑'
    }).then(() => done()).catch(() => {})
  } else {
    done()
  }
}
</script>

<style scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  line-height: 1.4;
}
.readonly-text {
  color: #303133;
  background: #f5f7fa;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 14px;
  height: 32px;
  line-height: 32px;
  display: inline-block;
  min-width: 160px;
}
.switch-tip {
  margin-left: 10px;
  font-size: 13px;
  color: #909399;
}
</style>
