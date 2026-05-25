<template>
  <el-dialog v-model="visible" title="批量导入规则" width="640px" destroy-on-close>
    <div>
      <div style="margin-bottom:16px">
        <el-button :icon="Download" @click="downloadTemplate">下载导入模板</el-button>
        <span style="margin-left:12px;color:#909399;font-size:12px">支持 .json 和 .xlsx 格式</span>
      </div>

      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :limit="1"
        :on-change="handleFileChange"
        :on-exceed="() => ElMessage.warning('只能上传一个文件')"
        accept=".json,.xlsx"
        drag
      >
        <el-icon size="48" style="color:#c0c4cc"><UploadFilled /></el-icon>
        <div style="font-size:14px;margin-top:8px">将文件拖到此处，或<em style="color:#409eff">点击上传</em></div>
        <div style="font-size:12px;color:#909399;margin-top:4px">支持 .json / .xlsx 格式</div>
      </el-upload>

      <!-- Preview result -->
      <template v-if="previewResult">
        <div style="margin-top:16px">
          <el-tag type="success">成功 {{ previewResult.successCount }} 条</el-tag>
          <el-tag type="danger" style="margin-left:8px">失败 {{ previewResult.failedCount }} 条</el-tag>
        </div>
        <el-table
          v-if="previewResult.failures && previewResult.failures.length"
          :data="previewResult.failures"
          border
          size="small"
          style="margin-top:8px"
          max-height="240"
        >
          <el-table-column prop="rowNumber" label="行号" width="70" />
          <el-table-column prop="ruleName" label="规则名称" />
          <el-table-column prop="error" label="失败原因" show-overflow-tooltip />
        </el-table>
      </template>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button v-if="!previewResult" type="primary" :loading="uploading" :disabled="!selectedFile" @click="handlePreview">
        上传预检
      </el-button>
      <el-button v-else type="primary" :loading="importing" @click="handleImport">
        确认导入
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, UploadFilled } from '@element-plus/icons-vue'
import axios from 'axios'

const props = defineProps({ modelValue: { type: Boolean, default: false } })
const emit = defineEmits(['update:modelValue', 'imported'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const uploadRef = ref(null)
const selectedFile = ref(null)
const previewResult = ref(null)
const uploading = ref(false)
const importing = ref(false)

const handleFileChange = (file) => { selectedFile.value = file.raw }

const downloadTemplate = async () => {
  const res = await axios.get('/api/rule/template/download', { responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url; a.download = '规则导入模板.xlsx'; a.click()
  URL.revokeObjectURL(url)
}

const handlePreview = async () => {
  if (!selectedFile.value) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', selectedFile.value)
    const { data } = await axios.post('/api/rule/import', fd)
    previewResult.value = data.data
  } finally {
    uploading.value = false
  }
}

const handleImport = async () => {
  importing.value = true
  try {
    ElMessage.success(`成功导入 ${previewResult.value.successCount} 条规则`)
    visible.value = false
    emit('imported')
  } finally {
    importing.value = false
  }
}
</script>
