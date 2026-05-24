<template>
  <PageContainer title="数据质量报告">
    <!-- ── 顶部控制区 ─────────────────────────────────────────────────── -->
    <el-card class="ctrl-card no-print" shadow="never" :body-style="{ padding: '12px 20px' }">
      <el-form inline>
        <!-- 机构选择（dataScope <= 2 才可选，机构用户只读） -->
        <el-form-item label="机构">
          <el-select
            v-if="canSelectOrg"
            v-model="selectedOrgId"
            placeholder="请选择机构"
            filterable
            style="width: 240px"
            @change="onOrgChange"
          >
            <el-option
              v-for="org in orgOptions"
              :key="org.id"
              :label="org.orgName"
              :value="org.id"
            />
          </el-select>
          <span v-else class="org-readonly-label">{{ authStore.orgName }}</span>
        </el-form-item>

        <!-- 报告月份选择（联动机构） -->
        <el-form-item label="报告月份">
          <el-select
            v-model="selectedReportId"
            placeholder="请选择月份"
            style="width: 200px"
            :loading="listLoading"
            @change="loadReportDetail"
          >
            <el-option
              v-for="r in reportList"
              :key="r.id"
              :label="formatReportMonth(r.reportMonth)"
              :value="r.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ── 主体区：左导航 + 右内容 ──────────────────────────────────── -->
    <div class="report-layout">
      <!-- 左侧历史报告导航 -->
      <div class="report-left-nav no-print" v-show="reportList.length > 0">
        <div class="nav-header">历史报告</div>
        <ul class="nav-list">
          <li
            v-for="r in reportList"
            :key="r.id"
            class="nav-item"
            :class="{ active: r.id === selectedReportId }"
            @click="selectReport(r.id)"
          >
            <span class="nav-month">{{ formatReportMonth(r.reportMonth) }}</span>
            <span class="nav-score" :style="{ color: getScoreColor(r.score) }">
              {{ r.score }}分
            </span>
          </li>
        </ul>
      </div>

      <!-- 右侧报告主内容区 -->
      <div class="report-main" ref="reportMainRef">
        <!-- 空状态 -->
        <el-empty v-if="!listLoading && reportList.length === 0" description="暂无报告数据" />

        <!-- 加载中 -->
        <div v-else-if="detailLoading" class="detail-loading">
          <el-skeleton :rows="12" animated />
        </div>

        <!-- 报告内容 -->
        <div v-else-if="report" class="report-doc">

          <!-- ── A. 报告头部 ─────────────────────────────────────────── -->
          <div class="report-header">
            <h1 class="report-title">
              {{ report.orgName }} {{ formatReportMonthLong(report.reportMonth) }}数据质量报告
            </h1>
            <div class="report-meta">
              <span>制表日期：{{ report.tableDate }}</span>
              <el-divider direction="vertical" />
              <span>质控时间：{{ report.qcStartDate }} 至 {{ report.qcEndDate }}</span>
              <el-divider direction="vertical" />
              <span>生成时间：{{ report.createTime }}</span>
            </div>
          </div>
          <el-divider />

          <!-- ── B. 核心指标卡片区（6卡） ────────────────────────────── -->
          <div class="metrics-grid">
            <!-- 1. 数据质量评分（ECharts 仪表盘） -->
            <div class="metric-card gauge-card">
              <div class="metric-label">数据质量评分</div>
              <div ref="gaugeRef" class="gauge-chart" />
            </div>

            <!-- 2. 区域排名 -->
            <div class="metric-card">
              <div class="metric-label">区域排名</div>
              <div class="metric-ranking">
                <span class="ranking-num">第{{ report.ranking }}名</span>
                <span class="ranking-total">共{{ report.totalOrgCount }}家</span>
              </div>
            </div>

            <!-- 3. 总质控数据量 -->
            <div class="metric-card">
              <div class="metric-label">总质控数据量</div>
              <div class="metric-value-big">{{ formatNumber(report.totalQcCount) }}</div>
              <div class="metric-unit">条</div>
            </div>

            <!-- 4. 问题总数 -->
            <div class="metric-card">
              <div class="metric-label">问题总数</div>
              <div class="metric-value-big">{{ formatNumber(report.totalProblemCount) }}</div>
              <div class="metric-unit">条</div>
            </div>

            <!-- 5. 问题占比 -->
            <div class="metric-card">
              <div class="metric-label">问题占比</div>
              <div class="metric-value-big">{{ report.problemRatio }}%</div>
              <div class="metric-trend" :class="growthClass(report.problemRatioGrowth)">
                <el-icon><component :is="growthIcon(report.problemRatioGrowth)" /></el-icon>
                <span>{{ Math.abs(report.problemRatioGrowth) }}% 环比</span>
              </div>
            </div>

            <!-- 6. 环比变化 -->
            <div class="metric-card">
              <div class="metric-label">问题占比环比</div>
              <div class="metric-growth" :class="growthClass(report.problemRatioGrowth)">
                <el-icon size="20"><component :is="growthIcon(report.problemRatioGrowth)" /></el-icon>
                <span class="growth-num">{{ Math.abs(report.problemRatioGrowth).toFixed(2) }}%</span>
              </div>
              <div class="metric-sub">
                {{ report.problemRatioGrowth < 0 ? '问题减少 ✓ 改善' : report.problemRatioGrowth > 0 ? '问题增多 ✗ 恶化' : '持平' }}
              </div>
            </div>
          </div>

          <!-- ── C. 问题分析表格区（两个并排） ──────────────────────── -->
          <div class="section-title">问题分析</div>
          <div class="tables-row">
            <!-- 按规则类型统计 -->
            <div class="table-half">
              <div class="table-header">按规则类型统计</div>
              <el-table
                :data="report.ruleTypeStats"
                size="small"
                border
                style="width: 100%"
              >
                <el-table-column label="规则类型" prop="ruleType" width="110" />
                <el-table-column label="问题数" prop="count" width="90" align="right">
                  <template #default="{ row }">
                    {{ formatNumber(row.count) }}
                  </template>
                </el-table-column>
                <el-table-column label="占比">
                  <template #default="{ row }">
                    <div class="ratio-bar-wrap">
                      <div
                        class="ratio-bar"
                        :style="{ width: row.ratio + '%' }"
                      />
                      <span class="ratio-label">{{ row.ratio }}%</span>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 按数据集统计 -->
            <div class="table-half">
              <div class="table-header">按数据集统计</div>
              <el-table
                :data="report.datasetStats"
                size="small"
                border
                style="width: 100%"
              >
                <el-table-column label="数据集" prop="datasetName" width="130">
                  <template #default="{ row }">
                    <span :title="row.datasetName">{{ truncate(row.datasetName, 8) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="问题数" prop="count" width="85" align="right">
                  <template #default="{ row }">
                    {{ formatNumber(row.count) }}
                  </template>
                </el-table-column>
                <el-table-column label="占比">
                  <template #default="{ row }">
                    <div class="ratio-bar-wrap">
                      <div
                        class="ratio-bar dataset-bar"
                        :style="{ width: row.ratio + '%' }"
                      />
                      <span class="ratio-label">{{ row.ratio }}%</span>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- ── D. 问题 TOP10 图表（两个横向柱状图并排） ──────────── -->
          <div class="section-title">问题 Top 10</div>
          <div class="charts-row">
            <div class="chart-half">
              <div class="chart-label">问题规则 Top10</div>
              <div ref="ruleBarRef" class="bar-chart" />
            </div>
            <div class="chart-half">
              <div class="chart-label">问题数据集 Top10</div>
              <div ref="datasetBarRef" class="bar-chart" />
            </div>
          </div>

          <!-- ── E. 综合分析文字区 ───────────────────────────────────── -->
          <div class="section-title">综合分析</div>
          <el-card class="analysis-card" shadow="never">
            <div class="analysis-title">综合分析</div>
            <div class="analysis-body">
              <p
                v-for="(para, i) in analysisParas"
                :key="i"
                class="analysis-para"
              >
                {{ para }}
              </p>
            </div>
          </el-card>

          <!-- ── F. 底部操作按钮区 ──────────────────────────────────── -->
          <div class="report-actions no-print">
            <el-button
              v-permission="'report:export'"
              type="primary"
              :loading="exportingPdf"
              @click="handleExportPdf"
            >
              <el-icon><Download /></el-icon>
              导出 PDF
            </el-button>
            <el-button
              :loading="exportingExcel"
              @click="handleDownloadExcel"
            >
              <el-icon><Document /></el-icon>
              下载问题明细 Excel
            </el-button>
            <el-button @click="handlePrint" class="no-print">
              <el-icon><Printer /></el-icon>
              打印报告
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出遮罩 -->
    <ExportLoading ref="exportLoadingRef" />
  </PageContainer>
</template>

<script setup>
import * as echarts from 'echarts'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ArrowUp, ArrowDown, Download, Document, Printer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { formatNumber } from '@/utils/format'
import {
  getMonthlyReportList,
  getMonthlyReportDetail,
  exportMonthlyReport,
  downloadProblemDetail,
} from '@/api/report'
import request from '@/utils/request'

const authStore = useAuthStore()

// ── 权限 ────────────────────────────────────────────────────────────
/** dataScope: 1=全局管理员, 2=区域管理员, 3=机构用户 */
const canSelectOrg = computed(() => (authStore.dataScope ?? 3) <= 2)

// ── 机构选项 ─────────────────────────────────────────────────────────
const orgOptions = ref([])
const selectedOrgId = ref(authStore.orgId)

async function loadOrgs() {
  if (!canSelectOrg.value) return
  try {
    const res = await request.get('/api/system/org', { params: { page: 1, size: 200 } })
    orgOptions.value = res?.records || []
    // 如果当前机构不在列表中，自动选第一个
    if (orgOptions.value.length && !orgOptions.value.find(o => o.id === selectedOrgId.value)) {
      selectedOrgId.value = orgOptions.value[0].id
    }
  } catch {
    orgOptions.value = []
  }
}

// ── 报告列表 ─────────────────────────────────────────────────────────
const listLoading = ref(false)
const reportList = ref([])
const selectedReportId = ref(null)

async function loadReportList() {
  listLoading.value = true
  try {
    const params = { page: 1, size: 12 }
    if (selectedOrgId.value) params.orgId = selectedOrgId.value
    const res = await getMonthlyReportList(params)
    reportList.value = res?.records || []
    // 自动选最新报告
    if (reportList.value.length) {
      selectedReportId.value = reportList.value[0].id
      await loadReportDetail()
    } else {
      selectedReportId.value = null
      report.value = null
    }
  } catch {
    reportList.value = []
  } finally {
    listLoading.value = false
  }
}

function onOrgChange() {
  report.value = null
  selectedReportId.value = null
  reportList.value = []
  loadReportList()
}

function selectReport(id) {
  selectedReportId.value = id
  loadReportDetail()
}

// ── 报告详情 ─────────────────────────────────────────────────────────
const detailLoading = ref(false)
const report = ref(null)

async function loadReportDetail() {
  if (!selectedReportId.value) return
  detailLoading.value = true
  destroyCharts()
  try {
    report.value = await getMonthlyReportDetail(selectedReportId.value)
    await nextTick()
    initCharts()
  } catch {
    report.value = null
    ElMessage.error('加载报告详情失败')
  } finally {
    detailLoading.value = false
  }
}

// ── 分析段落 ─────────────────────────────────────────────────────────
const analysisParas = computed(() => {
  if (!report.value?.analysis) return []
  // 按句号+换行或特殊分段符分割
  return report.value.analysis.split(/。(?=[一-龥])/).map((p, i, arr) => {
    return i < arr.length - 1 ? p + '。' : p
  }).filter(Boolean)
})

// ── 工具函数 ─────────────────────────────────────────────────────────
function formatReportMonth(m) {
  if (!m) return ''
  const [y, mo] = m.split('-')
  return `${y}年${mo}月`
}

function formatReportMonthLong(m) {
  if (!m) return ''
  const [y, mo] = m.split('-')
  return `${y}年${mo}月`
}

function getScoreColor(score) {
  if (score >= 90) return '#52c41a'
  if (score >= 70) return '#fa8c16'
  return '#ff4d4f'
}

function growthIcon(growth) {
  return growth < 0 ? ArrowDown : ArrowUp
}

function growthClass(growth) {
  if (growth < 0) return 'trend-good'
  if (growth > 0) return 'trend-bad'
  return 'trend-neutral'
}

function truncate(str, len) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}

// ── ECharts 图表 ─────────────────────────────────────────────────────
const gaugeRef = ref(null)
const ruleBarRef = ref(null)
const datasetBarRef = ref(null)

let gaugeChart = null
let ruleBarChart = null
let datasetBarChart = null

function initCharts() {
  if (!report.value) return
  nextTick(() => {
    initGauge()
    initRuleBar()
    initDatasetBar()
  })
}

function destroyCharts() {
  [gaugeChart, ruleBarChart, datasetBarChart].forEach(c => {
    if (c) { c.dispose(); }
  })
  gaugeChart = null
  ruleBarChart = null
  datasetBarChart = null
}

function initGauge() {
  if (!gaugeRef.value || !report.value) return
  gaugeChart = echarts.init(gaugeRef.value, null, { renderer: 'canvas' })
  const score = report.value.score
  const color = getScoreColor(score)
  gaugeChart.setOption({
    series: [{
      type: 'gauge',
      radius: '88%',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 5,
      pointer: {
        show: true,
        length: '60%',
        width: 4,
        itemStyle: { color },
      },
      progress: {
        show: true,
        width: 10,
        itemStyle: { color },
      },
      axisLine: {
        lineStyle: {
          width: 10,
          color: [[1, '#e8e8e8']],
        },
      },
      axisTick: { show: false },
      splitLine: {
        show: true,
        length: 6,
        lineStyle: { color: '#ddd', width: 1 },
      },
      axisLabel: {
        distance: 14,
        fontSize: 10,
        color: '#999',
        formatter: (v) => v === 0 || v === 100 || v % 25 === 0 ? v : '',
      },
      detail: {
        valueAnimation: true,
        formatter: '{value}',
        fontSize: 26,
        fontWeight: 700,
        color,
        offsetCenter: [0, '25%'],
      },
      title: {
        show: true,
        offsetCenter: [0, '55%'],
        fontSize: 12,
        color: '#888',
      },
      data: [{ value: score, name: '综合评分' }],
    }],
  })
}

function buildBarOption(items, color) {
  const names = items.map(d => d.name)
  const values = items.map(d => d.count)
  const maxVal = Math.max(...values, 1)
  return {
    grid: { left: 8, right: 48, top: 8, bottom: 8, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 11, color: '#666' },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    yAxis: {
      type: 'category',
      data: [...names].reverse(),
      axisLabel: {
        fontSize: 11,
        color: '#333',
        width: 90,
        overflow: 'truncate',
        formatter: (val) => val.length > 8 ? val.slice(0, 8) + '…' : val,
      },
      axisTick: { show: false },
    },
    series: [{
      type: 'bar',
      data: [...values].reverse(),
      barMaxWidth: 18,
      itemStyle: {
        color,
        borderRadius: [0, 3, 3, 0],
      },
      label: {
        show: true,
        position: 'right',
        fontSize: 11,
        color: '#555',
        formatter: ({ value }) => value.toLocaleString('zh-CN'),
      },
    }],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0]
        return `${p.name}<br/>${p.value.toLocaleString('zh-CN')} 条`
      },
    },
  }
}

