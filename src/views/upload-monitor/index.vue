<template>
  <PageContainer title="数据上传监控">
    <!-- 筛选区 -->
    <el-card class="filter-card" shadow="never" ref="filterCardRef">
      <el-form ref="filterFormRef" :model="query" inline class="filter-form">
        <el-form-item label="业务时间" required>
          <el-date-picker
            v-model="query.yearMonth"
            type="month"
            value-format="YYYY-MM"
            placeholder="选择月份"
            :clearable="false"
            style="width:160px"
          />
        </el-form-item>

        <el-form-item v-if="!isOrgUser" label="区县">
          <el-select
            v-model="query.districtCode"
            placeholder="全部"
            clearable
            style="width:160px"
            @change="onDistrictChange"
          >
            <el-option
              v-for="d in districtOptions"
              :key="d.districtCode"
              :label="d.districtName"
              :value="d.districtCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="信息系统类型">
          <el-select
            v-model="query.systemType"
            placeholder="全部"
            clearable
            style="width:160px"
          >
            <el-option
              v-for="t in systemTypeOptions"
              :key="t.value"
              :label="t.label"
              :value="t.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="机构名称">
          <el-select
            v-model="query.orgCode"
            placeholder="全部"
            clearable
            filterable
            :disabled="isOrgUser"
            style="width:200px"
          >
            <el-option
              v-for="o in filteredOrgOptions"
              :key="o.orgCode"
              :label="o.orgName"
              :value="o.orgCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :icon="Search"
            :loading="loading"
            @click="handleSearch"
          >搜索</el-button>
          <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
          <el-button
            v-permission="'upload:export'"
            type="success"
            :icon="Download"
            :loading="exporting"
            @click="handleExport"
          >导出</el-button>
          <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区 -->
    <el-card class="table-card" shadow="never" :body-style="{ padding: '0' }">
      <div v-if="isEmpty()" class="empty-wrap">
        <el-empty description="所选月份暂无上传记录" />
      </div>

      <el-table
        v-else
        v-loading="loading"
        :data="displayRows"
        :height="tableHeight"
        border
        stripe
        :row-class-name="rowClassName"
        :header-cell-class-name="headerCellClass"
        :cell-class-name="cellClassName"
        size="default"
      >
        <el-table-column
          prop="datasetName"
          label="表名"
          width="200"
          fixed="left"
          sortable
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span :class="{ 'total-cell': row._isTotal }">{{ row.datasetName }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="datasetCode"
          label="表描述"
          width="200"
          fixed="left"
          sortable
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span :class="{ 'total-cell': row._isTotal }">{{ row.datasetCode }}</span>
          </template>
        </el-table-column>

        <el-table-column
          v-for="day in dayColumns"
          :key="day.key"
          :label="`${day.day}日`"
          :prop="day.key"
          :width="80"
          align="right"
          sortable
          :sort-method="(a, b) => (a[day.key] || 0) - (b[day.key] || 0)"
        >
          <template #default="{ row }">
            <span :class="{ 'total-cell': row._isTotal }">
              {{ formatCell(row[day.key]) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="monthTotal"
          label="月累计上传量"
          width="120"
          fixed="right"
          align="right"
          sortable
        >
          <template #default="{ row }">
            <span :class="{ 'total-cell': row._isTotal }">
              {{ formatCell(row.monthTotal) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, RefreshLeft, Download, Refresh } from '@element-plus/icons-vue'
import axios from 'axios'
import { useAuthStore } from '@/store/auth'
import { useTableState } from '@/composables/useTableState'
import { useExportLoading } from '@/components/ExportLoading/useExportLoading'
import { downloadFile } from '@/utils/download'
import { formatNumber } from '@/utils/format'
import { formatDateTime } from '@/utils/format'
import { getUploadDaily, exportUploadDaily } from '@/api/upload'

const authStore = useAuthStore()
const isOrgUser = computed(() => authStore.dataScope === 3)

// ---- 默认当前月 ----
function currentYearMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const query = ref({
  yearMonth: currentYearMonth(),
  districtCode: null,
  systemType: null,
  orgCode: isOrgUser.value ? authStore.orgCode : null,
})

// ---- 区县 / 机构 / 系统类型 选项 ----
const orgList = ref([])
const districtOptions = computed(() => {
  const seen = new Map()
  for (const o of orgList.value) {
    if (!seen.has(o.districtCode)) {
      seen.set(o.districtCode, { districtCode: o.districtCode, districtName: o.districtName })
    }
  }
  return Array.from(seen.values())
})
const filteredOrgOptions = computed(() => {
  if (!query.value.districtCode) return orgList.value
  return orgList.value.filter(o => o.districtCode === query.value.districtCode)
})
// 信息系统类型字典（暂内置，后续可接字典接口）
const systemTypeOptions = ref([
  { value: 'HIS', label: 'HIS 医院信息系统' },
  { value: 'EMR', label: 'EMR 电子病历' },
  { value: 'LIS', label: 'LIS 检验信息系统' },
  { value: 'PACS', label: 'PACS 影像系统' },
  { value: 'CIS', label: 'CIS 临床信息系统' },
])

async function fetchOrgs() {
  try {
    const { data } = await axios.get('/api/system/org', { params: { page: 1, size: 200 } })
    orgList.value = data?.data?.records || []
  } catch (e) {
    orgList.value = []
  }
}

function onDistrictChange() {
  // 区县变化时，若已选机构不在该区县内则清空
  if (query.value.orgCode && query.value.districtCode) {
    const exists = filteredOrgOptions.value.some(o => o.orgCode === query.value.orgCode)
    if (!exists) query.value.orgCode = null
  }
}

// ---- 数据加载 ----
const { state, isEmpty, isLoading } = useTableState()
const loading = computed(() => isLoading() || state.value === 'init')
const datasets = ref([])

// 动态列：根据 yearMonth 生成
const dayColumns = computed(() => {
  const ym = query.value.yearMonth || currentYearMonth()
  const [y, m] = ym.split('-').map(Number)
  const days = new Date(y, m, 0).getDate()
  const cols = []
  for (let d = 1; d <= days; d++) {
    const dateKey = `${ym}-${String(d).padStart(2, '0')}`
    cols.push({ day: d, key: dateKey })
  }
  return cols
})

// 平铺为单元格可用形态：把 dailyCounts[yyyy-mm-dd] 提到 row[dateKey]
const tableRows = computed(() => {
  return datasets.value.map(ds => {
    const row = {
      datasetCode: ds.datasetCode,
      datasetName: ds.datasetName,
      monthTotal: ds.monthTotal ?? 0,
    }
    const counts = ds.dailyCounts || {}
    for (const col of dayColumns.value) {
      row[col.key] = counts[col.key] ?? 0
    }
    return row
  })
})

// 合计行：对每天 / monthTotal 求和
const totalRow = computed(() => {
  if (tableRows.value.length === 0) return null
  const row = {
    datasetCode: '',
    datasetName: '合计',
    _isTotal: true,
    monthTotal: 0,
  }
  for (const col of dayColumns.value) {
    let s = 0
    for (const r of tableRows.value) s += Number(r[col.key]) || 0
    row[col.key] = s
  }
  row.monthTotal = tableRows.value.reduce((acc, r) => acc + (Number(r.monthTotal) || 0), 0)
  return row
})

const displayRows = computed(() => {
  return totalRow.value ? [...tableRows.value, totalRow.value] : tableRows.value
})

async function fetchData() {
  state.value = 'loading'
  try {
    const params = buildParams()
    const data = await getUploadDaily(params)
    const list = Array.isArray(data?.datasets) ? data.datasets : (Array.isArray(data) ? data : [])
    datasets.value = list
    state.value = list.length > 0 ? 'success' : 'empty'
  } catch (err) {
    datasets.value = []
    state.value = 'error'
    ElMessage.error(err?.message || '加载数据失败')
  }
}

function buildParams() {
  const p = { yearMonth: query.value.yearMonth }
  if (query.value.districtCode) p.districtCode = query.value.districtCode
  if (query.value.systemType) p.systemType = query.value.systemType
  if (query.value.orgCode) p.orgCode = query.value.orgCode
  return p
}

function handleSearch() {
  if (!query.value.yearMonth) {
    ElMessage.warning('请选择业务时间')
    return
  }
  fetchData()
}

function handleReset() {
  query.value = {
    yearMonth: currentYearMonth(),
    districtCode: null,
    systemType: null,
    orgCode: isOrgUser.value ? authStore.orgCode : null,
  }
  fetchData()
}

function handleRefresh() {
  fetchData()
}

// ---- 单元格格式化 ----
function formatCell(v) {
  if (v === null || v === undefined || Number(v) === 0) return '-'
  return formatNumber(v)
}

function rowClassName({ row }) {
  return row._isTotal ? 'upload-total-row' : ''
}
function cellClassName({ row }) {
  return row._isTotal ? 'upload-total-cell' : ''
}
function headerCellClass() {
  return 'upload-header-cell'
}

// ---- 导出 ----
const exporting = ref(false)
const exportLoading = useExportLoading()

async function handleExport() {
  if (!query.value.yearMonth) {
    ElMessage.warning('请选择业务时间')
    return
  }
  exporting.value = true
  exportLoading.show()
  try {
    const response = await exportUploadDaily(buildParams())
    const ym = query.value.yearMonth
    const [y, m] = ym.split('-')
    const stamp = formatDateTime(new Date(), 'YYYYMMDDHHmmss')
    const fallback = `数据上传监控_${y}年${m}月_${stamp}.xlsx`
    downloadFile(response, fallback)
    ElMessage.success('导出成功')
  } catch (err) {
    ElMessage.error(err?.message || '导出失败')
  } finally {
    exportLoading.hide()
    exporting.value = false
  }
}

// ---- 动态表格高度 ----
const tableHeight = ref(500)
const filterCardRef = ref(null)

function recalcHeight() {
  nextTick(() => {
    const el = filterCardRef.value?.$el || filterCardRef.value
    const filterH = el?.offsetHeight || 80
    // PageContainer 顶部高度（面包屑 + 标题）+ 内边距估算
    const reserved = filterH + 180
    const h = window.innerHeight - reserved
    tableHeight.value = Math.max(360, h)
  })
}

onMounted(async () => {
  await fetchOrgs()
  await fetchData()
  recalcHeight()
  window.addEventListener('resize', recalcHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', recalcHeight)
})

watch(() => query.value.yearMonth, () => {
  // 月份变化时重新计算高度（动态列数量变化影响不大，仍保持响应）
  recalcHeight()
})
</script>

<style scoped>
.filter-card {
  margin-bottom: 12px;
}
.filter-card :deep(.el-card__body) {
  padding: 16px 20px 4px;
}
.filter-form :deep(.el-form-item) {
  margin-right: 16px;
  margin-bottom: 12px;
}

.table-card {
  border-radius: 4px;
}

.empty-wrap {
  padding: 60px 0;
}

/* 合计行样式 —— 使用 :deep 以穿透 el-table 内置类 */
.table-card :deep(.upload-total-row) {
  background-color: #f0f2f5 !important;
}
.table-card :deep(.upload-total-row td) {
  background-color: #f0f2f5 !important;
  font-weight: 600;
}
.table-card :deep(.total-cell) {
  font-weight: 600;
}

.table-card :deep(.upload-header-cell) {
  background-color: #fafafa;
  color: #303133;
  font-weight: 600;
}
</style>
