/**
 * 月度报告演示数据
 * 包含基础信息和详细统计（规则类型分布、数据集分布、Top10）
 */

// 规则类型列表
const RULE_TYPES = [
  '空值检查', '值域检查', '格式检查', '唯一性检查',
  '规范检查', '关联检查', '时效性检查', '波动检查',
]

// 数据集列表
const DATASETS = [
  '患者基本信息', '门诊就诊记录', '住院就诊记录', '手术操作信息',
  '医嘱信息', '检验结果', '影像报告', '护理记录', '病案首页', '费用明细',
]

/**
 * 基于种子值生成伪随机数
 */
function pseudoRandom(seed) {
  let s = seed
  return function () {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

/**
 * 生成规则类型统计（按报告ID确定性生成）
 */
function generateRuleTypeStats(reportId, totalProblemCount) {
  const rng = pseudoRandom(reportId * 137)
  // 生成随机权重
  const weights = RULE_TYPES.map(() => rng())
  const total = weights.reduce((a, b) => a + b, 0)
  // 归一化为比例并取整
  let remaining = totalProblemCount
  const items = RULE_TYPES.map((type, i) => {
    const ratio = weights[i] / total
    const count = i < RULE_TYPES.length - 1
      ? Math.round(totalProblemCount * ratio)
      : remaining
    remaining -= count
    return { ruleType: type, count, ratio: parseFloat((ratio * 100).toFixed(1)) }
  })
  // 确保第一项比例最大（空值检查问题最多）
  items.sort((a, b) => b.count - a.count)
  return items
}

/**
 * 生成数据集统计（按报告ID确定性生成）
 */
function generateDatasetStats(reportId, totalProblemCount) {
  const rng = pseudoRandom(reportId * 251 + 7)
  const weights = DATASETS.map(() => rng())
  const total = weights.reduce((a, b) => a + b, 0)
  let remaining = totalProblemCount
  const items = DATASETS.map((name, i) => {
    const ratio = weights[i] / total
    const count = i < DATASETS.length - 1
      ? Math.round(totalProblemCount * ratio)
      : remaining
    remaining -= count
    return { datasetName: name, count, ratio: parseFloat((ratio * 100).toFixed(1)) }
  })
  items.sort((a, b) => b.count - a.count)
  return items
}

/**
 * 从 ruleTypeStats 提取 Top10（取前10，按count降序）
 */
function generateRuleTop10(ruleTypeStats) {
  return [...ruleTypeStats]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(item => ({ name: item.ruleType, count: item.count }))
}

/**
 * 从 datasetStats 提取 Top10
 */
function generateDatasetTop10(datasetStats) {
  return [...datasetStats]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(item => ({ name: item.datasetName, count: item.count }))
}

/**
 * 为报告生成质控时间范围和制表日期
 */
function generateDates(reportMonth, createTime) {
  const [year, month] = reportMonth.split('-').map(Number)
  const firstDay = `${reportMonth}-01`
  const lastDay = new Date(year, month, 0)
  const lastDayStr = `${reportMonth}-${String(lastDay.getDate()).padStart(2, '0')}`
  return {
    tableDate: createTime.split(' ')[0],
    qcStartDate: firstDay,
    qcEndDate: lastDayStr,
  }
}

/**
 * 基础报告列表（API list 返回）
 */
export const mockMonthlyReports = [
  {
    id: 1, orgId: 1, orgName: '达州市中医医院',
    reportMonth: '2026-04',
    score: 87.5,
    ranking: 2, totalOrgCount: 7,
    totalQcCount: 2340000,
    totalProblemCount: 29250,
    problemRatio: 1.25,
    lastMonthProblemRatio: 1.48,
    problemRatioGrowth: -0.23,
    mostProblemRuleType: '空值检查',
    mostProblemDataset: '患者基本信息',
    analysis: '本月数据质量总体呈改善趋势，问题占比环比下降0.23个百分点。主要问题集中在空值检查（占问题总数38%）和值域检查（占24%），建议重点整改患者基本信息表中的身份证号、联系电话字段的空值问题，以及性别代码、民族代码的值域不规范问题。手术操作信息表本月数据量波动超过阈值，请核实是否存在数据漏报情况。',
    createTime: '2026-05-01 02:30:00',
  },
  {
    id: 2, orgId: 2, orgName: '达州市中心医院',
    reportMonth: '2026-04',
    score: 82.3,
    ranking: 4, totalOrgCount: 7,
    totalQcCount: 2100000,
    totalProblemCount: 34560,
    problemRatio: 1.65,
    lastMonthProblemRatio: 1.52,
    problemRatioGrowth: 0.13,
    mostProblemRuleType: '值域检查',
    mostProblemDataset: '门诊就诊记录',
    analysis: '本月数据质量有所下降，问题占比环比上升0.13个百分点。门诊就诊记录表的值域检查问题增加明显，建议加强医生端数据录入培训，强化就诊类型、诊断代码等字段的规范性。',
    createTime: '2026-05-01 03:15:00',
  },
  {
    id: 3, orgId: 3, orgName: '通川区人民医院',
    reportMonth: '2026-04',
    score: 91.2,
    ranking: 1, totalOrgCount: 7,
    totalQcCount: 1850000,
    totalProblemCount: 18500,
    problemRatio: 1.0,
    lastMonthProblemRatio: 1.15,
    problemRatioGrowth: -0.15,
    mostProblemRuleType: '规范检查',
    mostProblemDataset: '患者基本信息',
    analysis: '本月数据质量最优，问题占比为全市最低。整体数据质量良好，建议将该院的数据管理经验在全市推广。',
    createTime: '2026-05-01 04:00:00',
  },
  {
    id: 4, orgId: 1, orgName: '达州市中医医院',
    reportMonth: '2026-05',
    score: 89.8,
    ranking: 1, totalOrgCount: 7,
    totalQcCount: 2450000,
    totalProblemCount: 27820,
    problemRatio: 1.14,
    lastMonthProblemRatio: 1.25,
    problemRatioGrowth: -0.11,
    mostProblemRuleType: '空值检查',
    mostProblemDataset: '患者基本信息',
    analysis: '本月数据质量持续改善，问题占比环比下降0.11个百分点。空值检查问题数量有所减少，说明前期整改措施取得效果。建议继续加强数据管理，特别是关键字段的完整性。',
    createTime: '2026-05-24 10:30:00',
  },
  {
    id: 5, orgId: 2, orgName: '达州市中心医院',
    reportMonth: '2026-05',
    score: 78.6,
    ranking: 5, totalOrgCount: 7,
    totalQcCount: 2200000,
    totalProblemCount: 41800,
    problemRatio: 1.9,
    lastMonthProblemRatio: 1.65,
    problemRatioGrowth: 0.25,
    mostProblemRuleType: '值域检查',
    mostProblemDataset: '住院就诊记录',
    analysis: '本月数据质量下降明显，问题占比环比上升0.25个百分点，需重点关注。住院就诊记录表的值域检查问题显著增加，建议尽快排查数据录入系统，确认是否存在系统性错误，并在下月初完成整改。',
    createTime: '2026-05-24 11:00:00',
  },
  {
    id: 6, orgId: 3, orgName: '通川区人民医院',
    reportMonth: '2026-05',
    score: 93.5,
    ranking: 1, totalOrgCount: 7,
    totalQcCount: 1920000,
    totalProblemCount: 15360,
    problemRatio: 0.8,
    lastMonthProblemRatio: 1.0,
    problemRatioGrowth: -0.20,
    mostProblemRuleType: '格式检查',
    mostProblemDataset: '检验结果',
    analysis: '本月数据质量进一步提升，评分创历史新高。格式检查问题主要集中在检验结果报告的日期格式不统一，建议更新检验系统的输出格式配置，可彻底解决该类问题。',
    createTime: '2026-05-24 12:00:00',
  },
]

/**
 * 获取报告详情（含统计图表数据）
 */
export function getMockReportDetail(id) {
  const base = mockMonthlyReports.find(r => r.id === Number(id))
  if (!base) return null

  const ruleTypeStats = generateRuleTypeStats(base.id, base.totalProblemCount)
  const datasetStats = generateDatasetStats(base.id, base.totalProblemCount)
  const dates = generateDates(base.reportMonth, base.createTime)

  return {
    ...base,
    ...dates,
    ruleTypeStats,
    datasetStats,
    ruleTop10: generateRuleTop10(ruleTypeStats),
    datasetTop10: generateDatasetTop10(datasetStats),
  }
}
