<template>
  <PageContainer title="问题明细">
    <template #actions>
      <el-button
        v-permission="'result:fix'"
        type="primary"
        :disabled="selectedIds.length === 0"
        :icon="EditPen"
        @click="openBatchFix"
      >批量整改{{ selectedIds.length ? `（${selectedIds.length}）` : '' }}</el-button>
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

      <el-form-item label="规则名称">
        <el-select
          v-model="query.ruleId"
          placeholder="全部"
          clearable
          filterable
          style="width: 220px"
        >
          <el-option
            v-for="r in ruleOptions"
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

      <el-form-item label="整改状态">
        <el-select
          v-model="query.isFixed"
          placeholder="全部"
          clearable
          style="width: 160px"
        >
          <el-option label="未整改" :value="0" />
          <el-option label="整改中" :value="1" />
          <el-option label="已整改" :value="2" />
          <el-option label="无需整改" :value="3" />
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
        row-key="id"
        @page-change="loadData"
        @size-change="loadData"
        @retry="loadData"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="44" :selectable="() => true" />

        <template #problemValue="{ row }">
          <el-tooltip
            v-if="row.problemValue && String(row.problemValue).length > 20"
            :content="String(row.problemValue)"
            placement="top"
          >
            <span class="ellipsis-cell">{{ row.problemValue }}</span>
          </el-tooltip>
          <span v-else class="ellipsis-cell">{{ row.problemValue || '（空值）' }}</span>
        </template>

        <template #businessId="{ row }">
          <el-button link type="primary" @click="openBusinessData(row)">
            {{ row.businessId }}
          </el-button>
        </template>

        <template #createTime="{ row }">
          {{ formatDateTime(row.createTime) }}
        </template>

        <template #isFixed="{ row }">
          <StatusTag :type="fixedStatusTagType(row.isFixed)" />
        </template>

        <template #fixedTime="{ row }">
          {{ row.isFixed === 0 ? '-' : formatDateTime(row.fixedTime) }}
        </template>

        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permission="'result:fix'"
              link
              type="primary"
              @click="openFix(row)"
            >标记整改</el-button>
            <el-button
              v-if="row.isFixed === 1 || row.isFixed === 2"
              link
              type="primary"
              @click="openHistory(row)"
            >整改历史</el-button>
          </template>
        </el-table-column>
      </DataTable>
    </el-card>

    <FixDialog
      v-model="fixDialogVisible"
      :detail="fixDialogDetail"
      :ids="fixDialogIds"
      @success="onFixSuccess"
    />
    <BusinessDataDialog
      v-model="businessDialogVisible"
      :detail="activeDetail"
    />
    <FixHistoryDrawer
      v-model="historyDrawerVisible"
      :detail="activeDetail"
    />
  </PageContainer>
</template>

<script setup>
import { EditPen } from '@element-plus/icons-vue'
import { useTableState } from '@/composables/useTableState'
import { formatDateTime } from '@/utils/format'
import { getResultDetail } from '@/api/result'
import request from '@/utils/request'
import FixDialog from './components/FixDialog.vue'
import BusinessDataDialog from './components/BusinessDataDialog.vue'
import FixHistoryDrawer from './components/FixHistoryDrawer.vue'

const route = useRoute()

const query = ref({
  datasetId: null,
  ruleId: null,
  dateRange: null,
  isFixed: null,
})

// ── Options ────────────────────────────────────────────────────────
const datasetOptions = ref([])
const ruleOptions = ref([])

async function loadOptions() {
  try {
    const [dsRes, rulesRes] = await Promise.all([
      request.get('/api/dataset', { params: { page: 1, size: 200 } }),
      request.get('/api/rule', { params: { page: 1, size: 500 } }),
    ])
    datasetOptions.value = dsRes?.records || []
    ruleOptions.value = rulesRes?.records || []
  } catch {
    // ignore
  }
}

// ── Table state ────────────────────────────────────────────────────
const { state, tableData, total, page, pageSize, fetchData } = useTableState()
const loading = computed(() => state.value === 'loading')

const columns = [
  { field: 'ruleCategoryName', label: '规则分类', width: 110 },
  { field: 'ruleName', label: '规则名称', minWidth: 160 },
  { field: 'datasetName', label: '数据集名称', width: 140 },
  { field: 'elementName', label: '字段名称', width: 120 },
  { field: 'problemValue', label: '问题字段值', minWidth: 140, slot: 'problemValue' },
  { field: 'problemDesc', label: '问题描述', minWidth: 200 },
  { field: 'businessId', label: '业务数据ID', width: 150, slot: 'businessId' },
  { field: 'createTime', label: '创建时间', width: 170, slot: 'createTime' },
  { field: 'isFixed', label: '整改状态', width: 100, align: 'center', slot: 'isFixed' },
  { field: 'fixedTime', label: '整改时间', width: 170, slot: 'fixedTime' },
]

function fixedStatusTagType(isFixed) {
  return { 0: 'unfixed', 1: 'fixing', 2: 'fixed', 3: 'unnecessary' }[isFixed] || 'unfixed'
}

async function loadData() {
  await fetchData(getResultDetail, {
    page: page.value,
    size: pageSize.value,
    datasetId: query.value.datasetId,
    ruleId: query.value.ruleId,
    startDate: query.value.dateRange?.[0],
    endDate: query.value.dateRange?.[1],
    isFixed: query.value.isFixed,
  })
}

function handleSearch() {
  page.value = 1
  loadData()
}

function handleReset() {
  query.value = {
    datasetId: null,
    ruleId: null,
    dateRange: null,
    isFixed: null,
  }
  page.value = 1
  loadData()
}

// ── Selection ──────────────────────────────────────────────────────
const selectedRows = ref([])
const selectedIds = computed(() => selectedRows.value.map(r => r.id))

function onSelectionChange(rows) {
  selectedRows.value = rows
}

// ── Dialogs / Drawer ───────────────────────────────────────────────
const fixDialogVisible = ref(false)
const fixDialogDetail = ref(null)
const fixDialogIds = ref(null)

const businessDialogVisible = ref(false)
const historyDrawerVisible = ref(false)
const activeDetail = ref(null)

function openFix(row) {
  fixDialogDetail.value = row
  fixDialogIds.value = null
  fixDialogVisible.value = true
}

function openBatchFix() {
  if (selectedIds.value.length === 0) return
  fixDialogDetail.value = null
  fixDialogIds.value = [...selectedIds.value]
  fixDialogVisible.value = true
}

function openBusinessData(row) {
  activeDetail.value = row
  businessDialogVisible.value = true
}

function openHistory(row) {
  activeDetail.value = row
  historyDrawerVisible.value = true
}

function onFixSuccess() {
  selectedRows.value = []
  loadData()
}

// ── Init: prefill from route query ─────────────────────────────────
function applyRouteQuery() {
  const q = route.query
  if (q.ruleId) query.value.ruleId = Number(q.ruleId)
  if (q.datasetId) query.value.datasetId = Number(q.datasetId)
  if (q.statMonth) {
    const [y, m] = String(q.statMonth).split('-').map(Number)
    if (y && m) {
      const last = new Date(y, m, 0).getDate()
      query.value.dateRange = [
        `${y}-${String(m).padStart(2, '0')}-01`,
        `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`,
      ]
    }
  }
  if (q.isFixed !== undefined && q.isFixed !== '') {
    query.value.isFixed = Number(q.isFixed)
  }
}

onMounted(async () => {
  await loadOptions()
  applyRouteQuery()
  await loadData()
})
</script>

<style scoped>
.ellipsis-cell {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
</style>