function initRuleBar() {
  if (!ruleBarRef.value || !report.value?.ruleTop10) return
  ruleBarChart = echarts.init(ruleBarRef.value, null, { renderer: 'canvas' })
  ruleBarChart.setOption(buildBarOption(report.value.ruleTop10, '#5b8ff9'))
}

function initDatasetBar() {
  if (!datasetBarRef.value || !report.value?.datasetTop10) return
  datasetBarChart = echarts.init(datasetBarRef.value, null, { renderer: 'canvas' })
  datasetBarChart.setOption(buildBarOption(report.value.datasetTop10, '#5ad8a6'))
}

// ── 窗口 resize 自适应 ──────────────────────────────────────────────
function handleResize() {
  gaugeChart?.resize()
  ruleBarChart?.resize()
  datasetBarChart?.resize()
}

// ── 打印处理 ─────────────────────────────────────────────────────────
function handlePrint() {
  // 将所有 canvas 图表转为 img，避免打印空白
  const chartList = [
    { ref: gaugeRef, chart: gaugeChart },
    { ref: ruleBarRef, chart: ruleBarChart },
    { ref: datasetBarRef, chart: datasetBarChart },
  ]
  const tempImgs = []
  chartList.forEach(({ ref: r, chart }) => {
    if (!r.value || !chart) return
    const dataURL = chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' })
    const img = document.createElement('img')
    img.src = dataURL
    img.style.cssText = `width:100%;height:${r.value.offsetHeight}px;display:block;`
    img.className = 'chart-print-img'
    r.value.parentNode.insertBefore(img, r.value)
    r.value.style.display = 'none'
    tempImgs.push({ canvas: r.value, img })
  })

  window.print()

  // 打印后恢复 canvas 元素
  setTimeout(() => {
    tempImgs.forEach(({ canvas, img }) => {
      canvas.style.display = ''
      img.remove()
    })
  }, 1000)
}

