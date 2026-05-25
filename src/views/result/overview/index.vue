<template>
  <PageContainer title="全局统计概览">
    <!-- ── Filter bar ───────────────────────────────────────────────── -->
    <el-card class="filter-card" shadow="never" :body-style="{ padding: '16px 20px' }">
      <el-form inline :model="query">
        <el-form-item v-if="canPickOrg" label="机构">
          <el-select
            v-model="query.orgId"
            placeholder="全部机构"
            clearable
            filterable
            style="width: 220px"
            @change="loadAll"
          >
            <el-option
              v-for="o in orgOptions"
              :key="o.id"
              :label="o.orgName"
              :value="o.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="月份">
          <el-date-picker
            v-model="query.statMonth"
            type="month"
            value-format="YYYY-MM"
            placeholder="选择月份"
            :clearable="false"
            style="width: 160px"
            @change="loadAll"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ── Metric cards ─────────────────────────────────────────────── -->
    <div class="metrics-row">
      <el-card
        v-for="card in metricCards"
        :key="card.key"
        class="metric-card"
        shadow="never"
        :body-style="{ padding: '20px 24px' }"
      >
        <template v-if="summaryLoading">
          <el-skeleton :rows="2" animated />
        </template>
        <template v-else>
          <div class="metric-name">{{ card.name }}</div>
          <div class="metric-value">
            {{ formatValue(card.value, card.unit) }}
            <span v-if="card.unit" class="metric-unit">{{ card.unit }}</span>
          </div>
          <div class="metric-trend">
            <el-icon
              :color="getTrendColor(card.change, card.positiveIsGood)"
              size="14"
            >
              <component :is="getTrendIcon(card.change)" />
            </el-icon>
            <span
              class="mom-text"
              :style="{ color: getTrendColor(card.change, card.positiveIsGood) }"
            >
              {{ Math.abs(card.change).toFixed(card.unit === '%' ? 2 : 1) }}{{ card.unit === '%' ? '%' : '%' }}
            </span>
            <span class="mom-label">环比</span>
          </div>
        </template>
      </el-card>
    </div>

    <!-- ── Charts row ───────────────────────────────────────────────── -->
    <div class="charts-row">
      <el-card class="chart-card" shadow="never">
        <template #header>
          <span class="card-title">近6个月问题占比趋势</span>
        </template>
        <div v-if="trendLoading" class="chart-placeholder">
          <el-skeleton :rows="5" animated />
        </div>
        <div v-else ref="trendRef" class="chart-canvas" />
      </el-card>

      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="card-header-row">
            <span class="card-title">按规则分类问题数占比</span>
            <el-button
              v-if="filteredCategoryName"
              link
              type="primary"
              @click="clearCategoryDrill"
            >已筛选：{{ filteredCategoryName }} × 清除</el-button>
          </div>
        </template>
        <div v-if="pieLoading" class="chart-placeholder">
          <el-skeleton :rows="5" animated />
        </div>
        <div v-else ref="pieRef" class="chart-canvas" />
      </el-card>

      <el-card class="chart-card" shadow="never">
        <template #header>
          <span class="card-title">按数据集问题数排名（Top 10）</span>
        </template>
        <div v-if="barLoading" class="chart-placeholder">
          <el-skeleton :rows="5" animated />
        </div>
        <div v-else ref="barRef" class="chart-canvas" />
      </el-card>
    </div>
  </PageContainer>
</template>

<script setup>
import * as echarts from 'echarts'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'
import { useUiStore } from '@/store/ui'
import { formatNumber, formatPercent } from '@/utils/format'
import {
  getResultSummary,
  getIssueRatioTrend,
  getCategoryPie,
  getDatasetRanking,
} from '@/api/result'
import request from '@/utils/request'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const canPickOrg = computed(() => authStore.dataScope === 1)

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const query = ref({
  orgId: canPickOrg.value ? null : authStore.orgId,
  statMonth: currentMonth(),
})

// ── Org options (when allowed) ─────────────────────────────────────
const orgOptions = ref([])
async function loadOrgs() {
  if (!canPickOrg.value) return
  try {
    const res = await request.get('/api/system/org', { params: { page: 1, size: 200 } })
    orgOptions.value = res?.records || []
  } catch {
    orgOptions.value = []
  }
}

