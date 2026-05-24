export const mockCodesets = [
  {
    id: 1, codesetCode: 'GB_XB', codesetName: '性别代码',
    tableName: 'dict_sex', codeField: 'code', nameField: 'name',
    codeItemCount: 2, source: 'national',
    recognitionMethod: 'auto', status: 'normal',
    items: [
      { code: '1', name: '男', description: '男性' },
      { code: '2', name: '女', description: '女性' }
    ]
  },
  {
    id: 2, codesetCode: 'GB_MZ', codesetName: '民族代码',
    tableName: 'dict_nationality', codeField: 'code', nameField: 'name',
    codeItemCount: 56, source: 'national',
    recognitionMethod: 'auto', status: 'normal',
    items: [
      { code: '01', name: '汉族', description: '汉族' },
      { code: '02', name: '蒙古族', description: '蒙古族' },
      { code: '03', name: '回族', description: '回族' },
      { code: '04', name: '藏族', description: '藏族' },
      { code: '05', name: '维吾尔族', description: '维吾尔族' }
    ]
  },
  {
    id: 3, codesetCode: 'GB_HY', codesetName: '婚姻状况代码',
    tableName: 'dict_marriage', codeField: 'code', nameField: 'name',
    codeItemCount: 5, source: 'national',
    recognitionMethod: 'auto', status: 'normal',
    items: [
      { code: '1', name: '未婚', description: '未婚' },
      { code: '2', name: '已婚', description: '已婚' },
      { code: '3', name: '离异', description: '离异' },
      { code: '4', name: '丧偶', description: '丧偶' },
      { code: '9', name: '不详', description: '不详' }
    ]
  },
  {
    id: 4, codesetCode: 'SC_ZDM', codesetName: '四川省诊断代码',
    tableName: 'dict_diagnosis_sc', codeField: 'icd_code', nameField: 'diagnosis_name',
    codeItemCount: 1200, source: 'province',
    recognitionMethod: 'auto', status: 'normal',
    items: [
      { code: 'J18.9', name: '肺炎', description: '肺炎(ICD-10)' },
      { code: 'K21.0', name: '食管炎', description: '食管炎(ICD-10)' },
      { code: 'J45.0', name: '哮喘', description: '哮喘(ICD-10)' }
    ]
  },
  {
    id: 5, codesetCode: 'HN_YLJGLX', codesetName: '医疗机构类型',
    tableName: 'dict_org_type', codeField: 'code', nameField: 'type_name',
    codeItemCount: 15, source: 'national',
    recognitionMethod: 'auto', status: 'normal',
    items: [
      { code: '1', name: '三级甲等医院', description: '三级甲等医院' },
      { code: '2', name: '三级乙等医院', description: '三级乙等医院' },
      { code: '3', name: '二级甲等医院', description: '二级甲等医院' }
    ]
  },
  {
    id: 6, codesetCode: 'CUSTOM_JZ', codesetName: '自定义就诊类型',
    tableName: 'custom_visit_type', codeField: 'visit_code', nameField: 'visit_name',
    codeItemCount: 8, source: 'custom',
    recognitionMethod: 'manual', status: 'normal',
    items: [
      { code: '1', name: '普通门诊', description: '普通门诊' },
      { code: '2', name: '专家门诊', description: '专家门诊' },
      { code: '3', name: '急诊', description: '急诊' }
    ]
  },
  {
    id: 7, codesetCode: 'CUSTOM_KS', codesetName: '自定义科室代码',
    tableName: 'custom_department', codeField: 'dept_code', nameField: 'dept_name',
    codeItemCount: 45, source: 'custom',
    recognitionMethod: 'manual', status: 'normal',
    items: [
      { code: '001', name: '内科', description: '内科' },
      { code: '002', name: '外科', description: '外科' },
      { code: '003', name: '妇产科', description: '妇产科' }
    ]
  },
  {
    id: 8, codesetCode: 'CUSTOM_LB', codesetName: '自定义疾病分类',
    tableName: 'custom_disease_type', codeField: 'type_code', nameField: 'type_name',
    codeItemCount: 20, source: 'custom',
    recognitionMethod: 'manual', status: 'normal',
    items: [
      { code: 'A', name: '传染病', description: '传染病' },
      { code: 'B', name: '慢性病', description: '慢性病' },
      { code: 'C', name: '遗传病', description: '遗传病' }
    ]
  },
  {
    id: 9, codesetCode: 'GB_GJ', codesetName: '国籍代码',
    tableName: 'dict_country', codeField: 'code', nameField: 'name',
    codeItemCount: 250, source: 'national',
    recognitionMethod: 'auto', status: 'normal',
    items: [
      { code: '156', name: '中国', description: '中华人民共和国' },
      { code: '840', name: '美国', description: '美利坚合众国' }
    ]
  },
  {
    id: 10, codesetCode: 'CUSTOM_YX', codesetName: '自定义用药信息',
    tableName: 'custom_medicine_info', codeField: 'medicine_code', nameField: 'medicine_name',
    codeItemCount: 500, source: 'custom',
    recognitionMethod: 'manual', status: 'normal',
    items: [
      { code: 'AMOX', name: '阿莫西林', description: '青霉素类抗生素' },
      { code: 'METR', name: '甲硝唑', description: '硝基咪唑类药物' }
    ]
  }
]
