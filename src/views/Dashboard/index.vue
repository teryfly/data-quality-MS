<template>
  <div class="dashboard" v-loading="pageLoading">
    <!-- ── Row 1: Welcome Banner ──────────────────────────────────────── -->
    <el-card class="welcome-card" shadow="never">
      <div class="welcome-wrap">
        <div class="welcome-left">
          <h2 class="greeting">
            <span class="greeting-text">{{ greeting }}，{{ authStore.realName || '用户' }}！</span>
            <span class="greeting-sub">今天是 {{ todayLabel }}</span>
          </h2>
        </div>
        <div class="welcome-center">
          <el-tag type="primary" size="large" effect="light" class="org-tag">
            {{ authStore.orgName || '未知机构' }}
          </el-tag>
          <el-tag type="success" size="large" effect="light" class="role-tag">
            {{ authStore.roleName || '未知角色' }}
          </el-tag>
        </div>
        <div class="welcome-right">
          <div class="clock">{{ currentTime }}</div>
          <div class="update-info">
            <span class="update-time">数据更新于 {{ lastUpdated }}</span>
            <el-button
              size="small"
              :loading="refreshing"
              :icon="Refresh"
              @click="manualRefresh"
              circle
              title="手动刷新"
            />
          </div>
        </div>
      </div>
    </el-card>

    <!-- ── Row 2: Metric cards ───────────────────────────────────────── -->
    <div class="metrics-row">
      <el-card
        v-for="card in metricCards"
        :key="card.key"
        class="metric-card"
        shadow="never"
        :body-style="{ padding: '20px 24px' }"
      >
        <div class="metric-inner">
          <div class="metric-icon" :style="{ background: card.iconBg }">
            <el-icon size="28" :color="card.iconColor">
              <component :is="card.icon" />
            </el-icon>
          </div>
          <div class="metric-data">
            <div class="metric-name">{{ card.name }}</div>
            <div class="metric-value" v-if="!metricLoading">
              {{ formatMetricValue(card.value, card.unit) }}
              <span v-if="card.unit" class="metric-unit">{{ card.unit }}</span>
            </div>
            <el-skeleton v-else :rows="1" animated style="width: 100px"/>
            <div class="metric-trend" v-if="!metricLoading">
              <el-icon
                :color="getTrendColor(card.mom, card.positiveIsGood)"
                size="14"
              >
                <component :is="getTrendIcon(card.mom, card.positiveIsGood)" />
              </el-icon>
              <span
                class="mom-text"
                :style="{ color: getTrendColor(card.mom, card.positiveIsGood) }"
              >
                {{ Math.abs(card.mom) }}%
              </span>
              <span class="mom-label">较上月</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- ── Row 3: Charts ─────────────────────────────────────────────── -->
    <div class="charts-row">
      <!-- Trend line chart -->
      <el-card class="chart-card trend-card" shadow="never">
        <template #header>
          <div class="card-header-row">
            <span class="card-title-text">近7天数据上传趋势</span>
            <span class="card-subtitle-text">各机构数据上传量</span>
          </div>
        </template>
        <div v-if="chartLoading" class="chart-placeholder">
          <el-skeleton :rows="5" animated />
        </div>
        <div v-else ref="trendChartRef" class="chart-canvas" />
      </el-card>

      <!-- Pie chart -->
      <el-card class="chart-card pie-card" shadow="never">
        <template #header>
          <div class="card-header-row">
            <span class="card-title-text">本月问题类型分布</span>
            <span
              class="card-subtitle-link"
              @click="router.push('/result/by-rule')"
            >查看详情 →</span>
          </div>
        </template>
        <div v-if="chartLoading" class="chart-placeholder">
          <el-skeleton :rows="5" animated />
        </div>
        <div v-else ref="pieChartRef" class="chart-canvas" />
      </el-card>
    </div>

    <!-- ── Row 4: Ranking table + Alerts ─────────────────────────────── -->
    <div class="data-row">
      <!-- Org quality ranking -->
      <el-card class="data-card ranking-card" shadow="never">
        <template #header>
          <div class="card-header-row">
            <span class="card-title-text">机构数据质量排名</span>
            <el-tag type="info" size="small">本月</el-tag>
          </div>
        </template>
        <el-table
          :data="rankingData"
          v-loading="tableLoading"
          size="small"
          :row-style="{ height: '44px' }"
          empty-text="暂无数据"
        >
          <el-table-column prop="rank" label="排名" width="60" align="center">
            <template #default="{ row }">
              <div
                class="rank-badge"
                :class="`rank-${row.rank}`"
              >
                {{ row.rank }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="orgName" label="机构名称" min-width="130">
            <template #default="{ row }">
              <span
                class="org-link"
                @click="router.push('/result/by-rule')"
              >{{ row.orgName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="评分" width="70" align="center">
            <template #default="{ row }">
              <span :style="{ color: getScoreColor(row.score), fontWeight: 600 }">
                {{ row.score }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="issueRatio" label="问题占比" width="80" align="center">
            <template #default="{ row }">{{ row.issueRatio }}%</template>
          </el-table-column>
          <el-table-column prop="rectificationRate" label="整改率" width="80" align="center">
            <template #default="{ row }">
              <el-progress
                :percentage="row.rectificationRate"
                :show-text="false"
                :stroke-width="6"
                :color="getRectColor(row.rectificationRate)"
                style="width: 60px"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Latest severe alerts -->
      <el-card class="data-card alerts-card" shadow="never">
        <template #header>
          <div class="card-header-row">
            <span class="card-title-text">最新严重问题告警</span>
            <span
              class="card-subtitle-link"
              @click="router.push('/result/detail')"
            >查看全部 →</span>
          </div>
        </template>
        <div v-loading="tableLoading" class="alerts-list">
          <div
            v-if="!tableLoading && alertsData.length === 0"
            class="empty-placeholder"
          >
            <el-empty description="暂无告警" :image-size="60" />
          </div>
          <div
            v-for="item in alertsData"
            :key="item.id"
            class="alert-item"
            @click="router.push('/result/detail')"
          >
            <div class="alert-level">
              <el-icon size="14" color="#ff4d4f"><Warning /></el-icon>
            </div>
            <div class="alert-body">
              <div class="alert-rule">{{ item.ruleName }}</div>
              <div class="alert-meta">
                <span class="alert-org">{{ item.orgName }}</span>
                <el-divider direction="vertical" />
                <span class="alert-dataset">{{ item.datasetName }}</span>
              </div>
            </div>
            <div class="alert-time">{{ item.time }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- ── Row 5: Quick shortcuts ─────────────────────────────────────── -->
    <el-card
      v-if="shortcuts.length > 0"
      class="shortcuts-card"
      shadow="never"
    >
      <template #header>
        <span class="card-title-text">快捷操作</span>
      </template>
      <div class="shortcuts-wrap">
        <div
          v-for="sc in shortcuts"
          :key="sc.path"
          class="shortcut-btn"
          @click="router.push(sc.path)"
        >
          <div class="shortcut-icon" :style="{ background: sc.bg }">
            <el-icon size="24" :color="sc.color">
              <component :is="sc.icon" />
            </el-icon>
          </div>
          <span class="shortcut-label">{{ sc.label }}</span>
        </div>
      </div>
    </el-card>

    <!-- ── Row 6: 公共组件验证区 (Phase 3) ──────────────────────────────── -->
    <el-card class="component-verify-card" shadow="never">
      <template #header>
        <div class="card-header-row">
          <span class="card-title-text">组件库验证 · StatusTag</span>
          <el-tag type="success" size="small" effect="light">Phase 3</el-tag>
        </div>
      </template>
      <!-- StatusTag 各状态展示 -->
      <div class="tag-showcase">
        <div class="tag-group">
          <span class="tag-group-label">通用状态：</span>
          <StatusTag type="enabled" />
          <StatusTag type="disabled" />
          <StatusTag type="error" />
          <StatusTag type="warning" />
        </div>
        <el-divider direction="vertical" style="height: 28px" />
        <div class="tag-group">
          <span class="tag-group-label">整改状态：</span>
          <StatusTag type="unfixed" />
          <StatusTag type="fixing" />
          <StatusTag type="fixed" />
          <StatusTag type="unnecessary" />
        </div>
        <el-divider direction="vertical" style="height: 28px" />
        <div class="tag-group">
          <span class="tag-group-label">规则级别：</span>
          <StatusTag :type="1" />
          <StatusTag :type="2" />
          <StatusTag :type="3" />
        </div>
      </div>
    </el-card>

    <el-card class="component-verify-card" shadow="never">
      <template #header>
        <span class="card-title-text">组件库验证 · DataTable</span>
      </template>
      <DataTable
        :data="verifyTableData"
        :columns="verifyColumns"
        :total="verifyTableData.length"
        :page="1"
        :page-size="5"
        empty-text="暂无数据"
      >
        <!-- Custom slot for status column -->
        <template #status="{ row }">
          <StatusTag :type="row.status" />
        </template>
        <!-- Custom slot for level column -->
        <template #level="{ row }">
          <StatusTag :type="row.level" />
        </template>
      </DataTable>
    </el-card>
  </div>
</template>

<script setup>
import * as echarts from 'echarts/core'
import { LineChart, PieChart as EChartsPie } from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 按需注册 + 使用 CanvasRenderer（性能更好）
echarts.use([
  LineChart, EChartsPie,
  GridComponent, TooltipComponent, LegendComponent,
  CanvasRenderer,
])
import {
  Refresh, Warning,
  DataAnalysis, WarningFilled, PieChart, CircleCheckFilled,
  DocumentCopy, TrendCharts, Download, VideoPlay, ArrowUp, ArrowDown,
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'
import { useUiStore } from '@/store/ui'
import request from '@/utils/request'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

// ── Clock ──────────────────────────────────────────────────────────────────
const currentTime = ref('')
const todayLabel = ref('')

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const pad = n => String(n).padStart(2, '0')

const updateClock = () => {
  const now = new Date()
  todayLabel.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${WEEKDAYS[now.getDay()]}`
  currentTime.value = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
})

// ── Loading states ─────────────────────────────────────────────────────────
const pageLoading = ref(false)
const metricLoading = ref(false)
const chartLoading = ref(true)
const tableLoading = ref(false)
const refreshing = ref(false)
const lastUpdated = ref('')

const updateLastUpdated = () => {
  const now = new Date()
  lastUpdated.value = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

// ── Metric cards ───────────────────────────────────────────────────────────
const summaryData = ref(null)

const metricCards = computed(() => [
  {
    key: 'totalChecks',
    name: '本月质控总数',
    value: summaryData.value?.totalChecks ?? 0,
    mom: summaryData.value?.totalChecksMoM ?? 0,
    unit: '',
    positiveIsGood: true,
    icon: DataAnalysis,
    iconBg: '#e6f4ff',
    iconColor: '#1890ff',
  },
  {
    key: 'totalIssues',
    name: '本月问题总数',
    value: summaryData.value?.totalIssues ?? 0,
    mom: summaryData.value?.totalIssuesMoM ?? 0,
    unit: '',
    positiveIsGood: false,  // more issues = bad
    icon: WarningFilled,
    iconBg: '#fff1f0',
    iconColor: '#ff4d4f',
  },
  {
    key: 'issueRatio',
    name: '问题占比',
    value: summaryData.value?.issueRatio ?? 0,
    mom: summaryData.value?.issueRatioMoM ?? 0,
    unit: '%',
    positiveIsGood: false,
    icon: PieChart,
    iconBg: '#fffbe6',
    iconColor: '#faad14',
  },
  {
    key: 'rectificationRate',
    name: '整改完成率',
    value: summaryData.value?.rectificationRate ?? 0,
    mom: summaryData.value?.rectificationRateMoM ?? 0,
    unit: '%',
    positiveIsGood: true,
    icon: CircleCheckFilled,
    iconBg: '#f6ffed',
    iconColor: '#52c41a',
  },
])

const formatMetricValue = (val, unit) => {
  if (unit === '%') return val.toFixed(1)
  if (val >= 10000) return (val / 10000).toFixed(1) + '万'
  return val.toLocaleString()
}

const getTrendIcon = (mom, positiveIsGood) => {
  const isUp = mom > 0
  return isUp ? ArrowUp : ArrowDown
}

const getTrendColor = (mom, positiveIsGood) => {
  const isUp = mom > 0
  const isGood = positiveIsGood ? isUp : !isUp
  return isGood ? '#52c41a' : '#ff4d4f'
}

// ── Chart refs & instances ─────────────────────────────────────────────────
const trendChartRef = ref(null)
const pieChartRef = ref(null)
let trendChart = null
let pieChart = null

const trendData = ref({ dates: [], series: [] })
const pieData = ref([])

const initCharts = () => {
  if (trendChartRef.value && !trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }
  if (pieChartRef.value && !pieChart) {
    pieChart = echarts.init(pieChartRef.value)
  }
  updateChartOptions()
}

const updateChartOptions = () => {
  trendChart?.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#d9d9d9',
      textStyle: { color: '#262626' },
    },
    legend: {
      top: 4,
      type: 'scroll',
      textStyle: { fontSize: 12, color: '#595959' },
    },
    grid: { left: 48, right: 20, top: 44, bottom: 36 },
    xAxis: {
      type: 'category',
      data: trendData.value.dates,
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisTick: { show: false },
      axisLabel: { color: '#8c8c8c', fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      name: '上传量',
      nameTextStyle: { color: '#8c8c8c', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f0f2f5', type: 'dashed' } },
      axisLabel: { color: '#8c8c8c', fontSize: 12 },
    },
    series: trendData.value.series.map((s) => ({
      name: s.name,
      type: 'line',
      smooth: true,
      data: s.data,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2 },
      emphasis: { focus: 'series' },
    })),
    color: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'],
  }, true)

  pieChart?.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}条 ({d}%)',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#d9d9d9',
      textStyle: { color: '#262626' },
    },
    legend: {
      orient: 'vertical',
      left: 8,
      top: 'middle',
      textStyle: { fontSize: 12, color: '#595959' },
      formatter: name => name.length > 6 ? name.slice(0, 6) + '…' : name,
    },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['65%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' },
        },
        labelLine: { show: false },
        data: pieData.value,
      },
    ],
    color: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'],
  }, true)
}

const handleResize = () => {
  trendChart?.resize()
  pieChart?.resize()
}

// ── Table data ─────────────────────────────────────────────────────────────
const rankingData = ref([])
const alertsData = ref([])

// ── Shortcut buttons ───────────────────────────────────────────────────────
const shortcuts = computed(() => {
  const all = [
    {
      label: '配置规则',
      path: '/rule/list',
      permission: 'rule:view',
      icon: DocumentCopy,
      bg: '#e6f4ff',
      color: '#1890ff',
    },
    {
      label: '查看结果',
      path: '/result/overview',
      permission: 'result:view',
      icon: TrendCharts,
      bg: '#f6ffed',
      color: '#52c41a',
    },
    {
      label: '下载报告',
      path: '/report',
      permission: 'report:view',
      icon: Download,
      bg: '#fffbe6',
      color: '#faad14',
    },
    {
      label: '手动执行',
      path: '/rule/execute',
      permission: 'rule:execute',
      icon: VideoPlay,
      bg: '#fff0f6',
      color: '#eb2f96',
    },
  ]
  return all.filter(sc => authStore.hasPermission(sc.permission))
})

// ── Ranking / Alert helpers ────────────────────────────────────────────────
const getScoreColor = (score) => {
  if (score >= 90) return '#52c41a'
  if (score >= 75) return '#faad14'
  return '#ff4d4f'
}

const getRectColor = (rate) => {
  if (rate >= 90) return '#52c41a'
  if (rate >= 70) return '#faad14'
  return '#ff4d4f'
}

// ── Data fetching ──────────────────────────────────────────────────────────
const fetchSummary = async () => {
  metricLoading.value = true
  try {
    summaryData.value = await request.get('/api/result/summary', {
      params: { type: 'overview' },
    })
  } catch {
    // Keep last values on error
  } finally {
    metricLoading.value = false
  }
}

const fetchCharts = async () => {
  chartLoading.value = true
  try {
    const [trend, pie] = await Promise.all([
      request.get('/api/result/chart/trend'),
      request.get('/api/result/chart/type-dist'),
    ])
    trendData.value = trend
    pieData.value = pie
  } catch {
    // ignore
  } finally {
    chartLoading.value = false
    await nextTick()
    initCharts()
  }
}

const fetchTables = async () => {
  tableLoading.value = true
  try {
    const [ranking, alerts] = await Promise.all([
      request.get('/api/result/org-ranking'),
      request.get('/api/result/alerts'),
    ])
    rankingData.value = ranking
    alertsData.value = alerts
  } catch {
    // ignore
  } finally {
    tableLoading.value = false
  }
}

const fetchAll = async () => {
  await Promise.all([fetchSummary(), fetchCharts(), fetchTables()])
  updateLastUpdated()
}

const manualRefresh = async () => {
  refreshing.value = true
  await fetchAll()
  refreshing.value = false
}

// ── Auto refresh (5 min) ────────────────────────────────────────────────────
let refreshTimer = null
let clockTimer = null

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    fetchAll()
    refreshTimer = setInterval(fetchAll, 5 * 60 * 1000)
  } else {
    clearInterval(refreshTimer)
  }
}

// ── Phase 3 component verification data ───────────────────────────────────
const verifyColumns = [
  { field: 'id',          label: 'ID',      width: 60,  align: 'center' },
  { field: 'ruleName',    label: '规则名称', minWidth: 140 },
  { field: 'datasetName', label: '数据集',  width: 120 },
  { field: 'level',       label: '规则级别', width: 90,  align: 'center', slot: 'level' },
  { field: 'status',      label: '状态',    width: 80,  align: 'center', slot: 'status' },
  { field: 'issueCount',  label: '问题数',  width: 80,  align: 'right',
    formatter: (row) => row.issueCount?.toLocaleString() ?? '-' },
]

const verifyTableData = [
  { id: 1, ruleName: '患者姓名非空检查',   datasetName: '门诊记录表', level: 1, status: 'enabled',  issueCount: 128 },
  { id: 2, ruleName: '性别代码值域检查',   datasetName: '住院记录表', level: 2, status: 'enabled',  issueCount: 34 },
  { id: 3, ruleName: '出院日期格式检查',   datasetName: '住院记录表', level: 3, status: 'disabled', issueCount: 0 },
  { id: 4, ruleName: '身份证号格式验证',   datasetName: '患者基本信息', level: 1, status: 'error',  issueCount: 56 },
  { id: 5, ruleName: '联系电话格式检查',   datasetName: '患者基本信息', level: 2, status: 'enabled', issueCount: 9 },
]

// ── Watch sidebar collapse to resize charts ────────────────────────────────
watch(() => uiStore.sidebarCollapsed, () => {
  setTimeout(() => handleResize(), 320) // after transition ends
})

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)

  await fetchAll()

  refreshTimer = setInterval(fetchAll, 5 * 60 * 1000)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  clearInterval(clockTimer)
  clearInterval(refreshTimer)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  pieChart?.dispose()
  trendChart = null
  pieChart = null
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Welcome card ─────────────────────────────────────────────────────────── */
.welcome-card {
  border-radius: 8px;
}

.welcome-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.welcome-left {
  flex: 1;
}

.greeting {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.greeting-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.greeting-sub {
  font-size: 13px;
  color: var(--color-text-tertiary);
  font-weight: 400;
}

.welcome-center {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.org-tag,
.role-tag {
  font-size: 13px;
}

.welcome-right {
  flex-shrink: 0;
  text-align: right;
}

.clock {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
}

.update-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.update-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

/* ── Metrics row ─────────────────────────────────────────────────────────── */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.metric-card {
  border-radius: 8px;
}

.metric-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-data {
  flex: 1;
  min-width: 0;
}

.metric-name {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.metric-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.metric-unit {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-secondary);
  margin-left: 2px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 4px;
}

.mom-text {
  font-size: 13px;
  font-weight: 500;
}

.mom-label {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

/* ── Charts row ──────────────────────────────────────────────────────────── */
.charts-row {
  display: flex;
  gap: 16px;
}

.chart-card {
  border-radius: 8px;
}

.trend-card {
  flex: 65;
}

.pie-card {
  flex: 35;
}

.chart-canvas {
  height: 280px;
  width: 100%;
}

.chart-placeholder {
  height: 280px;
  padding: 16px;
  display: flex;
  align-items: center;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-subtitle-text {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.card-subtitle-link {
  font-size: 12px;
  color: var(--color-primary);
  cursor: pointer;
  transition: opacity 0.2s;
}

.card-subtitle-link:hover {
  opacity: 0.75;
}

/* ── Data row ─────────────────────────────────────────────────────────────── */
.data-row {
  display: flex;
  gap: 16px;
}

.data-card {
  border-radius: 8px;
}

.ranking-card {
  flex: 60;
}

.alerts-card {
  flex: 40;
}

/* Rank badge */
.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin: 0 auto;
  background: #f0f2f5;
  color: var(--color-text-secondary);
}

.rank-1 { background: #ffd700; color: #8b6914; }
.rank-2 { background: #c0c0c0; color: #5a5a5a; }
.rank-3 { background: #cd7f32; color: white; }

.org-link {
  color: var(--color-primary);
  cursor: pointer;
}

.org-link:hover {
  text-decoration: underline;
}

/* Alerts list */
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 340px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  padding: 10px 4px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 0.15s;
  gap: 8px;
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-item:hover {
  background: #fafafa;
}

.alert-level {
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-body {
  flex: 1;
  min-width: 0;
}

.alert-rule {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alert-meta {
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-top: 2px;
}

.alert-org {
  color: var(--color-text-secondary);
}

.alert-dataset {
  color: var(--color-text-tertiary);
}

.alert-time {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--color-text-tertiary);
  white-space: nowrap;
}

.empty-placeholder {
  padding: 20px 0;
  text-align: center;
}

/* ── Shortcuts ────────────────────────────────────────────────────────────── */
.shortcuts-card {
  border-radius: 8px;
}

.shortcuts-wrap {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.shortcut-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 12px 16px;
  border-radius: 8px;
  transition: background 0.2s, transform 0.15s;
  min-width: 80px;
}

.shortcut-btn:hover {
  background: var(--color-bg-gray);
  transform: translateY(-2px);
}

.shortcut-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcut-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* ── Phase 3 component verification ─────────────────────────────────────── */
.component-verify-card {
  border-radius: 8px;
}

.tag-showcase {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.tag-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-group-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
</style>