// ── Summary cards ───────────────────────────────────────────────────
const summaryLoading = ref(true)
const summary = ref({})

const metricCards = computed(() => [
  {
    key: 'totalCheckCount',
    name: '总校验数据量',
    value: summary.value.totalCheckCount ?? 0,
    change: summary.value.totalCheckCountChange ?? 0,
    unit: '',
    positiveIsGood: true,
  },
  {
    key: 'totalProblemCount',
    name: '问题总数',
    value: summary.value.totalProblemCount ?? 0,
    change: summary.value.totalProblemCountChange ?? 0,
    unit: '',
    positiveIsGood: false,
  },
  {
    key: 'problemRatio',
    name: '问题占比',
    value: summary.value.problemRatio ?? 0,
    change: summary.value.problemRatioChange ?? 0,
    unit: '%',
    positiveIsGood: false,
  },
  {
    key: 'fixedRate',
    name: '整改率',
    value: summary.value.fixedRate ?? 0,
    change: summary.value.fixedRateChange ?? 0,
    unit: '%',
    positiveIsGood: true,
  },
  {
    key: 'monthNewProblem',
    name: '本月新增问题数',
    value: summary.value.monthNewProblem ?? 0,
    change: summary.value.monthNewProblemChange ?? 0,
    unit: '',
    positiveIsGood: false,
  },
])

function formatValue(v, unit) {
  if (unit === '%') return formatPercent(v, 2)
  return formatNumber(v)
}

// Arrow direction strictly reflects numeric direction; color reflects good/bad.
function getTrendIcon(change) {
  return change >= 0 ? ArrowUp : ArrowDown
}
function getTrendColor(change, positiveIsGood) {
  if (change === 0) return '#909399'
  const isUp = change > 0
  const isGood = positiveIsGood ? isUp : !isUp
  return isGood ? '#52c41a' : '#ff4d4f'
}

// ── Charts ─────────────────────────────────────────────────────────
const trendRef = ref(null)
const pieRef = ref(null)
const barRef = ref(null)
let trendChart = null
let pieChart = null
let barChart = null

const trendLoading = ref(true)
const pieLoading = ref(true)
const barLoading = ref(true)

const trendData = ref({ months: [], data: [] })
const pieData = ref([])
const barData = ref([])

const filteredCategoryName = ref('')

function renderTrend() {
  if (!trendRef.value) return
  if (!trendChart) {
    trendChart = echarts.init(trendRef.value, null, { renderer: 'canvas' })
  }
  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0]
        return `${p.axisValue}<br/>问题占比：${p.data}%`
      },
    },
    grid: { left: 48, right: 24, top: 30, bottom: 36 },
    xAxis: {
      type: 'category',
      data: trendData.value.months,
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisTick: { show: false },
      axisLabel: { color: '#8c8c8c', fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      name: '占比 %',
      nameTextStyle: { color: '#8c8c8c', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f0f2f5', type: 'dashed' } },
      axisLabel: { color: '#8c8c8c', fontSize: 12, formatter: '{value}%' },
    },
    series: [
      {
        name: '问题占比',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: trendData.value.data,
        itemStyle: { color: '#1890ff' },
        lineStyle: { width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24,144,255,0.35)' },
            { offset: 1, color: 'rgba(24,144,255,0.02)' },
          ]),
        },
      },
    ],
  }, true)
}

function renderPie() {
  if (!pieRef.value) return
  if (!pieChart) {
    pieChart = echarts.init(pieRef.value, null, { renderer: 'canvas' })
    pieChart.on('click', (params) => {
      if (params && params.name) {
        filteredCategoryName.value = params.name
        // Drill-down: navigate to by-rule with category filter
        router.push({
          path: '/result/by-rule',
          query: { categoryName: params.name },
        })
      }
    })
  }
  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 8,
      top: 'middle',
      type: 'scroll',
      textStyle: { fontSize: 12, color: '#595959' },
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '68%'],
        center: ['62%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' },
        },
        labelLine: { show: false },
        data: pieData.value,
      },
    ],
    color: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'],
  }, true)
}

