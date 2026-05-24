// Generate elements for multiple datasets
const generateElementsForDataset = (datasetId, datasetName, fieldCount = 25) => {
  const elements = []
  const commonFields = [
    { fieldName: '机构代码', fieldCode: 'YLJGDM', fieldType: 'string', isRequired: 1 },
    { fieldName: '创建时间', fieldCode: 'CJSJ', fieldType: 'datetime', isRequired: 1 },
    { fieldName: '更新时间', fieldCode: 'GXSJ', fieldType: 'datetime', isRequired: 0 },
    { fieldName: '操作员', fieldCode: 'CZY', fieldType: 'string', isRequired: 0 },
  ]
  const datasetSpecificFields = {
    'mz_jzjl': [
      { fieldName: '就诊流水号', fieldCode: 'JZLSH', fieldType: 'string', isRequired: 1 },
      { fieldName: '患者ID', fieldCode: 'BRID', fieldType: 'number', isRequired: 1 },
      { fieldName: '就诊时间', fieldCode: 'JZSJ', fieldType: 'datetime', isRequired: 1 },
      { fieldName: '科室代码', fieldCode: 'KSDM', fieldType: 'string', isRequired: 1 },
      { fieldName: '医生姓名', fieldCode: 'YSXM', fieldType: 'string', isRequired: 1 },
      { fieldName: '初诊标志', fieldCode: 'CSXBZ', fieldType: 'string', isRequired: 0 },
      { fieldName: '就诊类型', fieldCode: 'JZLX', fieldType: 'string', isRequired: 1 },
      { fieldName: '转诊来源', fieldCode: 'ZZLY', fieldType: 'string', isRequired: 0 },
      { fieldName: '门诊号', fieldCode: 'MZH', fieldType: 'string', isRequired: 1 },
      { fieldName: '主诉', fieldCode: 'ZZ', fieldType: 'string', isRequired: 1 },
      { fieldName: '现病史', fieldCode: 'XBS', fieldType: 'string', isRequired: 0 },
      { fieldName: '既往史', fieldCode: 'JWS', fieldType: 'string', isRequired: 0 },
      { fieldName: '家族史', fieldCode: 'JZS', fieldType: 'string', isRequired: 0 },
      { fieldName: '过敏史', fieldCode: 'GMS', fieldType: 'string', isRequired: 0 },
      { fieldName: '个人史', fieldCode: 'GRS', fieldType: 'string', isRequired: 0 },
      { fieldName: '诊断代码', fieldCode: 'ZDDM', fieldType: 'string', isRequired: 1 },
      { fieldName: '诊断名称', fieldCode: 'ZDMC', fieldType: 'string', isRequired: 1 },
      { fieldName: '诊断类型', fieldCode: 'ZDLX', fieldType: 'string', isRequired: 0 },
      { fieldName: '是否初诊', fieldCode: 'SFCZ', fieldType: 'string', isRequired: 0 },
      { fieldName: '转归代码', fieldCode: 'ZCDM', fieldType: 'string', isRequired: 0 },
    ],
    'jbxx_brxx': [
      { fieldName: '患者ID', fieldCode: 'BRID', fieldType: 'number', isRequired: 1 },
      { fieldName: '患者姓名', fieldCode: 'XM', fieldType: 'string', isRequired: 1 },
      { fieldName: '性别代码', fieldCode: 'XBM', fieldType: 'string', isRequired: 1 },
      { fieldName: '出生日期', fieldCode: 'CSRQ', fieldType: 'date', isRequired: 1 },
      { fieldName: '身份证号', fieldCode: 'SFZHM', fieldType: 'string', isRequired: 1 },
      { fieldName: '身份证有效期开始', fieldCode: 'SFZHYXQKS', fieldType: 'date', isRequired: 0 },
      { fieldName: '身份证有效期结束', fieldCode: 'SFZHYXQJS', fieldType: 'date', isRequired: 0 },
      { fieldName: '民族代码', fieldCode: 'MZDM', fieldType: 'string', isRequired: 0 },
      { fieldName: '国籍代码', fieldCode: 'GJDM', fieldType: 'string', isRequired: 0 },
      { fieldName: '婚姻状况代码', fieldCode: 'HYZKDM', fieldType: 'string', isRequired: 0 },
      { fieldName: '职业代码', fieldCode: 'ZYDM', fieldType: 'string', isRequired: 0 },
      { fieldName: '所在科室', fieldCode: 'SZKS', fieldType: 'string', isRequired: 0 },
      { fieldName: '工作单位', fieldCode: 'GZDW', fieldType: 'string', isRequired: 0 },
      { fieldName: '联系电话', fieldCode: 'LXDH', fieldType: 'string', isRequired: 0 },
      { fieldName: '邮箱', fieldCode: 'YX', fieldType: 'string', isRequired: 0 },
      { fieldName: '家庭住址', fieldCode: 'JTZZ', fieldType: 'string', isRequired: 0 },
      { fieldName: '省份代码', fieldCode: 'SFDM', fieldType: 'string', isRequired: 0 },
      { fieldName: '市级代码', fieldCode: 'SJDM', fieldType: 'string', isRequired: 0 },
      { fieldName: '县区代码', fieldCode: 'XQDM', fieldType: 'string', isRequired: 0 },
      { fieldName: '身份证号是否有效', fieldCode: 'SFZHHSYXIAO', fieldType: 'string', isRequired: 0 },
    ]
  }

  const specificFields = datasetSpecificFields[datasetName] || []
  const allFields = [...specificFields, ...commonFields]

  return allFields.slice(0, Math.max(20, fieldCount)).map((field, idx) => ({
    id: `${datasetId}-${idx}`,
    datasetId,
    elementName: field.fieldName,
    elementCode: field.fieldCode,
    elementType: field.fieldType,
    isRequired: field.isRequired,
    remark: `字段描述: ${field.fieldName}`
  }))
}

export const mockElements = [
  ...generateElementsForDataset(1, 'mz_jzjl', 25),
  ...generateElementsForDataset(5, 'jbxx_brxx', 25),
  ...generateElementsForDataset(2, 'zy_ryxx', 22),
  ...generateElementsForDataset(3, 'zy_cyxx', 22),
  ...generateElementsForDataset(4, 'zy_basy', 20),
  ...generateElementsForDataset(6, 'mz_cf_main', 20),
  ...generateElementsForDataset(7, 'mz_cf_detail', 21),
  ...generateElementsForDataset(8, 'zy_yzxx', 20),
  ...generateElementsForDataset(9, 'jc_jcjg', 20),
  ...generateElementsForDataset(10, 'ss_ssxx', 20),
  ...generateElementsForDataset(11, 'zy_jxxs', 21),
  ...generateElementsForDataset(12, 'mz_zbxz', 20),
  ...generateElementsForDataset(13, 'zy_zbxz', 20),
  ...generateElementsForDataset(14, 'jbxx_lxxx', 20),
  ...generateElementsForDataset(15, 'zy_czxx', 20),
  ...generateElementsForDataset(16, 'mz_cfml', 20),
  ...generateElementsForDataset(17, 'jc_yqxx', 20),
  ...generateElementsForDataset(18, 'zl_zyxx', 20),
  ...generateElementsForDataset(19, 'yz_yzxs', 21),
  ...generateElementsForDataset(20, 'jc_jcfx', 20),
]
