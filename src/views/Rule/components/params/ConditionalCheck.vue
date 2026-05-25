<template>
  <div>
    <div style="margin-bottom:16px;font-weight:600;color:#606266">选择数据集</div>
    <el-form-item label=" " prop="params.datasetId" :rules="req('数据集')" style="margin-bottom:16px">
      <DatasetElementSelector
        :model-value="{ datasetId: model.datasetId, elementIds: [] }"
        :datasets="datasets"
        data-set-label="数据集"
        element-label="字段参考"
        selection-label="已选"
        :multiple="false"
        @update:model-value="onDatasetChange"
      />
    </el-form-item>

  <!-- condition_expr -->
  <el-form-item label="条件表达式" prop="params.conditionExpr" :rules="req('条件表达式')">
    <div style="width:100%">
      <div style="font-size:12px;color:#909399;margin-bottom:4px">当满足以下条件时（SQL WHERE子句片段）</div>
      <el-input
        ref="condRef"
        v-model="model.conditionExpr"
        type="textarea"
        :rows="4"
        style="font-family:monospace;font-size:13px;resize:vertical;min-height:120px"
        placeholder="如: t.XBM = '1' AND t.AGE > 18"
      />
      <el-collapse style="margin-top:4px">
        <el-collapse-item title="查看示例">
          <el-alert type="info" :closable="false">
            <div>示例：<code>t.zdmc LIKE '%肺炎%' OR t.zddm LIKE 'J18.9%'</code></div>
            <div style="margin-top:4px;color:#909399">说明：t 为当前数据集的表别名，可直接引用字段名</div>
          </el-alert>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-form-item>

  <!-- result_expr -->
  <el-form-item label="结果表达式" prop="params.resultExpr" :rules="req('结果表达式')">
    <div style="width:100%">
      <div style="font-size:12px;color:#909399;margin-bottom:4px">则必须满足以下条件（不满足时为问题数据）</div>
      <el-input
        ref="resRef"
        v-model="model.resultExpr"
        type="textarea"
        :rows="4"
        style="font-family:monospace;font-size:13px;resize:vertical;min-height:120px"
        placeholder="如: t.CYRQ >= t.RYRQ"
      />
      <el-collapse style="margin-top:4px">
        <el-collapse-item title="查看示例">
          <el-alert type="info" :closable="false">
            <div>示例：<code>t.CYRQ >= t.RYRQ</code></div>
            <div style="margin-top:4px;color:#909399">说明：出院日期必须晚于或等于入院日期</div>
          </el-alert>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-form-item>

  <!-- validate button -->
  <el-form-item label=" ">
    <el-button type="primary" plain :loading="validating" @click="handleValidate">校验表达式</el-button>
    <div v-if="validateResult !== null" :style="validateResult.valid ? 'color:#67c23a' : 'color:#f56c6c'" style="margin-top:6px;font-size:13px">
      <template v-if="validateResult.valid">✓ 校验通过</template>
      <template v-else>✗ 错误：{{ validateResult.error }}</template>
    </div>
  </el-form-item>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import DatasetElementSelector from './DatasetElementSelector.vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  datasets: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'validate-result'])
const req = (name) => [{ required: true, message: `${name}不能为空`, trigger: 'blur' }]

const model = ref({ datasetId: null, conditionExpr: '', resultExpr: '', ...props.modelValue })
const validating = ref(false)
const validateResult = ref(null)

watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(() => props.modelValue, (v) => { if (v) model.value = { ...model.value, ...v } }, { deep: true })

const onDatasetChange = (val) => {
  model.value.datasetId = val.datasetId
}

const handleValidate = async () => {
  validating.value = true
  validateResult.value = null
  try {
    const { data } = await axios.post('/api/rule/validate-sql', {
      expr: `${model.value.conditionExpr} AND ${model.value.resultExpr}`
    })
    validateResult.value = data.data
    emit('validate-result', data.data.valid)
  } catch {
    validateResult.value = { valid: false, error: '校验请求失败' }
    emit('validate-result', false)
  } finally {
    validating.value = false
  }
}

defineExpose({ isValidated: () => validateResult.value?.valid === true })
</script>
