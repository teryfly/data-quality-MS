export const mockTemplates = [
  {
    id: 1, templateName: '患者基本信息质控模板', description: '针对患者基本信息表的标准质控规则集合',
    templateType: 'system', isEnabled: 1, createdBy: 'admin', createTime: '2025-11-20 10:00:00',
    ruleIds: [1, 5, 10, 11, 33, 34],
    rules: [
      { id: 1, ruleName: '患者姓名非空检查', ruleLevel: 1 },
      { id: 5, ruleName: '性别代码值域检查', ruleLevel: 2 },
      { id: 10, ruleName: '身份证号格式检查', ruleLevel: 1 },
      { id: 11, ruleName: '联系电话格式检查', ruleLevel: 2 },
      { id: 33, ruleName: '患者ID唯一性检查', ruleLevel: 1 },
      { id: 34, ruleName: '身份证号唯一性检查', ruleLevel: 1 }
    ]
  },
  {
    id: 2, templateName: '门诊就诊记录质控模板', description: '针对门诊就诊记录表的标准质控规则',
    templateType: 'system', isEnabled: 1, createdBy: 'admin', createTime: '2025-11-20 10:30:00',
    ruleIds: [3, 4, 7, 17, 19, 25],
    rules: [
      { id: 3, ruleName: '诊断代码非空检查', ruleLevel: 2 },
      { id: 4, ruleName: '科室代码非空检查', ruleLevel: 2 },
      { id: 7, ruleName: '就诊类型值域检查', ruleLevel: 2 },
      { id: 17, ruleName: '就诊时间不能晚于当前时间', ruleLevel: 1 },
      { id: 19, ruleName: '就诊患者ID引用检查', ruleLevel: 1 },
      { id: 25, ruleName: '诊断代码与名称一致性', ruleLevel: 2 }
    ]
  },
  {
    id: 3, templateName: '住院信息质控模板', description: '针对住院入院和出院信息的质控规则',
    templateType: 'system', isEnabled: 1, createdBy: 'admin', createTime: '2025-11-20 11:00:00',
    ruleIds: [14, 20, 23],
    rules: [
      { id: 14, ruleName: '出院日期不早于入院日期', ruleLevel: 1 },
      { id: 20, ruleName: '住院患者ID引用检查', ruleLevel: 1 },
      { id: 23, ruleName: '医嘱与医嘱执行完整性', ruleLevel: 2 }
    ]
  },
  {
    id: 4, templateName: '我的质控模板-药品检查', description: '用户自定义的药品相关质控规则',
    templateType: 'user', isEnabled: 1, createdBy: 'org_admin', createTime: '2026-04-15 14:30:00',
    ruleIds: [6, 8, 21],
    rules: [
      { id: 6, ruleName: '民族代码值域检查', ruleLevel: 3 },
      { id: 8, ruleName: '婚姻状况代码值域检查', ruleLevel: 3 },
      { id: 21, ruleName: '处方明细患者引用检查', ruleLevel: 2 }
    ]
  },
  {
    id: 5, templateName: '我的质控模板-检验数据', description: '用户自定义的检验数据质控规则',
    templateType: 'user', isEnabled: 1, createdBy: 'region_admin', createTime: '2026-05-10 09:00:00',
    ruleIds: [28, 29, 31],
    rules: [
      { id: 28, ruleName: '数据生成及时性检查', ruleLevel: 2 },
      { id: 29, ruleName: '检查结果及时上传', ruleLevel: 2 },
      { id: 31, ruleName: '住院患者数量稳定性检查', ruleLevel: 2 }
    ]
  }
]
