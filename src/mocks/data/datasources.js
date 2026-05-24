export const mockDataSources = [
  {
    id: 1,
    sourceName: '业务中心库',
    sourceType: 'business',
    dbType: 'MySQL',
    ip: '192.168.1.100',
    port: 3306,
    dbName: 'his_center',
    username: 'his_user',
    password: 'encrypted_password_123',
    status: 1,
    connectStatus: 1, // 1连通 0断开 -1未验证
    createTime: '2025-11-20 10:30:00',
    lastSyncTime: '2026-05-24 02:30:00'
  },
  {
    id: 2,
    sourceName: '值域代码库',
    sourceType: 'code',
    dbType: 'PostgreSQL',
    ip: '192.168.1.101',
    port: 5432,
    dbName: 'code_repo',
    username: 'code_user',
    password: 'encrypted_password_456',
    status: 1,
    connectStatus: 1,
    syncFrequency: 'weekly',
    createTime: '2025-11-20 11:00:00',
    lastSyncTime: '2026-05-23 18:30:00'
  }
]