function renderBar() {
  if (!barRef.value) return
  if (!barChart) {
    barChart = echarts.init(barRef.value, null, { renderer: 'canvas' })
  }
  const sorted = [...barData.value].sort((a, b) => a.issueCount - b.issueCount)
  barChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0]
        return `${p.name}<br/>问题数：${p.value.toLocaleString()}`
      },
    },
    grid: { left: 130, right: 30, top: 16, bottom: 36 },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      splitLine: { lineStyle: { color: '#f0f2f5', type: 'dashed' } },
      axisLabel: { color: '#8c8c8c', fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: sorted.map(d => d.datasetName),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisTick: { show: false },
      axisLabel: {
        color: '#595959',
        fontSize: 12,
        formatter: (val) => val.length > 8 ? val.slice(0, 8) + '…' : val,
      },
    },
    series: [
      {
        type: 'bar',
        data: sorted.map(d => d.issueCount),
        barMaxWidth: 18,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#69c0ff' },
            { offset: 1, color: '#1890ff' },
          ]),
          borderRadius: [0, 4, 4, 0],
        },
      },
    ],
  }, true)
}

function clearCategoryDrill() {
  filteredCategoryName.value = ''
}

function handleResize() {
  trendChart?.resize()
  pieChart?.resize()
  barChart?.resize()
}

// ── Data loading ───────────────────────────────────────────────────
async function loadSummary() {
  summaryLoading.value = true
  try {
    summary.value = await getResultSummary({
      orgId: query.value.orgId,
      statMonth: query.value.statMonth,
    })
  } catch {
    summary.value = {}
  } finally {
    summaryLoading.value = false
  }
}

async function loadTrend() {
  trendLoading.value = true
  try {
    trendData.value = await getIssueRatioTrend({
      orgId: query.value.orgId,
      statMonth: query.value.statMonth,
    })
  } catch {
    trendData.value = { months: [], data: [] }
  } finally {
    trendLoading.value = false
    await nextTick()
    renderTrend()
  }
}

async function loadPie() {
  pieLoading.value = true
  try {
    pieData.value = await getCategoryPie({
      orgId: query.value.orgId,
      statMonth: query.value.statMonth,
    })
  } catch {
    pieData.value = []
  } finally {
    pieLoading.value = false
    await nextTick()
    renderPie()
  }
}

async function loadBar() {
  barLoading.value = true
  try {
    barData.value = await getDatasetRanking({
      orgId: query.value.orgId,
      statMonth: query.value.statMonth,
    })
  } catch {
    barData.value = []
  } finally {
    barLoading.value = false
    await nextTick()
    renderBar()
  }
}

async function loadAll() {
  await Promise.all([loadSummary(), loadTrend(), loadPie(), loadBar()])
}

// ── Sidebar collapse / window resize ───────────────────────────────
watch(() => uiStore.sidebarCollapsed, () => {
  setTimeout(handleResize, 320)
})

// ── Lifecycle ──────────────────────────────────────────────────────
onMounted(async () => {
  if (canPickOrg.value) await loadOrgs()
  await loadAll()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  pieChart?.dispose()
  barChart?.dispose()
  trendChart = null
  pieChart = null
  barChart = null
})
</script>

<style scoped>
.filter-card {
  border-radius: 8px;
}

.filter-card :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-top: 12px;
}

.metric-card {
  border-radius: 8px;
  min-height: 110px;
}

.metric-name {
  font-size: 13px;
  color: var(--color-text-secondary, #606266);
  margin-bottom: 8px;
}

.metric-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-primary, #303133);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.metric-unit {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-secondary, #909399);
  margin-left: 2px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

.mom-text {
  font-size: 13px;
  font-weight: 500;
}

.mom-label {
  font-size: 12px;
  color: var(--color-text-tertiary, #909399);
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-top: 12px;
}

.chart-card {
  border-radius: 8px;
}

.chart-card :deep(.el-card__header) {
  padding: 12px 20px;
}

.chart-card :deep(.el-card__body) {
  padding: 16px 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary, #303133);
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-canvas {
  height: 300px;
  width: 100%;
}

.chart-placeholder {
  height: 300px;
  padding: 16px;
  display: flex;
  align-items: center;
}
</style>
