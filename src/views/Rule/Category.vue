<template>
  <PageContainer title="规则分类管理">
    <template #actions>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增分类</el-button>
    </template>

    <el-card>
      <el-table
        v-loading="loading"
        :data="categories"
        row-key="id"
        border
        stripe
      >
        <!-- drag handle column -->
        <el-table-column width="50" align="center">
          <template #header>
            <el-icon title="拖拽排序"><Sort /></el-icon>
          </template>
          <template #default>
            <el-icon class="drag-handle" style="cursor:grab;color:#c0c4cc"><Rank /></el-icon>
          </template>
        </el-table-column>

        <el-table-column prop="categoryName" label="分类名称" min-width="140" />
        <el-table-column prop="description" label="分类描述" min-width="240" show-overflow-tooltip />
        <el-table-column prop="priority" label="执行优先级" width="110" align="center" />
        <el-table-column prop="sortOrder" label="排序号" width="90" align="center" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button
              link
              type="danger"
              v-confirm-delete="() => handleDelete(row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingRow ? '编辑分类' : '新增分类'"
      width="520px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" maxlength="50" show-word-limit placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请输入分类描述" />
        </el-form-item>
        <el-form-item label="执行优先级" prop="priority">
          <el-input-number v-model="form.priority" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="排序号" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="1" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Plus, Sort, Rank } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import Sortable from 'sortablejs'

const loading = ref(false)
const saving = ref(false)
const categories = ref([])
const dialogVisible = ref(false)
const editingRow = ref(null)
const formRef = ref(null)

const defaultForm = () => ({ categoryName: '', description: '', priority: 1, sortOrder: 1 })
const form = ref(defaultForm())

const rules = {
  categoryName: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
  priority: [{ required: true, message: '执行优先级不能为空', trigger: 'blur' }],
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/api/rule/category')
    categories.value = data.data || []
  } finally {
    loading.value = false
  }
}

const openDialog = (row = null) => {
  editingRow.value = row
  form.value = row
    ? { categoryName: row.categoryName, description: row.description, priority: row.priority, sortOrder: row.sortOrder }
    : defaultForm()
  dialogVisible.value = true
}

const handleSave = async () => {
  await formRef.value.validate()
  saving.value = true
  try {
    if (editingRow.value) {
      await axios.put(`/api/rule/category/${editingRow.value.id}`, form.value)
      ElMessage.success('更新成功')
    } else {
      await axios.post('/api/rule/category', form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchCategories()
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id) => {
  await axios.delete(`/api/rule/category/${id}`)
  ElMessage.success('删除成功')
  fetchCategories()
}

// init sortable after table renders
let sortableInstance = null
const initSortable = () => {
  nextTick(() => {
    const tbody = document.querySelector('.el-table__body-wrapper tbody')
    if (!tbody || sortableInstance) return
    sortableInstance = Sortable.create(tbody, {
      handle: '.drag-handle',
      animation: 150,
      onEnd: async ({ newIndex, oldIndex }) => {
        if (newIndex === oldIndex) return
        const moved = categories.value.splice(oldIndex, 1)[0]
        categories.value.splice(newIndex, 0, moved)
        // update sort order
        categories.value.forEach((cat, i) => { cat.sortOrder = i + 1 })
        await axios.put('/api/rule/category/sort', { ids: categories.value.map(c => c.id) })
        ElMessage.success('排序已更新')
      }
    })
  })
}

onMounted(async () => {
  await fetchCategories()
  initSortable()
})
</script>
