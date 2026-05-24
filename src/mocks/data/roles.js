export const mockRoles = [
  {
    id: 1,
    roleName: '超级管理员',
    description: '系统最高权限，可管理所有数据和用户',
    dataScope: 1,
    permissions: ['datasource:view','datasource:add','datasource:edit','datasource:delete',
      'datasource:sync','dataset:view','dataset:edit','dataset:sync',
      'rule:view','rule:add','rule:edit','rule:delete','rule:test',
      'rule:export','rule:import','rule:batch-enable','rule:execute',
      'template:apply','result:view','result:export','result:fix',
      'report:view','report:export','system:org','system:user','system:role',
      'upload:view','upload:export','codeset:calibrate']
  },
  {
    id: 2,
    roleName: '区域管理员',
    description: '管理本区县数据和用户，可管理质控规则',
    dataScope: 2,
    permissions: ['rule:view','rule:add','rule:edit','rule:delete','rule:test',
      'rule:export','rule:import','rule:batch-enable','rule:execute',
      'template:apply','result:view','result:export','result:fix',
      'report:view','report:export','system:org','system:user',
      'upload:view','upload:export']
  },
  {
    id: 3,
    roleName: '机构管理员',
    description: '管理本机构数据和用户，可管理质控规则',
    dataScope: 3,
    permissions: ['rule:view','rule:add','rule:edit','rule:test',
      'result:view','result:export','result:fix',
      'report:view','report:export','system:user',
      'upload:view','upload:export']
  },
  {
    id: 4,
    roleName: '普通用户',
    description: '只读权限，可查看质控结果和报告',
    dataScope: 3,
    permissions: ['result:view','report:view','upload:view']
  }
]
