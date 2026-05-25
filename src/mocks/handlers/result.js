import { http, HttpResponse } from 'msw'
import { mockDelay, mockPaginate, createMockBlob } from '../utils.js'
import {
  getDetails,
  updateFix,
  batchFix,
  getDetail,
  getFixHistoryById,
} from '../store/resultStore.js'
import { mockRules } from '../data/rules.js'
import { mockResultDetails } from '../data/resultDetails.js'
import { mockDatasets } from '../data/datasets.js'

// Deterministic pseudo-random helpers (so charts/by-rule stable across reloads)
const rng = (seed) => {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function buildIssueRatioTrend(orgId, statMonth) {
  const r = rng((orgId || 0) * 1000 + (statMonth ? statMonth.length : 1))
  const months = []
  const base = statMonth ? new Date(statMonth + '-01') : new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const data = months.map(() => Number((0.6 + r() * 1.5).toFixed(2)))
  return { months, data }
}

// Org-specific category distribution weights (deterministic by orgId)
const ORG_CATEGORY_WEIGHTS = {
  0: [38, 24, 16, 10, 6, 4, 1, 1],   // global
  1: [42, 20, 18, 8,  6, 3, 2, 1],   // 达州市中医医院 - 空值问题多
  2: [28, 35, 12, 12, 7, 4, 1, 1],   // 达州市中心医院 - 值域问题多
  3: [30, 22, 26, 10, 6, 4, 1, 1],   // 通川区人民医院 - 规范问题多
  4: [35, 18, 15, 14, 8, 6, 3, 1],   // 通川区社区卫生服务中心
  5: [32, 25, 14, 14, 8, 4, 2, 1],   // 达县人民医院
  6: [40, 20, 16, 10, 7, 4, 2, 1],   // 宣汉县人民医院
  7: [36, 22, 18, 12, 6, 3, 2, 1],   // 开江县中医院
}

const CATEGORY_NAMES = ['空值检查','值域检查','规范检查','逻辑检查','关联性检查','完整性检查','一致性检查','及时性检查']

function buildCategoryPie(orgId) {
  const numOrgId = orgId ? Number(orgId) : 0
  const weights = ORG_CATEGORY_WEIGHTS[numOrgId] || ORG_CATEGORY_WEIGHTS[0]
  const baseCounts = { 0: 89430, 1: 76500, 2: 62800, 3: 45200, 4: 38900, 5: 52100, 6: 41300, 7: 33600 }
  const base = baseCounts[numOrgId] || 89430
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  return CATEGORY_NAMES.map((name, i) => ({
    name,
    value: Math.round(base * weights[i] / totalWeight),
  }))
}

// Deterministic dataset ranking per org
const DATASET_BASE_ISSUES = {
  '患者基本信息': 89430,
  '门诊就诊记录': 56780,
  '住院入院信息': 34210,
  '住院出院信息': 28900,
  '门诊处方主表': 21560,
  '住院医嘱信息': 18340,
  '检查检验结果': 15670,
  '住院病案首页': 12890,
  '手术操作信息': 9570,
  '住院诊断信息': 7230,
}

function buildDatasetRanking(orgId) {
  const numOrgId = orgId ? Number(orgId) : 0
  const rng2 = rng((numOrgId + 1) * 7919)
  return Object.entries(DATASET_BASE_ISSUES).map(([datasetName, baseCount]) => ({
    datasetName,
    // Each org has a slightly different distribution (±40%)
    issueCount: Math.round(baseCount * (0.6 + rng2() * 0.8)),
  })).sort((a, b) => b.issueCount - a.issueCount).slice(0, 10)
}

function buildByRuleStats({ datasetId, categoryId, ruleId, ruleLevels }) {
  // Aggregate problems per rule
  const ruleStats = {}
  for (const d of mockResultDetails) {
    if (datasetId && d.datasetId !== Number(datasetId)) continue
    if (categoryId && !mockRules.find(r => r.id === d.ruleId && r.categoryId === Number(categoryId))) continue
    if (ruleId && d.ruleId !== Number(ruleId)) continue
    if (ruleLevels && ruleLevels.length && !ruleLevels.includes(d.ruleLevel)) continue
    if (!ruleStats[d.ruleId]) {
      ruleStats[d.ruleId] = {
        ruleId: d.ruleId,
        ruleName: d.ruleName,
        ruleCategoryName: d.ruleCategoryName,
        ruleLevel: d.ruleLevel,
        problemCount: 0,
        fixedCount: 0,
      }
    }
    ruleStats[d.ruleId].problemCount += 1
    if (d.isFixed === 2) ruleStats[d.ruleId].fixedCount += 1
  }
  // Inflate counts to look realistic and add checkTotal/ratios
  const records = Object.values(ruleStats).map((r, idx) => {
    const problem = r.problemCount * 87 + 23 + idx * 11
    const fixed = Math.floor(problem * (0.5 + Math.random() * 0.4))
    const checkTotal = problem * 10 + 1500 + idx * 200
    return {
      ruleId: r.ruleId,
      ruleName: r.ruleName,
      ruleCategoryName: r.ruleCategoryName,
      ruleLevel: r.ruleLevel,
      checkTotal,
      problemCount: problem,
      problemRatio: Number(((problem / checkTotal) * 100).toFixed(2)),
      fixedCount: fixed,
      fixedRatio: Number(((fixed / problem) * 100).toFixed(2)),
    }
  })
  // Sort by category, then by problemCount desc
  records.sort((a, b) => {
    if (a.ruleCategoryName !== b.ruleCategoryName) {
      return a.ruleCategoryName.localeCompare(b.ruleCategoryName)
    }
    return b.problemCount - a.problemCount
  })
  return records
}

export const resultHandlers = [
  http.get('/api/result/summary', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const orgId = url.searchParams.get('orgId')

    // Org-specific summary data
    const ORG_SUMMARY = {
      0:  { totalCheckCount: 18750000, totalCheckCountChange: 8.4,  totalProblemCount: 234560, totalProblemCountChange: -3.1,  problemRatio: 1.25, problemRatioChange: -0.23, fixedRate: 67.3, fixedRateChange: 5.2,  monthNewProblem: 12300, monthNewProblemChange: -8.6 },
      1:  { totalCheckCount: 2340000,  totalCheckCountChange: 5.2,  totalProblemCount: 29250,  totalProblemCountChange: -4.2,  problemRatio: 1.25, problemRatioChange: -0.23, fixedRate: 72.1, fixedRateChange: 3.8,  monthNewProblem: 1820,  monthNewProblemChange: -6.3 },
      2:  { totalCheckCount: 2100000,  totalCheckCountChange: 3.1,  totalProblemCount: 41800,  totalProblemCountChange: 12.1, problemRatio: 1.99, problemRatioChange: 0.25,  fixedRate: 51.3, fixedRateChange: -2.1, monthNewProblem: 3450,  monthNewProblemChange: 18.2 },
      3:  { totalCheckCount: 1850000,  totalCheckCountChange: 7.8,  totalProblemCount: 15360,  totalProblemCountChange: -15.3, problemRatio: 0.83, problemRatioChange: -0.20, fixedRate: 88.5, fixedRateChange: 8.4,  monthNewProblem: 920,   monthNewProblemChange: -15.1 },
      4:  { totalCheckCount: 980000,   totalCheckCountChange: 2.3,  totalProblemCount: 23800,  totalProblemCountChange: 5.6,  problemRatio: 2.43, problemRatioChange: 0.18,  fixedRate: 44.2, fixedRateChange: 1.2,  monthNewProblem: 2100,  monthNewProblemChange: 7.4 },
      5:  { totalCheckCount: 1560000,  totalCheckCountChange: 4.5,  totalProblemCount: 35200,  totalProblemCountChange: 8.3,  problemRatio: 2.26, problemRatioChange: 0.33,  fixedRate: 48.7, fixedRateChange: -1.5, monthNewProblem: 2890,  monthNewProblemChange: 11.2 },
      6:  { totalCheckCount: 1200000,  totalCheckCountChange: 1.8,  totalProblemCount: 52800,  totalProblemCountChange: 22.5, problemRatio: 4.40, problemRatioChange: 1.12,  fixedRate: 28.3, fixedRateChange: -8.9, monthNewProblem: 6120,  monthNewProblemChange: 34.5 },
      7:  { totalCheckCount: 890000,   totalCheckCountChange: -2.1, totalProblemCount: 18900,  totalProblemCountChange: -5.8, problemRatio: 2.12, problemRatioChange: -0.15, fixedRate: 61.5, fixedRateChange: 4.2,  monthNewProblem: 1560,  monthNewProblemChange: -3.8 },
    }
    const numOrgId = orgId ? Number(orgId) : 0
    const summaryData = ORG_SUMMARY[numOrgId] || ORG_SUMMARY[0]

    if (type === 'overview') {
      return HttpResponse.json({ code: 200, message: '成功', data: summaryData })
    }

    // Fallback: Dashboard summary
    return HttpResponse.json({
      code: 200, message: '成功',
      data: {
        totalChecks: summaryData.totalCheckCount,
        totalChecksMoM: summaryData.totalCheckCountChange,
        totalIssues: summaryData.totalProblemCount,
        totalIssuesMoM: summaryData.totalProblemCountChange,
        issueRatio: summaryData.problemRatio,
        issueRatioMoM: summaryData.problemRatioChange,
        rectificationRate: summaryData.fixedRate,
        rectificationRateMoM: summaryData.fixedRateChange,
      },
    })
  }),

  http.get('/api/result/chart/trend', async () => {
    await mockDelay()
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return `${d.getMonth() + 1}/${d.getDate()}`
    })
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: {
        dates,
        series: [
          { name: '达州市中医医院',   data: [120, 135, 142, 138, 156, 161, 175] },
          { name: '达州市中心医院',   data: [98, 102, 110, 115, 108, 120, 128] },
          { name: '通川区人民医院',   data: [76, 82, 79, 88, 92, 95, 101] },
          { name: '通川区社区卫生服务中心', data: [45, 48, 52, 50, 55, 58, 62] },
        ],
      },
    })
  }),

  http.get('/api/result/chart/type-dist', async () => {
    await mockDelay()
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: [
        { name: '非空校验',   value: 8542 },
        { name: '值域校验',   value: 5231 },
        { name: '格式校验',   value: 3876 },
        { name: '关联校验',   value: 2145 },
        { name: '逻辑校验',   value: 1320 },
      ],
    })
  }),

  // ── 6.1 Overview chart endpoints ─────────────────────────────────
  http.get('/api/result/chart/issue-ratio-trend', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const orgId = url.searchParams.get('orgId')
    const statMonth = url.searchParams.get('statMonth')
    const data = buildIssueRatioTrend(orgId, statMonth)
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data,
    })
  }),

  http.get('/api/result/chart/category-pie', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const orgId = url.searchParams.get('orgId')
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: buildCategoryPie(orgId),
    })
  }),

  http.get('/api/result/chart/dataset-ranking', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const orgId = url.searchParams.get('orgId')
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: buildDatasetRanking(orgId),
    })
  }),

  http.get('/api/result/org-ranking', async () => {
    await mockDelay()
    return HttpResponse.json({
      code: 200,
      message: '成功',
      // Scores strictly decrease with rank (no inversions)
      data: [
        { rank: 1, orgId: 3, orgName: '通川区人民医院',             score: 94.8, issueRatio: 0.80, rectificationRate: 93 },
        { rank: 2, orgId: 1, orgName: '达州市中医医院',             score: 89.8, issueRatio: 1.14, rectificationRate: 77 },
        { rank: 3, orgId: 7, orgName: '开江县中医院',               score: 88.3, issueRatio: 1.10, rectificationRate: 79 },
        { rank: 4, orgId: 2, orgName: '达州市中心医院',             score: 78.6, issueRatio: 1.90, rectificationRate: 51 },
        { rank: 5, orgId: 5, orgName: '达县人民医院',               score: 74.5, issueRatio: 3.00, rectificationRate: 44 },
        { rank: 6, orgId: 6, orgName: '宣汉县人民医院',             score: 62.1, issueRatio: 6.00, rectificationRate: 28 },
        { rank: 7, orgId: 4, orgName: '通川区社区卫生服务中心',     score: 55.8, issueRatio: 8.00, rectificationRate: 29 },
      ],
    })
  }),

  http.get('/api/result/alerts', async () => {
    await mockDelay()
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: [
        { id: 1, ruleName: '患者姓名非空检查',       orgName: '达州市中医医院',     datasetName: '门诊记录表',   time: '10分钟前' },
        { id: 2, ruleName: '身份证号格式验证',       orgName: '达州市中心医院',     datasetName: '患者基本信息', time: '32分钟前' },
        { id: 3, ruleName: '出院日期早于入院日期',  orgName: '通川区人民医院',     datasetName: '住院记录表',   time: '1小时前' },
        { id: 4, ruleName: '诊断代码值域校验',       orgName: '达川区人民医院',     datasetName: '诊断记录表',   time: '2小时前' },
        { id: 5, ruleName: '科室代码非空检查',       orgName: '通川区社区卫生服务中心', datasetName: '门诊记录表',  time: '3小时前' },
      ],
    })
  }),

  // ── 6.2 By-rule ──────────────────────────────────────────────────
  http.get('/api/result/by-rule', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20
    const datasetId = url.searchParams.get('datasetId')
    const categoryId = url.searchParams.get('categoryId')
    const ruleId = url.searchParams.get('ruleId')
    const ruleLevelsParam = url.searchParams.get('ruleLevels')
    const ruleLevels = ruleLevelsParam
      ? ruleLevelsParam.split(',').map(Number).filter(Boolean)
      : null

    const records = buildByRuleStats({ datasetId, categoryId, ruleId, ruleLevels })
    const result = mockPaginate(records, page, size)
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: result,
    })
  }),

  http.get('/api/result/by-rule/export', async () => {
    await mockDelay(1500, 2500)
    const blob = createMockBlob('按规则统计.xlsx')
    return new HttpResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=result_by_rule_export.xlsx',
      },
    })
  }),

  // ── 6.3 Detail ────────────────────────────────────────────────────
  http.get('/api/result/detail', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20
    let details = [...getDetails()]

    const isFixed = url.searchParams.get('isFixed')
    if (isFixed !== null && isFixed !== '') {
      details = details.filter(d => d.isFixed === Number(isFixed))
    }

    const ruleId = url.searchParams.get('ruleId')
    if (ruleId) details = details.filter(d => d.ruleId === Number(ruleId))

    const datasetId = url.searchParams.get('datasetId')
    if (datasetId) details = details.filter(d => d.datasetId === Number(datasetId))

    // orgId filter (for non-global users, or when explicitly filtering)
    const orgId = url.searchParams.get('orgId')
    if (orgId) details = details.filter(d => d.orgId === Number(orgId))

    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    if (startDate) details = details.filter(d => d.createTime >= startDate)
    if (endDate) details = details.filter(d => d.createTime <= endDate + ' 23:59:59')

    const result = mockPaginate(details, page, size)
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: result,
    })
  }),

  http.put('/api/result/detail/batch-fix', async ({ request }) => {
    await mockDelay()
    const { ids, isFixed, fixDescription } = await request.json()
    batchFix(ids, isFixed, fixDescription)
    return HttpResponse.json({
      code: 200,
      message: '批量整改成功',
      data: { count: ids.length },
    })
  }),

  http.put('/api/result/detail/:id/fix', async ({ params, request }) => {
    await mockDelay()
    const { id } = params
    const { isFixed, fixDescription } = await request.json()
    const updated = updateFix(Number(id), isFixed, fixDescription)
    return HttpResponse.json({
      code: 200,
      message: '已提交整改，系统将自动复检',
      data: updated,
    })
  }),

  http.get('/api/result/detail/:id/business-data', async ({ params }) => {
    await mockDelay()
    const { id } = params
    const detail = getDetail(id)
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: {
        detailId: id,
        datasetName: detail?.datasetName || '数据集',
        problemElementCode: detail?.elementCode || '',
        data: {
          'BRID': '10023456',
          'XM': detail?.elementCode === 'XM' ? (detail?.problemValue || '') : '张三',
          'XBM': detail?.elementCode === 'XBM' ? (detail?.problemValue || '') : '1',
          'CSRQ': '1990-05-15',
          'SFZHM': detail?.elementCode === 'SFZHM' ? (detail?.problemValue || '') : '511701199005151234',
          'GXDW': '达州市某某医院',
          'LXDH': detail?.elementCode === 'LXDH' ? (detail?.problemValue || '') : '13800000000',
          'MZDM': detail?.elementCode === 'MZDM' ? (detail?.problemValue || '') : '01',
          'GJDM': '156',
          'HYZKDM': '2',
          'ZDDM': detail?.elementCode === 'ZDDM' ? (detail?.problemValue || '') : 'J18.9',
        },
      },
    })
  }),

  http.get('/api/result/detail/:id/fix-history', async ({ params }) => {
    await mockDelay()
    const { id } = params
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: getFixHistoryById(id),
    })
  }),
]
