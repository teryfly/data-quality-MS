export const mockUsers = [
  // 超级管理员
  { id: 1, username: 'admin', password: 'Admin@123',
    userId: 1, orgId: 0, orgCode: '', orgName: '系统管理员',
    roleId: 1, roleName: '超级管理员', dataScope: 1,
    realName: '张超管', phone: '13800000001',
    permissions: ['datasource:view','datasource:add','datasource:edit','datasource:delete',
      'datasource:sync','dataset:view','dataset:edit','dataset:sync',
      'rule:view','rule:add','rule:edit','rule:delete','rule:test',
      'rule:export','rule:import','rule:batch-enable','rule:execute',
      'template:apply','result:view','result:export','result:fix',
      'report:view','report:export','system:org','system:user','system:role',
      'upload:view','upload:export','codeset:calibrate'] },

  // 区域管理员
  { id: 2, username: 'region_admin', password: 'Admin@123',
    userId: 2, orgId: 0, orgCode: '', orgName: '达州市卫健委',
    roleId: 2, roleName: '区域管理员', dataScope: 2,
    realName: '李区管', phone: '13800000002',
    permissions: ['rule:view','rule:add','rule:edit','rule:delete','rule:test',
      'rule:export','rule:import','rule:batch-enable','rule:execute',
      'template:apply','result:view','result:export','result:fix',
      'report:view','report:export','system:org','system:user',
      'upload:view','upload:export'] },

  // 机构管理员
  { id: 3, username: 'org_admin', password: 'Admin@123',
    userId: 3, orgId: 1, orgCode: '511700001', orgName: '达州市中医医院',
    roleId: 3, roleName: '机构管理员', dataScope: 3,
    realName: '王机管', phone: '13800000003',
    permissions: ['rule:view','rule:add','rule:edit','rule:test',
      'result:view','result:export','result:fix',
      'report:view','report:export','system:user',
      'upload:view','upload:export'] },

  // 普通用户
  { id: 4, username: 'user', password: 'Admin@123',
    userId: 4, orgId: 1, orgCode: '511700001', orgName: '达州市中医医院',
    roleId: 4, roleName: '普通用户', dataScope: 3,
    realName: '陈小员', phone: '13800000004',
    permissions: ['result:view','report:view','upload:view'] },

  // 额外用户（超级管理员角色）
  { id: 5, username: 'super_user1', password: 'Admin@123',
    userId: 5, orgId: 0, orgCode: '', orgName: '系统管理员',
    roleId: 1, roleName: '超级管理员', dataScope: 1,
    realName: '刘超管', phone: '13800000005',
    permissions: ['datasource:view','datasource:add','datasource:edit','datasource:delete',
      'datasource:sync','dataset:view','dataset:edit','dataset:sync',
      'rule:view','rule:add','rule:edit','rule:delete','rule:test',
      'rule:export','rule:import','rule:batch-enable','rule:execute',
      'template:apply','result:view','result:export','result:fix',
      'report:view','report:export','system:org','system:user','system:role',
      'upload:view','upload:export','codeset:calibrate'] },

  // 额外区域管理员
  { id: 6, username: 'region_admin2', password: 'Admin@123',
    userId: 6, orgId: 0, orgCode: '', orgName: '达州市卫生局',
    roleId: 2, roleName: '区域管理员', dataScope: 2,
    realName: '王区管', phone: '13800000006',
    permissions: ['rule:view','rule:add','rule:edit','rule:delete','rule:test',
      'rule:export','rule:import','rule:batch-enable','rule:execute',
      'template:apply','result:view','result:export','result:fix',
      'report:view','report:export','system:org','system:user',
      'upload:view','upload:export'] },

  // 额外机构管理员
  { id: 7, username: 'org_admin2', password: 'Admin@123',
    userId: 7, orgId: 2, orgCode: '511700002', orgName: '达州市中心医院',
    roleId: 3, roleName: '机构管理员', dataScope: 3,
    realName: '李机管', phone: '13800000007',
    permissions: ['rule:view','rule:add','rule:edit','rule:test',
      'result:view','result:export','result:fix',
      'report:view','report:export','system:user',
      'upload:view','upload:export'] },

  // 额外普通用户
  { id: 8, username: 'user2', password: 'Admin@123',
    userId: 8, orgId: 2, orgCode: '511700002', orgName: '达州市中心医院',
    roleId: 4, roleName: '普通用户', dataScope: 3,
    realName: '张小员', phone: '13800000008',
    permissions: ['result:view','report:view','upload:view'] },

  { id: 9, username: 'user3', password: 'Admin@123',
    userId: 9, orgId: 3, orgCode: '511703001', orgName: '通川区人民医院',
    roleId: 4, roleName: '普通用户', dataScope: 3,
    realName: '刘小员', phone: '13800000009',
    permissions: ['result:view','report:view','upload:view'] },

  { id: 10, username: 'user4', password: 'Admin@123',
    userId: 10, orgId: 4, orgCode: '511703002', orgName: '通川区社区卫生服务中心',
    roleId: 4, roleName: '普通用户', dataScope: 3,
    realName: '周小员', phone: '13800000010',
    permissions: ['result:view','report:view','upload:view'] }
]
