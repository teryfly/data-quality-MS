<template>
  <PageContainer title="通知消息">
    <template #actions>
      <el-button
        type="primary"
        :disabled="totalUnread === 0"
        @click="handleMarkAllRead"
      >全部标为已读</el-button>
    </template>

    <!-- 筛选栏 -->
    <SearchForm :model="query" @search="handleSearch" @reset="handleReset">
      <el-form-item label="通知类型">
        <el-select v-model="query.type" placeholder="全部类型" clearable style="width: 160px">
          <el-option
            v-for="t in typeOptions"
            :key="t.value"
            :label="t.label"
            :value="t.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="已读状态">
        <el-select v-model="query.isRead" placeholder="全部" clearable style="width: 120px">
          <el-option label="未读" :value="0" />
          <el-option label="已读" :value="1" />
        </el-select>
      </el-form-item>
    </SearchForm>

    <!-- 表格 -->
    <DataTable
      :data="tableData"
      :columns="columns"
      :total="total"
      :page="query.page"
      :page-size="query.size"
      :loading="loading"
      empty-text="暂无通知消息"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <!-- 类型圆点 -->
      <template #type="{ row }">
        <div class="type-cell">
          <span class="type-dot" :style="{ background: getTypeColor(row.type) }" />
          <span>{{ getTypeLabel(row.type) }}</span>
        </div>
      </template>

      <!-- 标题 + 内容 -->
      <template #title="{ row }">
        <div class="title-cell" :class="{ 'is-unread': row.isRead === 0 }">
          <div class="noti-title">{{ row.title }}</div>
          <div class="noti-content-text">{{ row.content }}</div>
        </div>
      </template>

      <!-- 已读状态 -->
      <template #isRead="{ row }">
        <el-tag :type="row.isRead === 0 ? 'danger' : 'info'" size="small" effect="plain">
          {{ row.isRead === 0 ? '未读' : '已读' }}
        </el-tag>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <el-button
          v-if="row.isRead === 0"
          type="primary"
          link
          size="small"
          @click="handleMarkRead(row)"
        >标为已读</el-button>
        <el-button
          v-if="getTargetRoute(row)"
          type="primary"
          link
          size="small"
          @click="handleNavigate(row)"
        >查看详情</el-button>
      </template>
    </DataTable>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { useNotificationStore } from '@/store/notification'

const router = useRouter()
const notificationStore = useNotificationStore()

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const totalUnread = computed(() => tableData.value.filter(n => n.isRead === 0).length)

const query = reactive({
  page: 1,
  size: 20,
  type: '',
  isRead: null,
})

// ── 通知类型选项 ────────────────────────────────────────────────────────────
const typeOptions = [
  { value: 'recheck_pass',         label: '整改复检通过' },
  { value: 'recheck_fail',         label: '整改复检不通过' },
  { value: 'execute_done',         label: '质控执行完成' },
  { value: 'execute_partial_fail', label: '执行部分失败' },
  { value: 'sync_done',            label: '代码库同步完成' },
  { value: 'sync_fail',            label: '代码库同步失败' },
  { value: 'report_ready',         label: '月度报告已生成' },
]

const TYPE_LABEL_MAP = Object.fromEntries(typeOptions.map(t => [t.value, t.label]))

const TYPE_COLOR_MAP = {
  recheck_pass:          '#52c41a',
  recheck_fail:          '#ff4d4f',
  execute_done:          '#1890ff',
  execute_partial_fail:  '#faad14',
  sync_done:             '#52c41a',
  sync_fail:             '#ff4d4f',
  report_ready:          '#1890ff',
}

const getTypeColor = (type) => TYPE_COLOR_MAP[type] ?? '#909399'
const getTypeLabel = (type) => TYPE_LABEL_MAP[type] ?? type

const getTargetRoute = (item) => {
  switch (item.type) {
    case 'recheck_pass':
    case 'recheck_fail':
      return '/result/detail'
    case 'execute_done':
    case 'execute_partial_fail':
      return '/rule/execute'
    case 'sync_done':
      return '/datasource/codeset-calibration'
    case 'sync_fail':
      return '/datasource'
    case 'report_ready':
      return '/report'
    default:
      return null
  }
}

// ── 表格列定义 ──────────────────────────────────────────────────────────────
const columns = [
  { field: 'type',       label: '类型',   width: 140, slot: 'type' },
  { field: 'title',      label: '通知内容', minWidth: 280, slot: 'title' },
  { field: 'createTime', label: '时间',   width: 180 },
  { field: 'isRead',     label: '状态',   width: 80, align: 'center', slot: 'isRead' },
  { field: 'actions',    label: '操作',   width: 140, align: 'center', slot: 'actions', fixed: 'right' },
]

// ── 数据加载 ────────────────────────────────────────────────────────────────
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: query.page,
      size: query.size,
    }
    if (query.type) params.type = query.type
    if (query.isRead !== null && query.isRead !== '') params.isRead = query.isRead

    const data = await request.get('/api/notification/all', { params })
    tableData.value = data.records ?? []
    total.value = data.total ?? 0
  } catch {
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  query.page = 1
  fetchData()
}

const handleReset = () => {
  query.type = ''
  query.isRead = null
  query.page = 1
  fetchData()
}

const handlePageChange = (page) => {
  query.page = page
  fetchData()
}

const handleSizeChange = (size) => {
  query.size = size
  query.page = 1
  fetchData()
}

// ── 操作 ────────────────────────────────────────────────────────────────────
const handleMarkRead = async (row) => {
  await notificationStore.markRead(row.id)
  row.isRead = 1
  ElMessage.success('已标为已读')
}

const handleMarkAllRead = async () => {
  await notificationStore.markAllRead()
  tableData.value.forEach(n => { n.isRead = 1 })
  ElMessage.success('已全部标为已读')
}

const handleNavigate = (row) => {
  if (row.isRead === 0) notificationStore.markRead(row.id)
  const route = getTargetRoute(row)
  if (route) router.push(route)
}

onMounted(fetchData)
</script>

<style scoped>
.type-cell {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
}

.type-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.title-cell {
  padding: 2px 0;
}

.title-cell.is-unread .noti-title {
  font-weight: 600;
}

.noti-title {
  font-size: 13px;
  color: var(--el-text-color-primary, #303133);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.noti-content-text {
  font-size: 12px;
  color: var(--el-text-color-secondary, #606266);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
