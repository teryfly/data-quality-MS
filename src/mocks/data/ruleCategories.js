export const mockRuleCategories = [
  { id: 1, categoryName: '空值检查', description: '检查必填字段是否为空或null', priority: 1, sortOrder: 1 },
  { id: 2, categoryName: '值域检查', description: '检查字段值是否符合规范代码或取值范围', priority: 1, sortOrder: 2 },
  { id: 3, categoryName: '规范检查', description: '检查字段格式是否符合规范（身份证、电话等）', priority: 2, sortOrder: 3 },
  { id: 4, categoryName: '逻辑检查', description: '检查数据之间的逻辑关系是否合理（日期比较、条件检查等）', priority: 2, sortOrder: 4 },
  { id: 5, categoryName: '关联性检查', description: '检查数据与其他表的关联关系是否有效（外键检查等）', priority: 2, sortOrder: 5 },
  { id: 6, categoryName: '完整性检查', description: '检查主从表记录数、关键信息是否完整', priority: 2, sortOrder: 6 },
  { id: 7, categoryName: '一致性检查', description: '检查相关字段之间的取值一致性（代码与名称、跨表一致等）', priority: 3, sortOrder: 7 },
  { id: 8, categoryName: '及时性检查', description: '检查数据生成的及时性（业务时间与更新时间差值）', priority: 3, sortOrder: 8 },
  { id: 9, categoryName: '稳定性检查', description: '检查数据量、分布等是否稳定（波动检查、趋势异常等）', priority: 3, sortOrder: 9 },
  { id: 10, categoryName: '唯一性检查', description: '检查单字段或多字段唯一性约束', priority: 2, sortOrder: 10 }
]
