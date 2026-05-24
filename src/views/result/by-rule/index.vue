<template>
  <PageContainer title="按规则统计">
    <template #actions>
      <el-button
        v-permission="'result:export'"
        type="success"
        :icon="Download"
        :loading="exporting"
        @click="handleExport"
      >导出</el-button>
    </template>

    <SearchForm :loading="loading" @search="handleSearch" @reset="handleReset">
      <el-form-item label="数据集">
        <el-select
          v-model="query.datasetId"
          placeholder="全部"
          clearable
          filterable
          style="width: 200px"
        >
          <el-option
            v-for="d in datasetOptions"
            :key="d.id"
            :label="d.datasetName"
            :value="d.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="规则分类">
        <el-select
          v-model="query.categoryId"
          placeholder="全部"
          clearable
          style="width: 180px"
          @change="onCategoryChange"
        >
          <el-option
            v-for="c in categoryOptions"
            :key="c.id"
            :label="c.categoryName"
            :value="c.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="规则名称">
        <el-select
          v-model="query.ruleId"
          placeholder="全部"
          clearable
          filterable
          style="width: 220px"
        >
          <el-option
            v-for="r in filteredRules"
            :key="r.id"
            :label="r.ruleName"
            :value="r.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="日期范围">
        <el-date-picker
          v-model="query.dateRange"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 280px"
        />
      </el-form-item>

      <el-form-item label="规则级别">
        <el-select
          v-model="query.ruleLevels"
          placeholder="全部"
          clearable
          multiple
          collapse-tags
          style="width: 200px"
        >
          <el-option label="严重" :value="1" />
          <el-option label="警告" :value="2" />
          <el-option label="提示" :value="3" />
        </el-select>
      </el-form-item>
    </SearchForm>

    <el-card shadow="never" :body-style="{ padding: '12px 16px' }">
      <DataTable
        :data="tableData"
        :columns="columns"
        :loading="loading"
        :is-init="state === 'init'"
        :total="total"
        v-model:page="page"
        v-model:page-size="pageSize"
        :span-method="spanMethod"
        @page-change="loadData"
        @size-change="loadData"
        @retry="loadData"
      >
        <template #ruleLevel="{ row }">
          <StatusTag :type="row.ruleLevel" />
        </template>

        <template #checkTotal="{ row }">
          {{ formatNumber(row.checkTotal) }}
        </template>

        <template #problemCount="{ row }">
          <el-button link type="primary" @click="drillToDetail(row)">
            {{ formatNumber(row.problemCount) }}
          </el-button>
        </template>

        <template #problemRatio="{ row }">
          <div class="ratio-cell">
            <el-progress
              :percentage="Math.min(row.problemRatio, 100)"
              :show-text="false"
              :stroke-width="8"
              :color="getRatioColor(row.problemRatio)"
              style="flex: 1; min-width: 60px"
            />
            <span class="ratio-text">{{ row.problemRatio.toFixed(2) }}%</span>
          </div>
        </template>

        <template #fixedCount="{ row }">
          {{ formatNumber(row.fixedCount) }}
        </template>

        <template #fixedRatio="{ row }">
          <div class="ratio-cell">
            <el-progress
              :percentage="Math.min(row.fixedRatio, 100)"
              :show-text="false"
              :stroke-width="8"
              :color="getFixedColor(row.fixedRatio)"
              style="flex: 1; min-width: 60px"
            />
            <span class="ratio-text">{{ row.fixedRatio.toFixed(2) }}%</span>
          </div>
        </template>
      </DataTable>
    </el-card>

    <ExportLoading ref="exportLoadingRef" />
  </PageContainer>
</template>

<script setup>
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useTableState } from '@/composables/useTableState'
import { formatNumber } from '@/utils/format'
import { downloadFile } from '@/utils/download'
import { getResultByRule, exportResultByRule } from '@/api/result'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()

const exportLoadingRef = ref(null)
const exporting = ref(false)

const query = ref({
  datasetId: null,
  categoryId: null,
  ruleId: null,
  dateRange: null,
  ruleLevels: [],
})

// ── Options ────────────────────────────────────────────────────────
const datasetOptions = ref([])
const categoryOptions = ref([])
const ruleOptions = ref([])

const filteredRules = computed(() => {
  if (!query.value.categoryId) return ruleOptions.value
  return ruleOptions.value.filter(r => r.categoryId === query.value.categoryId)
})

function onCategoryChange() {
  // Reset rule if outside selected category
  if (query.value.ruleId && query.value.categoryId) {
    const r = ruleOptions.value.find(x => x.id === query.value.ruleId)
    if (!r || r.categoryId !== query.value.categoryId) {
      query.value.ruleId = null
    }
  }
}

async function loadOptions() {
  try {
    const [dsRes, catRes, rulesRes] = await Promise.all([
      request.get('/api/dataset', { params: { page: 1, size: 200 } }),
      request.get('/api/rule/category'),
      request.get('/api/rule', { params: { page: 1, size: 500 } }),
    ])
    datasetOptions.value = dsRes?.records || []
    categoryOptions.value = catRes || []
    ruleOptions.value = rulesRes?.records || []
  } catch {
    // ignore option loading errors
  }
}

