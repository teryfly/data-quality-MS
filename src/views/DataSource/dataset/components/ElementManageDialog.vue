<template>
  <el-dialog
    v-model="visible"
    :title="`数据元管理 — ${dataset?.datasetName || ''}`"
    width="900px"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <!-- Toolbar -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <el-input
        v-model="searchKey"
        placeholder="搜索字段名称"
        clearable
        style="width:220px"
        @input="handleSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-button type="primary" @click="openAdd">
        <el-icon><Plus /></el-icon>新增数据元
      </el-button>
    </div>

    <!-- Element table -->
    <el-table
      :data="pagedList"
      v-loading="loading"
      border
      size="small"
      style="width:100%"
      max-height="420"
    >
      <el-table-column label="字段名称" prop="elementName" min-width="130" />
      <el-table-column label="字段编码" prop="elementCode" width="130" />
      <el-table-column label="字段类型" prop="elementType" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="typeTagType(row.elementType)">{{ row.elementType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="必填" prop="isRequired" width="70" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.isRequired ? 'danger' : 'info'">
            {{ row.isRequired ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" min-width="160" show-overflow-tooltip />
      <el-table-column label="操作" width="130" fixed="right" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div style="display:flex;justify-content:flex-end;margin-top:12px">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="filteredList.length"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        small
        @size-change="currentPage = 1"
      />
    </div>
  </el-dialog>

  <!-- Add/Edit element dialog -->
  <el-dialog
    v-model="formVisible"
    :title="editingElement ? '编辑数据元' : '新增数据元'"
    width="480px"
    :close-on-click-modal="false"
    destroy-on-close
    append-to-body
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
      <el-form-item label="字段名称" prop="elementName">
        <el-input v-model="form.elementName" placeholder="如：患者姓名" maxlength="50" />
      </el-form-item>
      <el-form-item label="字段编码" prop="elementCode">
        <el-input
          v-model="form.elementCode"
          placeholder="如：XM"
          maxlength="50"
          :disabled="!!editingElement"
          style="text-transform:uppercase"
        />
      </el-form-item>
      <el-form-item label="字段类型" prop="elementType">
        <el-select v-model="form.elementType" style="width:100%">
          <el-option label="字符串 (string)" value="string" />
          <el-option label="数字 (number)" value="number" />
          <el-option label="日期 (date)" value="date" />
          <el-option label="日期时间 (datetime)" value="datetime" />
          <el-option label="布尔 (boolean)" value="boolean" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否必填">
        <el-switch v-model="form.isRequired" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可选" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="formVisible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSaveElement">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import axios from 'axios'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  dataset: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const loading = ref(false)
const allElements = ref([])
const searchKey = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

const filteredList = computed(() => {
  if (!searchKey.value) return allElements.value
  const q = searchKey.value.toLowerCase()
  return allElements.value.filter(
    e => (e.elementName || '').toLowerCase().includes(q) || (e.elementCode || '').toLowerCase().includes(q)
  )
})

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

function handleSearch() {
  currentPage.value = 1
}

function typeTagType(t) {
  return { string: '', number: 'success', date: 'warning', datetime: 'warning', boolean: 'info' }[t] || ''
}

async function fetchElements() {
  if (!props.dataset?.id) return
  loading.value = true
  try {
    const { data } = await axios.get(`/api/dataset/${props.dataset.id}/elements`, {
      params: { page: 1, size: 500 },
    })
    allElements.value = data.data?.records || []
  } catch {
    ElMessage.error('加载数据元失败')
  } finally {
    loading.value = false
  }
}

watch(() => [props.modelValue, props.dataset?.id], ([v]) => {
  if (v) {
    searchKey.value = ''
    currentPage.value = 1
    fetchElements()
  }
})

// ── Form ──────────────────────────────────────────────────────────────
const formVisible = ref(false)
const formRef = ref(null)
const editingElement = ref(null)
const saving = ref(false)

const defaultForm = () => ({
  elementName: '',
  elementCode: '',
  elementType: 'string',
  isRequired: 0,
  remark: '',
})

const form = ref(defaultForm())

const formRules = {
  elementName: [{ required: true, message: '字段名称不能为空', trigger: 'blur' }],
  elementCode: [
    { required: true, message: '字段编码不能为空', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_]+$/, message: '编码只能包含字母、数字和下划线', trigger: 'blur' },
  ],
  elementType: [{ required: true, message: '请选择字段类型', trigger: 'change' }],
}

function openAdd() {
  editingElement.value = null
  form.value = defaultForm()
  formVisible.value = true
}

function openEdit(row) {
  editingElement.value = row
  form.value = {
    elementName: row.elementName,
    elementCode: row.elementCode,
    elementType: row.elementType,
    isRequired: row.isRequired,
    remark: row.remark || '',
  }
  formVisible.value = true
}

async function handleSaveElement() {
  await formRef.value.validate()
  saving.value = true
  try {
    if (editingElement.value) {
      await axios.put(
        `/api/dataset/${props.dataset.id}/elements/${editingElement.value.id}`,
        form.value
      )
      ElMessage.success('数据元更新成功')
    } else {
      await axios.post(`/api/dataset/${props.dataset.id}/elements`, form.value)
      ElMessage.success('数据元创建成功')
    }
    formVisible.value = false
    fetchElements()
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || '操作失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(
    `确定要删除数据元「${row.elementName}（${row.elementCode}）」？此操作不可恢复。`,
    '删除确认',
    { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
  )
  try {
    await axios.delete(`/api/dataset/${props.dataset.id}/elements/${row.id}`)
    ElMessage.success('已删除')
    fetchElements()
  } catch {
    ElMessage.error('删除失败')
  }
}
</script>
