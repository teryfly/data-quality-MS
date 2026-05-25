/**
 * 月度报告演示数据
 * 8家医院 × 2个月报告（2026-04 / 2026-05）
 * 排名合理：每月每家机构排名唯一，且有"负面教材"（大竹县人民医院稳居末位）
 */

const RULE_TYPES = [
  '空值检查', '值域检查', '格式检查', '唯一性检查',
  '规范检查', '关联检查', '时效性检查', '波动检查',
]

const DATASETS = [
  '患者基本信息', '门诊就诊记录', '住院入院信息', '住院出院信息',
  '门诊处方主表', '住院医嘱信息', '检查检验结果', '住院病案首页',
  '手术操作信息', '住院诊断信息',
]

function pseudoRandom(seed) {
  let s = seed
  return function () {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function generateRuleTypeStats(reportId, totalProblemCount) {
  const rng = pseudoRandom(reportId * 137)
  const weights = RULE_TYPES.map(() => rng())
  const total = weights.reduce((a, b) => a + b, 0)
  let remaining = totalProblemCount
  const items = RULE_TYPES.map((type, i) => {
    const ratio = weights[i] / total
    const count = i < RULE_TYPES.length - 1
      ? Math.round(totalProblemCount * ratio)
      : remaining
    remaining -= count
    return { ruleType: type, count, ratio: parseFloat((ratio * 100).toFixed(1)) }
  })
  items.sort((a, b) => b.count - a.count)
  return items
}

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

function generateRuleTop10(ruleTypeStats) {
  return [...ruleTypeStats].sort((a, b) => b.count - a.count).slice(0, 10)
    .map(item => ({ name: item.ruleType, count: item.count }))
}

function generateDatasetTop10(datasetStats) {
  return [...datasetStats].sort((a, b) => b.count - a.count).slice(0, 10)
    .map(item => ({ name: item.datasetName, count: item.count }))
}

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
 * 基础报告列表
 * 2026-04 排名（8家）：1通川区人民医院 2开江县中医院 3达州市中医医院 4达州市中心医院
 *                      5达县人民医院 6宣汉县人民医院 7通川区社区卫生中心 8大竹县人民医院
 * 2026-05 排名（7家，大竹禁用后继续参与历史排名）同样区分
 *
 * 大竹县人民医院作为"负面教材"：评分最低、问题率最高、整改率最低、分析中有整改建议
 */
export const mockMonthlyReports = [
  // ════════════════════════════════ 2026-04 ════════════════════════════════
  {
    id: 1, orgId: 3, orgName: '通川区人民医院',
    reportMonth: '2026-04', score: 93.1,
    ranking: 1, totalOrgCount: 8,
    totalQcCount: 1850000, totalProblemCount: 18500,
    problemRatio: 1.00, lastMonthProblemRatio: 1.15, problemRatioGrowth: -0.15,
    mostProblemRuleType: '规范检查', mostProblemDataset: '患者基本信息',
    analysis: '本月数据质量位居全市第一，问题占比仅1.00%，为全市最优水平。主要问题集中在规范检查（身份证格式、联系电话格式），占问题总数32%。建议继续保持当前数据管理水平，并将成功经验（尤其是数据录入前置校验机制）分享给其他医疗机构参考。整改率达91.2%，是全市整改最积极的机构。',
    createTime: '2026-05-01 04:00:00',
  },
  {
    id: 2, orgId: 7, orgName: '开江县中医院',
    reportMonth: '2026-04', score: 89.6,
    ranking: 2, totalOrgCount: 8,
    totalQcCount: 890000, totalProblemCount: 21360,
    problemRatio: 1.20, lastMonthProblemRatio: 1.38, problemRatioGrowth: -0.18,
    mostProblemRuleType: '空值检查', mostProblemDataset: '门诊就诊记录',
    analysis: '本月数据质量位列全市第二，较上月改善明显。空值检查问题主要集中在门诊就诊记录的科室代码、诊断代码字段，建议在HIS系统端增加必填校验。整改率79.3%，有进一步提升空间。',
    createTime: '2026-05-01 04:30:00',
  },
  {
    id: 3, orgId: 1, orgName: '达州市中医医院',
    reportMonth: '2026-04', score: 87.5,
    ranking: 3, totalOrgCount: 8,
    totalQcCount: 2340000, totalProblemCount: 29250,
    problemRatio: 1.25, lastMonthProblemRatio: 1.48, problemRatioGrowth: -0.23,
    mostProblemRuleType: '空值检查', mostProblemDataset: '患者基本信息',
    analysis: '本月数据质量总体呈改善趋势，问题占比环比下降0.23个百分点，进步显著。主要问题集中在空值检查（占38%）和值域检查（占24%），建议重点整改患者基本信息表中的身份证号、联系电话字段空值问题，以及性别代码、民族代码的值域不规范问题。手术操作信息表本月数据量波动超过阈值，请核实是否存在漏报情况。',
    createTime: '2026-05-01 02:30:00',
  },
  {
    id: 4, orgId: 2, orgName: '达州市中心医院',
    reportMonth: '2026-04', score: 82.3,
    ranking: 4, totalOrgCount: 8,
    totalQcCount: 2100000, totalProblemCount: 34560,
    problemRatio: 1.65, lastMonthProblemRatio: 1.52, problemRatioGrowth: 0.13,
    mostProblemRuleType: '值域检查', mostProblemDataset: '门诊就诊记录',
    analysis: '本月数据质量有所下降，问题占比环比上升0.13个百分点，排名较上月下滑一位。门诊就诊记录表的值域检查问题增加明显，建议加强医生端数据录入培训，强化就诊类型、诊断代码等字段的规范性。整改率仅58.1%，低于全市平均水平，请加快推进问题整改进度。',
    createTime: '2026-05-01 03:15:00',
  },
  {
    id: 5, orgId: 5, orgName: '达县人民医院',
    reportMonth: '2026-04', score: 76.8,
    ranking: 5, totalOrgCount: 8,
    totalQcCount: 1560000, totalProblemCount: 42120,
    problemRatio: 2.70, lastMonthProblemRatio: 2.45, problemRatioGrowth: 0.25,
    mostProblemRuleType: '空值检查', mostProblemDataset: '患者基本信息',
    analysis: '本月数据质量持续下降，问题占比已连续2个月上升，需重点关注。空值检查和值域检查问题合计占总问题数的61%，主要集中在患者基本信息表。建议启动数据质量专项整治，重点核查身份证号、民族代码、就诊类型等高频问题字段，并将整改率从当前的44%提升至60%以上。',
    createTime: '2026-05-01 05:00:00',
  },
  {
    id: 6, orgId: 6, orgName: '宣汉县人民医院',
    reportMonth: '2026-04', score: 71.2,
    ranking: 6, totalOrgCount: 8,
    totalQcCount: 1200000, totalProblemCount: 55200,
    problemRatio: 4.60, lastMonthProblemRatio: 3.80, problemRatioGrowth: 0.80,
    mostProblemRuleType: '波动检查', mostProblemDataset: '门诊就诊记录',
    analysis: '本月数据质量排名全市第六，问题占比高达4.60%，较上月大幅上升0.80个百分点，情况较为严峻。门诊就诊数据量异常波动（环比+68%）触发大量波动检查预警，请核实是否存在历史数据补录行为并说明原因。建议立即组织数据治理专项行动，重点整改值域检查和完整性检查中的高频问题。',
    createTime: '2026-05-01 05:30:00',
  },
  {
    id: 7, orgId: 4, orgName: '通川区社区卫生服务中心',
    reportMonth: '2026-04', score: 65.4,
    ranking: 7, totalOrgCount: 8,
    totalQcCount: 980000, totalProblemCount: 67620,
    problemRatio: 6.90, lastMonthProblemRatio: 5.80, problemRatioGrowth: 1.10,
    mostProblemRuleType: '空值检查', mostProblemDataset: '门诊就诊记录',
    analysis: '本月数据质量问题突出，问题占比高达6.90%，较上月上升1.10个百分点，整改率仅36.8%，位居全市末二。数据及时性问题尤为严重，大量就诊记录存在超过3天的上报延迟。建议：①立即排查信息系统数据采集模块是否存在功能故障；②加强数据管理人员技能培训；③建立日级数据上报制度，避免数据积压。',
    createTime: '2026-05-01 06:00:00',
  },
  {
    id: 8, orgId: 8, orgName: '大竹县人民医院',
    reportMonth: '2026-04', score: 48.2,
    ranking: 8, totalOrgCount: 8,
    totalQcCount: 760000, totalProblemCount: 91200,
    problemRatio: 12.00, lastMonthProblemRatio: 10.50, problemRatioGrowth: 1.50,
    mostProblemRuleType: '空值检查', mostProblemDataset: '患者基本信息',
    analysis: '【重点关注 · 全市末位】本月数据质量综合评分仅48.2分，在全市8家参评机构中排名最末。问题占比高达12.00%，较上月继续恶化。主要问题：①患者基本信息表空值率高达35%，姓名、身份证号等关键字段大量缺失；②性别代码、民族代码等值域错误高频出现（占问题总数28%）；③数据完整性极差，处方主从表匹配率仅62%；④整改率仅18.5%，整改推进严重滞后。紧急建议：尽快组织数据质控专项整改，在下月报告前完成不少于50%的存量问题整改，否则将影响医院质控评级。',
    createTime: '2026-05-01 07:00:00',
  },

  // ════════════════════════════════ 2026-05 ════════════════════════════════
  {
    id: 9, orgId: 3, orgName: '通川区人民医院',
    reportMonth: '2026-05', score: 94.8,
    ranking: 1, totalOrgCount: 7,
    totalQcCount: 1920000, totalProblemCount: 15360,
    problemRatio: 0.80, lastMonthProblemRatio: 1.00, problemRatioGrowth: -0.20,
    mostProblemRuleType: '格式检查', mostProblemDataset: '检查检验结果',
    analysis: '本月数据质量进一步提升，评分创历史新高，连续两月稳居全市第一。格式检查问题主要集中在检验结果报告的日期格式不统一，建议更新检验系统的输出格式配置，可从根本上解决该类问题。整改率达93.5%，继续保持全市最高水平。',
    createTime: '2026-05-24 12:00:00',
  },
  {
    id: 10, orgId: 7, orgName: '开江县中医院',
    reportMonth: '2026-05', score: 88.3,
    ranking: 2, totalOrgCount: 7,
    totalQcCount: 920000, totalProblemCount: 19320,
    problemRatio: 1.10, lastMonthProblemRatio: 1.20, problemRatioGrowth: -0.10,
    mostProblemRuleType: '空值检查', mostProblemDataset: '门诊就诊记录',
    analysis: '本月数据质量持续改善，连续两月排名第二，整体态势良好。空值检查问题数量同比减少约9.6%，整改措施见效。建议进一步针对科室代码、诊断代码字段完善前置录入校验逻辑，争取下月突破90分门槛。',
    createTime: '2026-05-24 10:00:00',
  },
  {
    id: 11, orgId: 1, orgName: '达州市中医医院',
    reportMonth: '2026-05', score: 89.8,
    ranking: 3, totalOrgCount: 7,
    totalQcCount: 2450000, totalProblemCount: 27820,
    problemRatio: 1.14, lastMonthProblemRatio: 1.25, problemRatioGrowth: -0.11,
    mostProblemRuleType: '空值检查', mostProblemDataset: '患者基本信息',
    analysis: '本月数据质量持续改善，问题占比环比下降0.11个百分点。空值检查问题数量有所减少，说明前期整改措施取得效果。建议继续加强数据管理，特别是关键字段的完整性，争取下月进入全市前两名。整改率达到77.4%，较上月提升5.3个百分点。',
    createTime: '2026-05-24 10:30:00',
  },
  {
    id: 12, orgId: 5, orgName: '达县人民医院',
    reportMonth: '2026-05', score: 74.5,
    ranking: 4, totalOrgCount: 7,
    totalQcCount: 1620000, totalProblemCount: 48600,
    problemRatio: 3.00, lastMonthProblemRatio: 2.70, problemRatioGrowth: 0.30,
    mostProblemRuleType: '值域检查', mostProblemDataset: '患者基本信息',
    analysis: '本月数据质量连续三月下降，问题占比达到近期峰值3.00%，已从上月第5名下滑至第4名。值域检查问题数量大幅增加，尤其是民族代码、就诊类型字段的错误率居高不下。请于本月内完成整改计划制定并提交至卫健委数据管理部门备案。',
    createTime: '2026-05-24 11:00:00',
  },
  {
    id: 13, orgId: 2, orgName: '达州市中心医院',
    reportMonth: '2026-05', score: 78.6,
    ranking: 5, totalOrgCount: 7,
    totalQcCount: 2200000, totalProblemCount: 41800,
    problemRatio: 1.90, lastMonthProblemRatio: 1.65, problemRatioGrowth: 0.25,
    mostProblemRuleType: '值域检查', mostProblemDataset: '住院出院信息',
    analysis: '本月数据质量下降明显，问题占比环比上升0.25个百分点，较上月排名下滑一位至第5名，需重点关注。住院出院信息的值域检查问题显著增加，建议尽快排查住院系统数据录入模块，确认是否存在系统性配置错误，并在下月初完成整改。整改率51.3%，低于全市平均水平。',
    createTime: '2026-05-24 11:00:00',
  },
  {
    id: 14, orgId: 6, orgName: '宣汉县人民医院',
    reportMonth: '2026-05', score: 62.1,
    ranking: 6, totalOrgCount: 7,
    totalQcCount: 1250000, totalProblemCount: 75000,
    problemRatio: 6.00, lastMonthProblemRatio: 4.60, problemRatioGrowth: 1.40,
    mostProblemRuleType: '完整性检查', mostProblemDataset: '门诊处方主表',
    analysis: '【需立即关注】本月数据质量急剧恶化，问题占比高达6.00%，较上月再度上升1.40个百分点，连续两月大幅恶化，位居倒数第二。完整性检查问题激增（处方主从表匹配率仅68%），表明数据采集链路存在系统性故障。紧急建议：①本周内组织数据管理团队进行技术排查；②停止批量数据补录操作，待核查完毕后有序恢复；③下月报告前须将问题占比降至4%以下，否则将申请上级介入。',
    createTime: '2026-05-24 12:30:00',
  },
  {
    id: 15, orgId: 4, orgName: '通川区社区卫生服务中心',
    reportMonth: '2026-05', score: 55.8,
    ranking: 7, totalOrgCount: 7,
    totalQcCount: 1010000, totalProblemCount: 80800,
    problemRatio: 8.00, lastMonthProblemRatio: 6.90, problemRatioGrowth: 1.10,
    mostProblemRuleType: '空值检查', mostProblemDataset: '患者基本信息',
    analysis: '【严重警示 · 全市末位】本月数据质量综合评分55.8分，位居全市末位（不含禁用机构大竹县人民医院）。问题占比高达8.00%，整改率仅29.4%，两项指标均为全市最差。数据及时性问题持续恶化，平均上传延迟达6.8天。严重整改要求：①立即启动数据质量专项整改，1周内提交整改方案；②患者基本信息表空值率必须在下月降至20%以下（当前41%）；③增加数据专员岗位或外聘顾问协助整改；④下月综合评分须超过65分，否则将列入重点帮扶名单，由市卫健委协调技术支持。',
    createTime: '2026-05-24 13:00:00',
  },
]

// 动态生成的报告列表（用于POST /api/report/generate后追加）
let generatedReports = []
let nextReportId = 100

/**
 * 生成报告（Mock实现）
 */
export function generateMockReport(orgId, reportMonth) {
  const orgMap = {
    1: { orgName: '达州市中医医院', baseScore: 89, baseProblemRatio: 1.2 },
    2: { orgName: '达州市中心医院', baseScore: 78, baseProblemRatio: 1.9 },
    3: { orgName: '通川区人民医院', baseScore: 93, baseProblemRatio: 0.85 },
    4: { orgName: '通川区社区卫生服务中心', baseScore: 55, baseProblemRatio: 8.5 },
    5: { orgName: '达县人民医院', baseScore: 74, baseProblemRatio: 3.1 },
    6: { orgName: '宣汉县人民医院', baseScore: 62, baseProblemRatio: 5.8 },
    7: { orgName: '开江县中医院', baseScore: 88, baseProblemRatio: 1.15 },
    8: { orgName: '大竹县人民医院', baseScore: 45, baseProblemRatio: 13.5 },
  }
  const org = orgMap[orgId] || { orgName: '未知机构', baseScore: 70, baseProblemRatio: 2.5 }

  // Check if already exists
  const allReports = [...mockMonthlyReports, ...generatedReports]
  const exists = allReports.find(r => r.orgId === Number(orgId) && r.reportMonth === reportMonth)
  if (exists) return { error: '该机构本月报告已生成', report: exists }

  const score = parseFloat((org.baseScore + (Math.random() * 4 - 2)).toFixed(1))
  const problemRatio = parseFloat((org.baseProblemRatio * (0.9 + Math.random() * 0.2)).toFixed(2))
  const totalQcCount = Math.round(800000 + Math.random() * 1600000)

  const newReport = {
    id: nextReportId++,
    orgId: Number(orgId),
    orgName: org.orgName,
    reportMonth,
    score,
    ranking: Math.floor(Math.random() * 7) + 1,
    totalOrgCount: 7,
    totalQcCount,
    totalProblemCount: Math.round(totalQcCount * problemRatio / 100),
    problemRatio,
    lastMonthProblemRatio: parseFloat((problemRatio * (1 + (Math.random() * 0.3 - 0.15))).toFixed(2)),
    problemRatioGrowth: parseFloat((Math.random() * 0.6 - 0.3).toFixed(2)),
    mostProblemRuleType: ['空值检查','值域检查','规范检查','逻辑检查'][Math.floor(Math.random() * 4)],
    mostProblemDataset: ['患者基本信息','门诊就诊记录','住院入院信息'][Math.floor(Math.random() * 3)],
    analysis: `${reportMonth}月质控报告已生成。本月数据质量评分${score}分，问题占比${problemRatio}%。详细分析正在整理中，请关注后续完整分析报告。`,
    createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    isGenerated: true,
  }

  generatedReports.push(newReport)
  return { error: null, report: newReport }
}

export const getAllReports = () => [...mockMonthlyReports, ...generatedReports]

/**
 * 获取报告详情（含统计图表数据）
 */
export function getMockReportDetail(id) {
  const allReports = getAllReports()
  const base = allReports.find(r => r.id === Number(id))
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
