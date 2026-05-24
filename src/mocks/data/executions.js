export const mockExecutions = [
  {
    id: 1, executionId: 'EXEC-20260524-001', triggerType: 'manual',
    scope: '全部规则', startTime: '2026-05-24 14:30:00', endTime: '2026-05-24 14:35:42',
    duration: '5分42秒', status: 'success', totalRules: 35, problemCount: 1234,
    successOrgs: 8, failedOrgs: 0, successRules: 35, failedRules: 0
  },
  {
    id: 2, executionId: 'EXEC-20260523-002', triggerType: 'scheduled',
    scope: '指定分类：空值检查,值域检查', startTime: '2026-05-23 00:30:00', endTime: '2026-05-23 02:15:30',
    duration: '1小时45分30秒', status: 'partial_fail', totalRules: 15, problemCount: 856,
    successOrgs: 6, failedOrgs: 2, successRules: 14, failedRules: 1
  },
  {
    id: 3, executionId: 'EXEC-20260522-003', triggerType: 'manual',
    scope: '指定规则：患者姓名非空检查,身份证号格式检查', startTime: '2026-05-22 10:00:00', endTime: '2026-05-22 10:08:15',
    duration: '8分15秒', status: 'success', totalRules: 2, problemCount: 234,
    successOrgs: 8, failedOrgs: 0, successRules: 2, failedRules: 0
  },
  {
    id: 4, executionId: 'EXEC-20260521-004', triggerType: 'scheduled',
    scope: '全部规则', startTime: '2026-05-21 00:30:00', endTime: '2026-05-21 02:50:00',
    duration: '2小时20分', status: 'success', totalRules: 35, problemCount: 1567,
    successOrgs: 7, failedOrgs: 1, successRules: 34, failedRules: 1
  },
  {
    id: 5, executionId: 'EXEC-20260520-005', triggerType: 'manual',
    scope: '全部规则', startTime: '2026-05-20 14:00:00', endTime: '2026-05-20 14:25:30',
    duration: '25分30秒', status: 'failed', totalRules: 35, problemCount: 0,
    successOrgs: 0, failedOrgs: 8, successRules: 0, failedRules: 35
  }
]

export const mockExecutionDetails = {
  'EXEC-20260524-001': {
    executionId: 'EXEC-20260524-001',
    status: 'success',
    startTime: '2026-05-24 14:30:00',
    progress: 100,
    orgProgress: [
      { orgName: '达州市中医医院', status: 'done', execRules: '35/35', problemCount: 234, duration: '2m14s' },
      { orgName: '达州市中心医院', status: 'done', execRules: '35/35', problemCount: 156, duration: '1m43s' },
      { orgName: '通川区人民医院', status: 'done', execRules: '35/35', problemCount: 189, duration: '2m05s' },
      { orgName: '通川区社区卫生服务中心', status: 'done', execRules: '35/35', problemCount: 87, duration: '1m20s' },
      { orgName: '达县人民医院', status: 'done', execRules: '35/35', problemCount: 145, duration: '1m58s' },
      { orgName: '宣汉县人民医院', status: 'done', execRules: '35/35', problemCount: 201, duration: '2m30s' },
      { orgName: '开江县中医院', status: 'done', execRules: '35/35', problemCount: 112, duration: '1m25s' },
      { orgName: '大竹县人民医院', status: 'done', execRules: '35/35', problemCount: 112, duration: '1m31s' }
    ],
    logs: [
      '[14:30:01] 开始执行批次 EXEC-20260524-001',
      '[14:30:02] 机构 达州市中医医院 开始执行，共 35 条规则',
      '[14:30:04] [达州市中医医院] 患者姓名非空检查 执行完成，问题数: 12',
      '[14:30:06] [达州市中医医院] 性别代码值域检查 执行完成，问题数: 8',
      '[14:30:08] [达州市中医医院] 身份证号格式检查 执行完成，问题数: 24',
      '[14:30:15] 机构 达州市中心医院 开始执行，共 35 条规则',
      '[14:32:30] 所有机构执行完成，共发现 1234 条问题',
      '[14:35:42] 执行批次 EXEC-20260524-001 完成'
    ]
  }
}
