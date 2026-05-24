<template>
  <PageContainer title="规则模板管理">
    <el-tabs v-model="activeTab" @tab-change="fetchData">
      <el-tab-pane label="系统预置模板" name="system" />
      <el-tab-pane label="用户自定义模板" name="user" />
    </el-tabs>

    <el-card>
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="templateName" label="模板名称" min-width="200" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="包含规则数" width="110" align="center">
          <template #default="{ row }">{{ row.rules?.length || row.ruleIds?.length || 0 }}</template>
        </el-table-column>
        <el-table-column v-if="activeTab === 'user'" prop="createdBy" label="创建人" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">查看明细</el-button>
            <el-button v-permission="'template:apply'" link type="primary" @click="openApply(row)">应用模板</el-button>
            <el-button
              v-if="activeTab === 'user'"
              v-permission="'rule:delete'"
              v-confirm-delete="{ onConfirm: () => handleDelete(row) }"
              link
              type="danger"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && !tableData.length" style="padding:40px;text-align:center;color:#909399">
        <el-empty description="暂无模板数据" />
      </div>
    </el-card>

    <TemplateDetailDialog v-model="detailVisible" :template="currentTemplate" />
    <ApplyTemplateDialog v-model="applyVisible" :template="currentTemplate" />
  </PageContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer/index.vue'
import TemplateDetailDialog from './template/components/TemplateDetailDialog.vue'
import ApplyTemplateDialog from './template/components/ApplyTemplateDialog.vue'

const activeTab = ref('system')
const loading = ref(false)
const tableData = ref([])
const detailVisible = ref(false)
const applyVisible = ref(false)
const currentTemplate = ref(null)

async function fetchData() {
  loading.value = true
  try {
    const res = await axios.get('/api/template', { params: { tab: activeTab.value } })
    tableData.value = res.data.data?.records || []
  } finally {
    loading.value = false
  }
}

function openDetail(row) {
  currentTemplate.value = row
  detailVisible.value = true
}

function openApply(row) {
  currentTemplate.value = row
  applyVisible.value = true
}

async function handleDelete(row) {
  try {
    await axios.delete(`/api/template/${row.id}`)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    ElMessage.error('删除失败')
  }
}

onMounted(fetchData)
</script>
