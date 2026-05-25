<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="440px"
    :close-on-click-modal="false"
    @closed="onClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="84px"
      label-position="right"
    >
      <el-form-item label="整改状态" prop="isFixed">
        <el-select v-model="form.isFixed" placeholder="请选择整改状态" style="width: 100%">
          <el-option label="整改中" :value="1" />
          <el-option label="已整改" :value="2" />
          <el-option label="无需整改" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="整改说明" prop="fixDescription">
        <el-input
          v-model="form.fixDescription"
          type="textarea"
          :rows="4"
          maxlength="200"
          show-word-limit
          placeholder="选填，最多200字"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { markFix, batchMarkFix } from '@/api/result'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** 单条整改：传 detail 对象；批量整改：传 ids 数组 */
  detail: { type: Object, default: null },
  ids: { type: Array, default: null },
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const isBatch = computed(() => Array.isArray(props.ids) && props.ids.length > 0)

const title = computed(() => {
  if (isBatch.value) return `批量整改（已选 ${props.ids.length} 条）`
  if (props.detail) return `标记整改 - ${props.detail.businessId || ''}`
  return '标记整改'
})

const formRef = ref(null)
const submitting = ref(false)
const form = ref({
  isFixed: 1,
  fixDescription: '',
})

const rules = {
  isFixed: [{ required: true, message: '请选择整改状态', trigger: 'change' }],
}

function onClosed() {
  form.value = { isFixed: 1, fixDescription: '' }
  formRef.value?.clearValidate()
}

async function onSubmit() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (isBatch.value) {
        await batchMarkFix({
          ids: props.ids,
          isFixed: form.value.isFixed,
          fixDescription: form.value.fixDescription,
        })
        ElMessage.success(`已提交批量整改，系统将自动复检（${props.ids.length} 条）`)
      } else if (props.detail) {
        await markFix(props.detail.id, {
          isFixed: form.value.isFixed,
          fixDescription: form.value.fixDescription,
        })
        ElMessage.success('已提交整改，系统将自动复检')
      }
      emit('success')
      visible.value = false
    } catch {
      // request interceptor already shows error toast
    } finally {
      submitting.value = false
    }
  })
}
</script>
