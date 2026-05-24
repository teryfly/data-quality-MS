<template>
  <PageContainer title="数据源管理">
    <!-- 业务中心库 -->
    <el-card class="section-card" :body-style="{ padding: '20px' }">
      <template #header>
        <div class="card-header">
          <div class="card-header-left">
            <el-tag type="primary" size="large" class="section-tag">业务中心库</el-tag>
            <span class="section-desc">业务系统数据来源配置</span>
          </div>
          <el-button
            v-permission="'datasource:add'"
            type="primary"
            :icon="Plus"
            @click="openAddDialog('business')"
          >
            新增数据源
          </el-button>
        </div>
      </template>

      <div v-if="businessLoading" class="source-list">
        <el-skeleton v-for="i in 1" :key="i" :rows="4" animated class="source-skeleton" />
      </div>
      <div v-else-if="businessSources.length > 0" class="source-list">
        <DatasourceCard
          v-for="source in businessSources"
          :key="source.id"
          :source="source"
          @test="handleTest"
          @edit="handleEdit"
          @delete="handleDelete"
          @sync="handleSync"
        />
      </div>
      <el-empty
        v-else
        description="尚未配置数据源，请先添加业务中心库"
        :image-size="100"
      >
        <el-button
          v-permission="'datasource:add'"
          type="primary"
          @click="openAddDialog('business')"
        >
          立即添加
        </el-button>
      </el-empty>
    </el-card>

    <!-- 值域代码库 -->
    <el-card class="section-card" :body-style="{ padding: '20px' }">
      <template #header>
        <div class="card-header">
          <div class="card-header-left">
            <el-tag type="success" size="large" class="section-tag">值域代码库</el-tag>
            <span class="section-desc">代码值域标准数据来源配置</span>
          </div>
          <el-button
            v-permission="'datasource:add'"
            type="primary"
            :icon="Plus"
            @click="openAddDialog('code')"
          >
            新增数据源
          </el-button>
        </div>
      </template>

      <div v-if="codeLoading" class="source-list">
        <el-skeleton v-for="i in 1" :key="i" :rows="4" animated class="source-skeleton" />
      </div>
      <div v-else-if="codeSources.length > 0" class="source-list">
        <DatasourceCard
          v-for="source in codeSources"
          :key="source.id"
          :source="source"
          @test="handleTest"
          @edit="handleEdit"
          @delete="handleDelete"
          @sync="handleSync"
        />
      </div>
      <el-empty
        v-else
        description="尚未配置数据源，请先添加值域代码库"
        :image-size="100"
      >
        <el-button
          v-permission="'datasource:add'"
          type="primary"
          @click="openAddDialog('code')"
        >
          立即添加
        </el-button>
      </el-empty>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <DatasourceFormDialog
      v-model="formDialogVisible"
      :init-type="initType"
      :edit-data="editData"
      @saved="onSaved"
      @sync-now="handleSyncNow"
    />

    <!-- 同步进度弹窗 -->
    <SyncProgressDialog
      v-model="syncDialogVisible"
      :datasource-id="syncDatasourceId"
    />
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import DatasourceFormDialog from './components/DatasourceFormDialog.vue'
import SyncProgressDialog from './components/SyncProgressDialog.vue'
import DatasourceCard from './components/DatasourceCard.vue'

const allSources = ref([])
const loading = ref(false)
const businessLoading = ref(false)
const codeLoading = ref(false)

const formDialogVisible = ref(false)
const initType = ref('business')
const editData = ref(null)
const syncDialogVisible = ref(false)
const syncDatasourceId = ref(null)

const businessSources = computed(() => allSources.value.filter(s => s.sourceType === 'business'))
const codeSources = computed(() => allSources.value.filter(s => s.sourceType === 'code'))

async function fetchSources() {
  loading.value = true
  businessLoading.value = true
  codeLoading.value = true
  try {
    const res = await axios.get('/api/datasource')
    allSources.value = res.data?.data?.records || []
  } catch {
    ElMessage.error('获取数据源列表失败')
  } finally {
    loading.value = false
    businessLoading.value = false
    codeLoading.value = false
  }
}

function openAddDialog(type) {
  initType.value = type
  editData.value = null
  formDialogVisible.value = true
}

function handleEdit(source) {
  editData.value = source
  initType.value = source.sourceType
  formDialogVisible.value = true
}

async function handleDelete(source) {
  try {
    await axios.delete(`/api/datasource/${source.id}`)
    ElMessage.success('删除成功')
    fetchSources()
  } catch {
    ElMessage.error('删除失败')
  }
}

async function handleTest(source) {
  const idx = allSources.value.findIndex(s => s.id === source.id)
  try {
    const res = await axios.post(`/api/datasource/${source.id}/test`)
    if (res.data?.data?.connected) {
      ElMessage.success('连接成功')
      if (idx >= 0) allSources.value[idx].connectStatus = 1
    } else {
      ElMessage.error(res.data?.message || '连接失败')
      if (idx >= 0) allSources.value[idx].connectStatus = 0
    }
  } catch {
    ElMessage.error('测试连接失败')
    if (idx >= 0) allSources.value[idx].connectStatus = 0
  }
}

function handleSync(source) {
  ElMessageBox.confirm(
    '将立即同步值域代码库，可能耗时数分钟，是否继续？',
    '确认同步',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    triggerSync(source.id)
  }).catch(() => {})
}

async function triggerSync(id) {
  try {
    await axios.post(`/api/datasource/${id}/sync`)
    syncDatasourceId.value = id
    syncDialogVisible.value = true
  } catch {
    ElMessage.error('触发同步失败')
  }
}

function onSaved() {
  fetchSources()
}

function handleSyncNow(id) {
  triggerSync(id)
}

onMounted(fetchSources)
</script>

<style scoped>
.section-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-tag {
  font-size: 14px;
  padding: 0 12px;
  height: 28px;
}

.section-desc {
  font-size: 13px;
  color: #909399;
}

.source-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.source-skeleton {
  width: 320px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}
</style>
