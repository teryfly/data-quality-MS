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

function buildCategoryPie() {
  // Group existing mock result details by category
  const map = {}
  for (const d of mockResultDetails) {
    map[d.ruleCategoryName] = (map[d.ruleCategoryName] || 0) + 1
  }
  // Inflate to look realistic
  return Object.entries(map).map(([name, v]) => ({
    name,
    value: v * 287 + Math.floor(Math.random() * 50),
  }))
}

function buildDatasetRanking() {
  const map = {}
  for (const d of mockResultDetails) {
    map[d.datasetName] = (map[d.datasetName] || 0) + 1
  }
  // Top 10 datasets, ensure 10 entries
  const arr = Object.entries(map).map(([name, v]) => ({
    datasetName: name,
    issueCount: v * 415 + Math.floor(Math.random() * 200),
  }))
  // Pad if fewer than 10 from existing datasets
  if (arr.length < 10) {
    const extras = mockDatasets
      .filter(ds => !arr.some(a => a.datasetName === ds.datasetName))
      .slice(0, 10 - arr.length)
    extras.forEach(ds => {
      arr.push({
        datasetName: ds.datasetName,
        issueCount: 50 + Math.floor(Math.random() * 800),
      })
    })
  }
  return arr
    .sort((a, b) => b.issueCount - a.issueCount)
    .slice(0, 10)
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

    if (type === 'overview') {
      return HttpResponse.json({
        code: 200,
        message: '成功',
        data: {
          totalCheckCount: 18750000,
          totalCheckCountChange: 8.4,
          totalProblemCount: 234560,
          totalProblemCountChange: -3.1,
          problemRatio: 1.25,
          problemRatioChange: -0.23,
          fixedRate: 67.3,
          fixedRateChange: 5.2,
          monthNewProblem: 12300,
          monthNewProblemChange: -8.6,
        },
      })
    }

    // Fallback: Dashboard summary
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: {
        totalChecks: 18750000,
        totalChecksMoM: 8.4,
        totalIssues: 234560,
        totalIssuesMoM: -3.1,
        issueRatio: 1.25,
        issueRatioMoM: -0.23,
        rectificationRate: 67.3,
        rectificationRateMoM: 5.2,
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

  http.get('/api/result/chart/category-pie', async () => {
    await mockDelay()
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: buildCategoryPie(),
    })
  }),

  http.get('/api/result/chart/dataset-ranking', async () => {
    await mockDelay()
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: buildDatasetRanking(),
    })
  }),

  http.get('/api/result/org-ranking', async () => {
    await mockDelay()
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: [
        { rank: 1, orgName: '达州市中医医院',           score: 95.2, issueRatio: 0.8,  rectificationRate: 92 },
        { rank: 2, orgName: '达州市中心医院',           score: 91.4, issueRatio: 1.1,  rectificationRate: 88 },
        { rank: 3, orgName: '通川区人民医院',           score: 87.6, issueRatio: 1.6,  rectificationRate: 81 },
        { rank: 4, orgName: '达川区人民医院',           score: 82.3, issueRatio: 2.0,  rectificationRate: 74 },
        { rank: 5, orgName: '通川区社区卫生服务中心', score: 76.8, issueRatio: 2.8,  rectificationRate: 65 },
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