// ── 导出 PDF ─────────────────────────────────────────────────────────
const exportingPdf = ref(false)
const exportLoadingRef = ref(null)

async function handleExportPdf() {
  if (!selectedReportId.value) return
  exportLoadingRef.value?.show()
  exportingPdf.value = true
  try {
    const response = await exportMonthlyReport(selectedReportId.value)
    triggerDownload(response, `月度报告_${report.value?.reportMonth || ''}.pdf`)
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败，请重试')
  } finally {
    exportingPdf.value = false
    exportLoadingRef.value?.hide()
  }
}

// ── 下载问题明细 ─────────────────────────────────────────────────────
const exportingExcel = ref(false)

async function handleDownloadExcel() {
  if (!selectedReportId.value) return
  exportLoadingRef.value?.show()
  exportingExcel.value = true
  try {
    const response = await downloadProblemDetail(selectedReportId.value)
    triggerDownload(response, `问题明细_${report.value?.reportMonth || ''}.xlsx`)
    ElMessage.success('下载成功')
  } catch {
    ElMessage.error('下载失败，请重试')
  } finally {
    exportingExcel.value = false
    exportLoadingRef.value?.hide()
  }
}

function triggerDownload(blobData, filename) {
  const blob = blobData instanceof Blob ? blobData : new Blob([blobData])
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── 生命周期 ──────────────────────────────────────────────────────────
onMounted(async () => {
  await loadOrgs()
  await loadReportList()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  destroyCharts()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* ── 布局 ──────────────────────────────────────────────────────────── */
.ctrl-card {
  flex-shrink: 0;
}

.report-layout {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ── 左侧导航 ──────────────────────────────────────────────────────── */
.report-left-nav {
  width: 180px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow-y: auto;
}

.nav-header {
  padding: 14px 16px 10px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.nav-list {
  list-style: none;
  padding: 6px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 16px;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 13px;
}

.nav-item:hover {
  background: #f5f7fa;
}

.nav-item.active {
  background: #e6f4ff;
  border-right: 3px solid #1890ff;
}

.nav-month {
  color: #333;
  font-weight: 500;
}

.nav-score {
  font-size: 12px;
  font-weight: 600;
}

/* ── 右侧主内容 ────────────────────────────────────────────────────── */
.report-main {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.detail-loading {
  background: #fff;
  border-radius: 8px;
  padding: 32px;
}

/* ── 报告文档区 ────────────────────────────────────────────────────── */
.report-doc {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  padding: 32px 40px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

/* ── 报告头部 ──────────────────────────────────────────────────────── */
.report-header {
  text-align: center;
  margin-bottom: 16px;
}

.report-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.5;
  margin-bottom: 12px;
}

.report-meta {
  font-size: 13px;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

/* ── 章节标题 ──────────────────────────────────────────────────────── */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 24px 0 12px;
  padding-left: 10px;
  border-left: 4px solid #1890ff;
}

/* ── 指标卡片区 ────────────────────────────────────────────────────── */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 8px;
}

.metric-card {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 100px;
  justify-content: center;
}

.gauge-card {
  padding: 8px 4px;
}

.metric-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
  white-space: nowrap;
}

/* 评分仪表盘 */
.gauge-chart {
  width: 100%;
  height: 100px;
}

/* 区域排名 */
.metric-ranking {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.ranking-num {
  font-size: 22px;
  font-weight: 700;
  color: #1890ff;
}

.ranking-total {
  font-size: 12px;
  color: #999;
}

/* 数值类指标 */
.metric-value-big {
  font-size: 20px;
  font-weight: 700;
  color: #262626;
  line-height: 1.2;
}

.metric-unit {
  font-size: 12px;
  color: #aaa;
  margin-top: 2px;
}

.metric-sub {
  font-size: 11px;
  color: #aaa;
  margin-top: 4px;
}

/* 趋势 */
.metric-trend,
.metric-growth {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 4px;
}

.metric-growth {
  font-size: 14px;
}

.growth-num {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.trend-good {
  color: #52c41a;
}

.trend-bad {
  color: #ff4d4f;
}

.trend-neutral {
  color: #888;
}

/* ── 表格区 ────────────────────────────────────────────────────────── */
.tables-row {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.table-half {
  flex: 1;
  min-width: 0;
}

.table-header {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
  padding-left: 4px;
}

/* 进度条占比 */
.ratio-bar-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ratio-bar {
  height: 8px;
  background: #5b8ff9;
  border-radius: 4px;
  min-width: 2px;
  max-width: 100%;
  flex-shrink: 0;
}

.dataset-bar {
  background: #5ad8a6;
}

.ratio-label {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

/* ── 图表区 ────────────────────────────────────────────────────────── */
.charts-row {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.chart-half {
  flex: 1;
  min-width: 0;
}

.chart-label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
  padding-left: 4px;
}

.bar-chart {
  width: 100%;
  height: 280px;
}

/* ── 综合分析 ──────────────────────────────────────────────────────── */
.analysis-card {
  border-left: 4px solid #91caff;
  border-radius: 8px;
  background: #f0f8ff;
  margin-bottom: 8px;
}

.analysis-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a5fa8;
  margin-bottom: 12px;
}

.analysis-body {
  font-size: 14px;
  color: #333;
  line-height: 1.8;
}

.analysis-para {
  margin: 0 0 10px;
  text-indent: 2em;
}

.analysis-para:last-child {
  margin-bottom: 0;
}

/* ── 操作按钮 ──────────────────────────────────────────────────────── */
.report-actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* ── 机构只读显示 ───────────────────────────────────────────────────── */
.org-readonly-label {
  display: inline-block;
  padding: 0 12px;
  line-height: 32px;
  font-size: 14px;
  color: #333;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  min-width: 160px;
}

/* ── 打印样式 ──────────────────────────────────────────────────────── */
@media print {
  /* 隐藏非报告元素 */
  .no-print,
  .el-aside,
  .layout-sidebar,
  .sidebar,
  .topbar,
  .layout-topbar,
  .page-breadcrumb,
  .page-actions,
  .report-left-nav,
  .ctrl-card {
    display: none !important;
  }

  /* 让报告内容占满页面 */
  .report-main {
    overflow: visible !important;
  }

  .report-doc {
    max-width: 100% !important;
    padding: 20px !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }

  .report-layout {
    display: block !important;
    overflow: visible !important;
  }

  /* 强制换页保护 */
  .section-title {
    page-break-after: avoid;
  }

  .charts-row,
  .tables-row {
    page-break-inside: avoid;
  }

  /* 图表替换为 img（由 handlePrint 动态插入） */
  .gauge-chart,
  .bar-chart {
    display: none;
  }

  .chart-print-img {
    display: block !important;
  }
}
</style>
