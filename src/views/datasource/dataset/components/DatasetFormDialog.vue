<template>
  <el-dialog
    v-model="visible"
    title="编辑数据集"
    width="480px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleBeforeClose"
    draggable
  >
    <div style="max-height: calc(60vh - 110px); overflow-y: auto;">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        v-loading="formLoading"
      >
        <el-form-item label="机构代码字段" prop="orgCodeField">
          <el-select
            v-model="form.orgCodeField"
            placeholder="请从已同步字段中选择"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="el in elements"
              :key="el.fieldCode"
              :label="`${el.fieldName}（${el.fieldCode}）`"
              :value="el.fieldCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="业务主键字段" prop="businessKeyField">
          <el-input
            v-model="form.businessKeyField"
            placeholder="多字段用英文逗号分隔，如 cf_id,mx_xh"
          />
        </el-form-item>

        <el-form-item label="是否必选" prop="isRequired">
          <el-switch v-model="form.isRequired" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <el-form-item label="排序号" prop="sortOrder">
          <el-input-number
            v-model="form.sortOrder"
            :min="0"
            :max="9999"
            :controls="false"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="saveLoading" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const props = defineProps({
  modelValue: Boolean,
  dataset: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const formRef = ref(null)
const formLoading = ref(false)
const saveLoading = ref(false)
const isDirty = ref(false)
const elements = ref([])

const form = reactive({
  orgCodeField: '',
  businessKeyField: '',
  isRequired: 1,
  sortOrder: 0
})

const rules = {
  orgCodeField: [{ required: true, message: '请选择机构代码字段', trigger: 'change' }],
  businessKeyField: [{ required: true, message: '请输入业务主键字段', trigger: 'blur' }]
}

watch(visible, async val => {
  if (val && props.dataset) {
    isDirty.value = false
    form.orgCodeField = props.dataset.orgCodeField || ''
    form.businessKeyField = props.dataset.businessKeyField || ''
    form.isRequired = props.dataset.isRequired ?? 1
    form.sortOrder = props.dataset.sortOrder ?? 0
    await loadElements()
  }
})

watch(form, () => { isDirty.value = true }, { deep: true })

async function loadElements() {
  formLoading.value = true
  try {
    const res = await axios.get(`/api/dataset/${props.dataset.id}/elements`)
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
    await axios.put(`/api/dataset/${props.dataset.id}`, { ...form })
    ElMessage.success('数据集保存成功')
    isDirty.value = false
    visible.value = false
    emit('saved')
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
    }).then(() => { visible.value = false }).catch(() => {})
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
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
