export const mockNotifications = [
  {
    id: 1, type: 'recheck_pass',
    title: '[自动复检] 整改复检完成',
    content: '达州市中医医院 / 患者基本信息表 / 患者姓名非空检查的整改复检已通过',
    isRead: 0, createTime: '2026-05-24 14:32:00',
    relatedData: { detailId: 1, resultType: 'recheck', status: 'pass' },
    icon: '✓', iconColor: '#52c41a'
  },
  {
    id: 2, type: 'execute_done',
    title: '[质控完成] 手动执行质控已完成',
    content: '批次 EXEC-20260524-001，发现1234条问题，已完成。点击查看执行日志。',
    isRead: 0, createTime: '2026-05-24 14:30:00',
    relatedData: { executionId: 'EXEC-20260524-001', status: 'done', problemCount: 1234 },
    icon: '⏳', iconColor: '#1890ff'
  },
  {
    id: 3, type: 'sync_done',
    title: '[代码同步] 值域代码库同步完成',
    content: '值域代码库同步完成，新增23个代码集，更新156个代码项。',
    isRead: 1, createTime: '2026-05-24 09:00:00',
    relatedData: { syncType: 'codeset', newCodesets: 23, updatedItems: 156 },
    icon: '✓', iconColor: '#52c41a'
  },
  {
    id: 4, type: 'recheck_fail',
    title: '[自动复检] 整改复检不通过',
    content: '达州市中心医院 / 门诊就诊记录 / 诊断代码非空检查的整改复检未通过，问题依然存在。',
    isRead: 0, createTime: '2026-05-24 13:45:00',
    relatedData: { detailId: 11, resultType: 'recheck', status: 'fail' },
    icon: '✗', iconColor: '#ff4d4f'
  },
  {
    id: 5, type: 'execute_partial_fail',
    title: '[质控执行] 执行部分失败',
    content: '批次 EXEC-20260523-002 执行部分失败，成功13家机构，失败2家。请查看详情。',
    isRead: 1, createTime: '2026-05-24 10:15:00',
    relatedData: { executionId: 'EXEC-20260523-002', successOrgs: 13, failedOrgs: 2 },
    icon: '⚠', iconColor: '#faad14'
  },
  {
    id: 6, type: 'sync_fail',
    title: '[代码同步] 值域代码库同步失败',
    content: '值域代码库同步失败，请检查数据库连接。错误信息：连接超时',
    isRead: 1, createTime: '2026-05-24 08:30:00',
    relatedData: { syncType: 'codeset', error: '连接超时' },
    icon: '✗', iconColor: '#ff4d4f'
  },
  {
    id: 7, type: 'report_ready',
    title: '[报告生成] 月度报告已生成',
    content: '2026年4月份的质量报告已生成，请前往报告模块查看。',
    isRead: 1, createTime: '2026-05-01 02:30:00',
    relatedData: { reportMonth: '2026-04', reportId: 1 },
    icon: '📄', iconColor: '#1890ff'
  }
]