// ── Table state ────────────────────────────────────────────────────
const { state, tableData, total, page, pageSize, fetchData } = useTableState()
const loading = computed(() => state.value === 'loading')

const columns = [
  { field: 'ruleCategoryName', label: '规则分类', width: 120 },
  { field: 'ruleName', label: '规则名称', minWidth: 200 },
  { field: 'ruleLevel', label: '规则级别', width: 100, align: 'center', slot: 'ruleLevel' },
  { field: 'checkTotal', label: '校验总数', width: 110, align: 'right', slot: 'checkTotal' },
  { field: 'problemCount', label: '问题数', width: 100, align: 'right', slot: 'problemCount' },
  { field: 'problemRatio', label: '问题数占比', width: 180, slot: 'problemRatio' },
  { field: 'fixedCount', label: '整改数', width: 100, align: 'right', slot: 'fixedCount' },
  { field: 'fixedRatio', label: '整改率', width: 180, slot: 'fixedRatio' },
]

async function loadData() {
  await fetchData(getResultByRule, {
    page: page.value,
    size: pageSize.value,
    datasetId: query.value.datasetId,
    categoryId: query.value.categoryId,
    ruleId: query.value.ruleId,
    startDate: query.value.dateRange?.[0],
    endDate: query.value.dateRange?.[1],
    ruleLevels: query.value.ruleLevels?.length ? query.value.ruleLevels.join(',') : undefined,
  })
}

function handleSearch() {
  page.value = 1
  loadData()
}

function handleReset() {
  query.value = {
    datasetId: null,
    categoryId: null,
    ruleId: null,
    dateRange: null,
    ruleLevels: [],
  }
  page.value = 1
  loadData()
}

// ── Merge category cells (span-method) ─────────────────────────────
const categoryGroups = computed(() => {
  // For current page, group consecutive rows with the same category
  const groups = []
  let lastCat = null
  let count = 0
  tableData.value.forEach((row) => {
    if (row.ruleCategoryName === lastCat) {
      count += 1
      groups[groups.length - 1][1] = count
    } else {
      groups.push([1, 1])
      lastCat = row.ruleCategoryName
      count = 1
    }
  })
  return groups
})

function spanMethod({ row, column, rowIndex, columnIndex }) {
  if (columnIndex !== 0) return undefined
  // Find first occurrence of this category in this page
  let firstIdx = rowIndex
  for (let i = rowIndex - 1; i >= 0; i--) {
    if (tableData.value[i].ruleCategoryName === row.ruleCategoryName) firstIdx = i
    else break
  }
  if (firstIdx !== rowIndex) {
    return { rowspan: 0, colspan: 0 }
  }
  let span = 1
  for (let i = rowIndex + 1; i < tableData.value.length; i++) {
    if (tableData.value[i].ruleCategoryName === row.ruleCategoryName) span += 1
    else break
  }
  return { rowspan: span, colspan: 1 }
}

// ── Drill-down navigation ──────────────────────────────────────────
function drillToDetail(row) {
  const statMonth = query.value.dateRange?.[0]
    ? query.value.dateRange[0].slice(0, 7)
    : undefined
  router.push({
    path: '/result/detail',
    query: {
      ruleId: row.ruleId,
      datasetId: query.value.datasetId || undefined,
      statMonth,
    },
  })
}

// ── Progress bar colors ────────────────────────────────────────────
function getRatioColor(v) {
  if (v >= 5) return '#ff4d4f'
  if (v >= 2) return '#faad14'
  return '#52c41a'
}

function getFixedColor(v) {
  if (v >= 80) return '#52c41a'
  if (v >= 50) return '#faad14'
  return '#ff4d4f'
}

// ── Export ─────────────────────────────────────────────────────────
async function handleExport() {
  exporting.value = true
  exportLoadingRef.value?.show()
  try {
    const response = await exportResultByRule({
      datasetId: query.value.datasetId,
      categoryId: query.value.categoryId,
      ruleId: query.value.ruleId,
      startDate: query.value.dateRange?.[0],
      endDate: query.value.dateRange?.[1],
      ruleLevels: query.value.ruleLevels?.length ? query.value.ruleLevels.join(',') : undefined,
    })
    downloadFile(response, '按规则统计.xlsx')
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
    exportLoadingRef.value?.hide()
  }
}

// ── Init: handle category drill-down from overview ─────────────────
onMounted(async () => {
  await loadOptions()
  if (route.query.categoryName) {
    const cat = categoryOptions.value.find(c => c.categoryName === route.query.categoryName)
    if (cat) query.value.categoryId = cat.id
  }
  await loadData()
})
</script>

<style scoped>
.ratio-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ratio-text {
  font-size: 12px;
  color: var(--color-text-secondary, #606266);
  font-variant-numeric: tabular-nums;
  min-width: 56px;
  text-align: right;
}
</style>
